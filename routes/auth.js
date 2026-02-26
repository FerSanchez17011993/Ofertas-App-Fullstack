const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTRO
router.post('/registro', async (req, res) => {
    try {
        const { nombre, correo, password, rol } = req.body;

        let user = await User.findOne({ correo });
        if (user) return res.status(400).json({ msg: "El correo ya está registrado" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ nombre, correo, password: hashedPassword, rol });
        await user.save();

        res.status(201).json({ msg: "Usuario creado exitosamente" });
    } catch (err) {
        res.status(500).json({ error: "Error al registrar usuario" });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;

        const user = await User.findOne({ correo });
        if (!user) return res.status(400).json({ msg: "Usuario no encontrado" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Contraseña incorrecta" });

        const token = jwt.sign(
            { id: user._id, rol: user.rol }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { id: user._id, nombre: user.nombre, correo: user.correo, rol: user.rol }
        });
    } catch (err) {
        res.status(500).json({ error: "Error en el login" });
    }
});

module.exports = router;