const admin = require("firebase-admin");
const path = require("path");

// Obtén la ruta del archivo de cuenta de servicio desde la variable de entorno,
// o usa una ruta por defecto si no se define.
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.resolve(__dirname, "../../config/serviceAccountKey.json");

if (!admin.apps.length) {
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Envía una notificación push a un dispositivo usando Firebase Cloud Messaging.
 * @param {string} registrationToken - El token de registro del dispositivo destino.
 * @param {Object} payload - El payload de la notificación. Ejemplo:
 * {
 *   notification: {
 *     title: "Alerta de mascota perdida",
 *     body: "Se ha reportado una mascota cerca de tu ubicación.",
 *   },
 *   data: {
 *     latitude: "40.7128",
 *     longitude: "-74.0060"
 *   }
 * }
 * @returns {Promise<Object>} La respuesta de FCM.
 */
const sendPushNotification = async (registrationToken, payload) => {
  try {
    const response = await admin.messaging().sendToDevice(registrationToken, payload);
    console.log("Notificación enviada exitosamente:", response);
    return response;
  } catch (error) {
    console.error("Error al enviar la notificación push:", error);
    throw error;
  }
};

module.exports = {
  sendPushNotification,
};
