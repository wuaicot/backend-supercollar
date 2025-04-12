require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');

// Rutas
const authRoutes = require('./routes/auth');
const petRoutes = require('./routes/pets');
const alertRoutes = require('./routes/alerts');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Seguridad extra: solo en producción se incluye Helmet
if (NODE_ENV === 'production') {
  app.use(helmet());
}

// Configuración de CORS para solicitudes con credenciales
// Se define el origen permitido de forma explícita y se habilita "credentials"
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
const corsOptions = {
  origin: allowedOrigin,
  credentials: true,
};

// Aplicamos la configuración de CORS
app.use(cors(corsOptions));

// Middlewares esenciales
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// Middleware para manejo de archivos
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, '../tmp'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  abortOnLimit: true,
  safeFileNames: true,
  preserveExtension: true,
  createParentPath: true
}));

// Ruta de salud para monitoreo
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/alerts', alertRoutes);

// Middleware global de errores
app.use((err, req, res, next) => {
  console.error('❌ Error interno del servidor:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Logging profesional con Morgan
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  if (NODE_ENV === 'development') {
    console.log(`🌐 Accede en: http://localhost:${PORT}`);
  }
  console.log(`📁 Carpeta de archivos temporales: ${path.resolve('./tmp')}`);
});
