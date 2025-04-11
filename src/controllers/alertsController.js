// server/src/controllers/alertsController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createAlert = async (req, res) => {
  try {
    const { petId, location } = req.body;

    const alert = await prisma.alert.create({
      data: {
        petId: parseInt(petId),
        location,
        status: "lost",
      }
    });

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: "Error al crear alerta" });
  }
};

// Añade métodos adicionales según necesites (ej. getAlerts)
