const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ['cliente', 'vendedor'], default: 'cliente' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);