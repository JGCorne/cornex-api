// Error "esperado" de la aplicacion: lleva el status HTTP y, opcionalmente, detalles para el cliente
class AppError extends Error {
  constructor(mensaje, statusCode = 500, detalles) {
    super(mensaje)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.detalles = detalles
  }
}

module.exports = AppError
