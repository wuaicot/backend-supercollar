// server/src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Asegúrate de esta ruta

// Registro de dueños
router.post('/register', authController.register); 

// Login de dueños
router.post('/login', authController.login); 

module.exports = router;