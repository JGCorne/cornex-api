const AppError = require('../errors/AppError')

// Manejador central de errores. Formato estandar de la API: { mensaje, detalles? }
// Express lo reconoce como manejador de errores porque tiene 4 parametros (next no se usa pero es necesario)
const manejadorErrores = (err, req, res, next) => {
  // Errores esperados de la aplicacion
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ mensaje: err.message, detalles: err.detalles })
  }

  // Body con JSON mal formado (lo detecta express.json())
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la peticion no es un JSON valido' })
  }

  // Error inesperado: se registra en consola y no se exponen detalles al cliente
  console.error(err)
  res.status(500).json({ mensaje: 'Error interno' })
}

module.exports = manejadorErrores
