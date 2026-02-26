const express = require('express');
const router = express.Router(); // <--- ESTA ES LA LÍNEA QUE FALTABA
const Local = require('../models/Local');
const Oferta = require('../models/Oferta');
const mongoose = require('mongoose');

// CREAR LOCAL
router.post('/', async (req, res) => {
    try {
        const { nombre, direccion, ciudad, vendedorId, lng, lat } = req.body;

        console.log("📥 Datos recibidos en el servidor:", { nombre, lng, lat });

        // Validación de seguridad
        if (!nombre || !vendedorId || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: 'Faltan datos: nombre, vendedorId o coordenadas' });
        }

        const nuevoLocal = new Local({
            nombre,
            direccion,
            ciudad: ciudad || "",
            vendedorId: new mongoose.Types.ObjectId(vendedorId),
            location: {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)] // [Longitud, Latitud]
            }
        });

        const guardado = await nuevoLocal.save();
        console.log("✅ Local guardado en Atlas con coordenadas:", guardado.location.coordinates);
        res.status(201).json(guardado);

    } catch (error) {
        console.error("❌ Error al guardar local:", error);
        res.status(500).json({ error: error.message });
    }
});

// OBTENER LOCALES POR VENDEDOR
router.get('/vendedor/:vendedorId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.vendedorId)) {
            return res.status(400).json({ error: 'ID de vendedor no válido' });
        }
        const locales = await Local.find({ vendedorId: req.params.vendedorId }).sort({ _id: -1 });
        res.json(locales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ELIMINAR LOCAL Y SUS OFERTAS
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de local no válido' });
        }
        
        // Limpieza en cascada
        await Oferta.deleteMany({ local: id });
        const eliminado = await Local.findByIdAndDelete(id);
        
        if (!eliminado) return res.status(404).json({ error: 'Local no encontrado' });
        
        res.json({ mensaje: 'Local y sus ofertas eliminados correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el local' });
    }
});

module.exports = router;