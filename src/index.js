require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');

// Rutas de la API
const authRoutes = require('./routes/auth');
const petRoutes = require('./routes/pets');
const alertRoutes = require('./routes/alerts');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ✅ Configuración de seguridad adicional con Helmet (solo en producción)
if (NODE_ENV === 'production') {
  app.use(helmet());
}

// ✅ Redirección a HTTPS en producción (excepto para /health)
// if (NODE_ENV === 'production') {
//   app.use((req, res, next) => {
//     if (req.url === '/health') return next();
//     if (req.headers['x-forwarded-proto'] !== 'https') {
//       return res.redirect(301, `https://${req.headers.host}${req.url}`);
//     }
//     next();
//   });
// }

// ✅ Configuración de CORS según entorno
const allowedOrigin = NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : process.env.CLIENT_URL;

console.log(`✅ Entorno: ${NODE_ENV}`);
console.log(`🌍 Origen permitido: ${allowedOrigin}`);

const corsOptions = {
  origin: (origin, callback) => {
   
    if (!origin || origin === allowedOrigin) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Permite enviar cookies y credenciales
};

app.use(cors(corsOptions));

// ✅ Logging profesional con Morgan
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ✅ Middlewares esenciales
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// ✅ Configuración de subida de archivos
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, '../tmp'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  abortOnLimit: true,
  safeFileNames: true,
  preserveExtension: true,
  createParentPath: true
}));

// ✅ Ruta de salud para monitoreo (excluida de HTTPS)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// ✅ Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/alerts', alertRoutes);

// ✅ Middleware global para el manejo de errores
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
