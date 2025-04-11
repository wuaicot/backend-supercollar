//server/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Registro de dueño
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear usuario con rol owner
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "owner"
      }
    });

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    );

    res.status(201).json({
      id: user.id,
      email: user.email,
      token
    });

  } catch (error) {
    console.error("Error en registro:", error);
    
    // Manejar errores de Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "El email ya está registrado" });
    }
    
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

// Login de dueño (existente)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Verificar rol
    if (user.role !== 'owner') {
      return res.status(403).json({ error: "Acceso solo para dueños" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      id: user.id,
      email: user.email,
      token
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};