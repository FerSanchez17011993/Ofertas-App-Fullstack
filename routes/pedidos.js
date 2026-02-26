const express = require('express');
const router = express.Router();
const Pedido = require('../models/Pedido');
const Oferta = require('../models/Oferta');
const Local = require('../models/Local');

// --- 1. CREAR PEDIDO ---
router.post('/', async (req, res) => {
    try {
        const { cliente, local, items, total, costoEnvio, puntoEntrega } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "El carrito está vacío" });
        }

        const itemsFormateados = items.map(item => ({
            productoId: item._id || item.productoId, 
            productoNombre: item.producto || item.productoNombre,
            precio: item.precioNuevo || item.precio,
            cantidad: item.cantidad || 1
        }));

        const nuevoPedido = new Pedido({
            cliente,
            local,
            items: itemsFormateados,
            total,
            costoEnvio,
            puntoEntrega,
            estado: 'camino' 
        });

        const pedidoGuardado = await nuevoPedido.save();

        // Descontar stock
        await Promise.all(itemsFormateados.map(async (item) => {
            if (item.productoId) {
                await Oferta.findByIdAndUpdate(
                    item.productoId, 
                    { $inc: { stock: -item.cantidad } }
                );
            }
        }));
        
        res.status(201).json(pedidoGuardado);
    } catch (error) {
        console.error("Error al crear pedido:", error);
        res.status(500).json({ error: 'Error al crear pedido' });
    }
});

// --- 2. HISTORIAL PARA EL CLIENTE (ESTA FALTABA) ---
router.get('/cliente/:clienteId', async (req, res) => {
    try {
        const pedidos = await Pedido.find({ cliente: req.params.clienteId })
            .populate('local', 'nombre direccion')
            .sort({ createdAt: -1 });
        res.json(pedidos);
    } catch (error) {
        console.error("Error al obtener pedidos del cliente:", error);
        res.status(500).json({ error: 'Error al obtener historial' });
    }
});

// --- 3. HISTORIAL PARA EL VENDEDOR ---
router.get('/vendedor/:vendedorId', async (req, res) => {
    try {
        const localesVendedor = await Local.find({ vendedorId: req.params.vendedorId });
        if (!localesVendedor.length) return res.json([]);

        const idsLocales = localesVendedor.map(l => l._id);
        const pedidos = await Pedido.find({ local: { $in: idsLocales } })
            .populate('cliente', 'nombre correo') 
            .populate('local', 'nombre')
            .sort({ createdAt: -1 });
            
        res.json(pedidos);
    } catch (error) {
        console.error("Error historial vendedor:", error);
        res.status(500).json({ error: 'Error al obtener ventas' });
    }
});

// --- 4. ACTUALIZAR ESTADO (Para auto-entrega o cancelación) ---
router.patch('/:id/estado', async (req, res) => {
    try {
        const { estado } = req.body;
        const pedidoAnterior = await Pedido.findById(req.params.id);

        if (!pedidoAnterior) return res.status(404).json({ error: 'Pedido no encontrado' });

        // Si se cancela, devolvemos el stock
        if (estado === 'cancelado' && pedidoAnterior.estado !== 'cancelado') {
            await Promise.all(pedidoAnterior.items.map(async (item) => {
                if (item.productoId) {
                    await Oferta.findByIdAndUpdate(item.productoId, { $inc: { stock: item.cantidad } });
                }
            }));
        }

        const pedidoActualizado = await Pedido.findByIdAndUpdate(
            req.params.id, 
            { $set: { estado } }, 
            { new: true }
        );

        res.json(pedidoActualizado);
    } catch (error) {
        console.error("Error al actualizar estado:", error);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
});

module.exports = router;