const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); 

// Conexión MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error de conexión:', err));

// Rutas - Aquí están TODAS las que necesitas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/locales', require('./routes/locales'));
app.use('/api/ofertas', require('./routes/ofertas'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/galeria', require('./routes/galeria')); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SERVIDOR UNIFICADO EN PUERTO ${PORT}`);
});