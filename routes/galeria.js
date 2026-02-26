const express = require('express');
const router = express.Router();
const Galeria = require('../models/Galeria'); // Importa tu modelo de Galeria

// @route   GET /api/galeria
// @desc    Obtener todas las imágenes guardadas en la base de datos
router.get('/', async (req, res) => {
  try {
    const imagenes = await Galeria.find().sort({ fechaCreacion: -1 });
    res.json(imagenes);
  } catch (err) {
    console.error("Error al obtener galería:", err);
    res.status(500).json({ mensaje: "Error al obtener las imágenes" });
  }
});

// @route   POST /api/galeria
// @desc    Registrar una nueva imagen (la que subes desde SubirImagenes.js)
router.post('/', async (req, res) => {
  try {
    const nuevaImagen = new Galeria({
      nombreReferencia: req.body.nombreReferencia,
      publicId: req.body.publicId,
      url: req.body.url,
      formato: req.body.formato
    });

    const guardada = await nuevaImagen.save();
    res.status(201).json(guardada);
  } catch (err) {
    console.error("Error al guardar en galería:", err);
    res.status(400).json({ mensaje: "Error al registrar la imagen", error: err.message });
  }
});

// @route   DELETE /api/galeria/all
// @desc    VACIAR TODA LA COLECCIÓN (El botón de pánico que pediste)
// IMPORTANTE: Esta ruta debe ir ANTES de la ruta /:id para que Express no confunda "all" con un ID
router.delete('/all', async (req, res) => {
  try {
    const resultado = await Galeria.deleteMany({});
    res.json({ 
      mensaje: "Biblioteca vaciada correctamente", 
      eliminados: resultado.deletedCount 
    });
  } catch (err) {
    console.error("Error al vaciar biblioteca:", err);
    res.status(500).json({ mensaje: "Error al vaciar la base de datos" });
  }
});

// @route   DELETE /api/galeria/:id
// @desc    Borrar una sola imagen de la base de datos
router.delete('/:id', async (req, res) => {
  try {
    const imagen = await Galeria.findById(req.params.id);
    if (!imagen) {
      return res.status(404).json({ mensaje: "Imagen no encontrada" });
    }

    await Galeria.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Registro eliminado de la galería" });
  } catch (err) {
    console.error("Error al borrar registro:", err);
    res.status(500).json({ mensaje: "Error al eliminar el registro" });
  }
});

module.exports = router;