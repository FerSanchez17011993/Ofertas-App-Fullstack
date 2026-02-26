const mongoose = require('mongoose');

const GaleriaSchema = new mongoose.Schema({
  nombreReferencia: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true 
  },
  publicId: { type: String, required: true },
  url: { type: String, required: true },
  formato: { type: String }, // jpg, png, etc.
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Galeria', GaleriaSchema);