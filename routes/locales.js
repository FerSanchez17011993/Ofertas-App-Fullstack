const express = require('express');
const router = express.Router();
const Local = require('../models/Local');
const Oferta = require('../models/Oferta');
const mongoose = require('mongoose');

// --- CREAR LOCAL (CON PAÍS Y PROVINCIA) ---
router.post('/', async (req, res) => {
    try {
        // Extraemos todos los campos nuevos del body
        const { nombre, pais, provincia, ciudad, direccion, vendedorId, lng, lat } = req.body;

        console.log("📥 Recibiendo nuevo local:", { nombre, ciudad, pais });

        // Validación extendida
        if (!nombre || !vendedorId || !pais || !provincia || lat === undefined || lng === undefined) {
            return res.status(400).json({ 
                error: 'Faltan datos obligatorios: nombre, país, provincia, vendedorId o coordenadas' 
            });
        }

        const nuevoLocal = new Local({
            nombre,
            pais,         // <--- Nuevo campo
            provincia,    // <--- Nuevo campo
            ciudad,
            direccion,
            vendedorId: new mongoose.Types.ObjectId(vendedorId),
            location: {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)] // [Longitud, Latitud]
            }
        });

        const guardado = await nuevoLocal.save();
        console.log("✅ Local guardado con éxito ID:", guardado._id);
        res.status(201).json(guardado);

    } catch (error) {
        console.error("❌ Error al guardar local:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- OBTENER LOCALES POR VENDEDOR ---
router.get('/vendedor/:vendedorId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.vendedorId)) {
            return res.status(400).json({ error: 'ID de vendedor no válido' });
        }
        // Buscamos y ordenamos por el más reciente
        const locales = await Local.find({ vendedorId: req.params.vendedorId }).sort({ _id: -1 });
        res.json(locales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ELIMINAR LOCAL Y SUS OFERTAS (CASCADA) ---
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de local no válido' });
        }
        
        // Primero borramos todas las ofertas que pertenecen a este local
        await Oferta.deleteMany({ local: id });
        
        // Luego borramos el local
        const eliminado = await Local.findByIdAndDelete(id);
        
        if (!eliminado) return res.status(404).json({ error: 'Local no encontrado' });
        
        res.json({ mensaje: 'Local y sus ofertas eliminados correctamente' });
    } catch (error) {
        console.error("❌ Error al eliminar local:", error);
        res.status(500).json({ error: 'Error al eliminar el local' });
    }
});

module.exports = router;