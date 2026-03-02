const mongoose = require('mongoose');

const LocalSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    pais: { type: String, required: true },
    provincia: { type: String, required: true },
    ciudad: { type: String, required: true },
    direccion: { type: String, required: true },
    vendedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number] // [Longitud, Latitud]
    }
});

LocalSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Local', LocalSchema);