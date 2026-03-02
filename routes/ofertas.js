const express = require('express');
const router = express.Router();
const Oferta = require('../models/Oferta');

// 1. OBTENER TODAS LAS OFERTAS (Para PanelCliente.js)
router.get('/', async (req, res) => {
    try {
        const ofertas = await Oferta.find()
            .populate('local', 'nombre direccion location') 
            .sort({ createdAt: -1 });
        res.json(ofertas);
    } catch (error) {
        console.error("Error al obtener ofertas globales:", error);
        res.status(500).json({ error: 'Error al obtener ofertas globales' });
    }
});

// 2. OBTENER OFERTAS DE UN LOCAL (Para GestionOfertas.js)
router.get('/local/:localId', async (req, res) => {
    try {
        const { localId } = req.params;
        const ofertas = await Oferta.find({ local: localId });
        res.json(ofertas);
    } catch (error) {
        console.error("Error al obtener ofertas del local:", error);
        res.status(500).json({ error: 'Error al obtener ofertas del local' });
    }
});

// 3. CARGA MASIVA / SINCRONIZACIÓN (Guardar Cambios con Marca)
router.post('/bulk', async (req, res) => {
    try {
        const { productos, localId } = req.body;
        
        if (!localId) return res.status(400).json({ error: "Falta localId" });

        // Limpiamos ofertas previas para evitar duplicados
        await Oferta.deleteMany({ local: localId });

        const ofertasFinales = productos
            .filter(p => p.producto && p.producto.trim() !== "") 
            .map(p => ({ 
                producto: p.producto,
                marca: p.marca || "", // <--- CAPTURA DE MARCA
                precioNuevo: Number(p.precioNuevo) || 0,
                precioViejo: Number(p.precioViejo) || Number(p.precioNuevo) || 0,
                stock: Number(p.stock) || 0,
                categoria: p.categoria || 'Almacén',
                publicId: p.publicId || null,
                local: localId,
                publicado: true,
                fechaInicioOferta: p.fechaInicioOferta,
                fechaFinOferta: p.fechaFinOferta
            }));

        const resultados = await Oferta.insertMany(ofertasFinales);
        res.status(201).json({ mensaje: `Sincronizados ${resultados.length} productos con marcas` });
    } catch (error) {
        console.error("Error en bulk upload:", error);
        res.status(500).json({ error: error.message });
    }
});

// 4. ELIMINAR INDIVIDUAL
router.delete('/:id', async (req, res) => {
    try {
        await Oferta.findByIdAndDelete(req.params.id);
        res.json({ mensaje: 'Oferta eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

module.exports = router;