const AppError = require('../errors/AppError')

// Se ejecuta si ninguna ruta respondio: genera un 404
const noEncontrado = (req, res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404))
}

module.exports = noEncontrado
