// server/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') 
    || req.cookies?.jwt 
    || req.query?.token;

  if (!token) return res.status(401).json({ error: "Autenticación requerida" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Asegurar que el ID sea un número entero
    req.user = {
      id: parseInt(decoded.id), // ¡Conversión crítica a número!
      role: decoded.role
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
};