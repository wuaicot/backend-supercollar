// Configuración del rate limiter
const WINDOW_SIZE_IN_MINUTES = 1; // ventana de 1 minuto
const MAX_REQUESTS = 10; // máximo de 10 solicitudes por IP en la ventana

// Almacenamiento en memoria de las solicitudes por IP
const ipRequests = {};

/**
 * Middleware para limitar la cantidad de solicitudes por IP.
 */
module.exports = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;

  const currentTime = Date.now();

  if (!ipRequests[ip]) {
    // Si no existe registro, inicializamos
    ipRequests[ip] = {
      count: 1,
      startTime: currentTime,
    };
    return next();
  }

  const elapsedTime = (currentTime - ipRequests[ip].startTime) / 60000; // tiempo transcurrido en minutos

  if (elapsedTime < WINDOW_SIZE_IN_MINUTES) {
    // Si estamos dentro de la ventana de tiempo
    if (ipRequests[ip].count < MAX_REQUESTS) {
      ipRequests[ip].count += 1;
      return next();
    } else {
      return res.status(429).json({
        error: "Demasiadas solicitudes. Por favor, inténtalo de nuevo más tarde.",
      });
    }
  } else {
    // Reiniciamos el contador si la ventana de tiempo expiró
    ipRequests[ip] = {
      count: 1,
      startTime: currentTime,
    };
    return next();
  }
};
