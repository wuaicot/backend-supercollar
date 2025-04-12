require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors'); // Solo requerir 'cors' una vez
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const morgan = require('morgan'); // Logging profesional
const helmet = require('helmet'); // Seguridad HTTP

// Rutas
const authRoutes = require('./routes/auth');
const petRoutes = require('./routes/pets');
const alertRoutes = require('./routes/alerts');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ✅ Seguridad extra con Helmet (solo en producción)
if (NODE_ENV === 'production') {
  app.use(helmet());
}

// ✅ Redirección a HTTPS en producción (excepto para /health)
if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.url === '/health') return next();
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// ✅ CORS según entorno
const allowedOrigin = NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : process.env.CLIENT_URL; // Asegúrate de que CLIENT_URL esté definido en tu .env para producción

console.log(`✅ Entorno: ${NODE_ENV}`);
console.log(`🌍 Origen permitido: ${allowedOrigin}`);

const corsOptions = {
  origin: true, // Refleja el origin de la solicitud automáticamente
  credentials: true,
  methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Responde a OPTIONS preflight para cualquier ruta



// ✅ Logging con Morgan
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ✅ Middlewares esenciales
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// ✅ Middleware para subida de archivos
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, '../tmp'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  abortOnLimit: true,
  safeFileNames: true,
  preserveExtension: true,
  createParentPath: true
}));

// ✅ Ruta de salud para monitoreo
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// ✅ Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/alerts', alertRoutes);

// ✅ Middleware global de errores
app.use((err, req, res, next) => {
  console.error('❌ Error interno del servidor:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ✅ Inicio del servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  if (NODE_ENV === 'development') {
    console.log(`🌐 Accede en: http://localhost:${PORT}`);
  }
  console.log(`📁 Carpeta de archivos temporales: ${path.resolve('./tmp')}`);
});