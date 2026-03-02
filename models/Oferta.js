const mongoose = require('mongoose');

const OfertaSchema = new mongoose.Schema({
  producto: { type: String, required: true },
  marca: { type: String, default: "" }, // <--- CAMPO NUEVO
  precioNuevo: { type: Number, required: true },
  precioViejo: { type: Number, required: true },
  stock: { type: Number, required: true },
  peso: { type: Number, default: 0 },
  limitePorCliente: { type: Number, default: 3 },
  fechaVencimiento: { type: Date }, 
  publicId: { type: String, required: false },
  local: { type: mongoose.Schema.Types.ObjectId, ref: 'Local', required: true },
  categoria: { type: String, required: true, default: 'Almacén' },
  publicado: { type: Boolean, default: false },
  fechaInicioOferta: { type: Date },
  fechaFinOferta: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Oferta', OfertaSchema);