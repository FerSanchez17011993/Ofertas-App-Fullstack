const mongoose = require('mongoose');

const LocalSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    direccion: { type: String, required: true },
    ciudad: { type: String, default: "" },
    vendedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Estructura GeoJSON estándar simplificada
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number] // Array de números: [longitud, latitud]
    }
});

// Índice geoespacial
LocalSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Local', LocalSchema);