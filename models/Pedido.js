const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
    cliente: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    local: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Local', 
        required: true 
    },
    items: [{
        productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Oferta' }, 
        productoNombre: { type: String, required: true },
        precio: { type: Number, required: true },
        cantidad: { type: Number, default: 1 }
    }],
    total: { 
        type: Number, 
        required: true 
    },
    costoEnvio: {
        type: Number,
        default: 800
    },
    estado: { 
        type: String, 
        enum: ['pendiente', 'proceso', 'camino', 'completado', 'cancelado'], 
        default: 'pendiente' 
    },
    puntoEntrega: {
        direccion: { type: String, default: "Entrega a domicilio" },
        lat: { type: Number },
        lng: { type: Number }
    }
}, { timestamps: true });

module.exports = mongoose.model('Pedido', PedidoSchema);