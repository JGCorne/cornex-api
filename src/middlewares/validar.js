const { z } = require('zod')
const AppError = require('../errors/AppError')

// Devuelve un middleware que valida req.body con el schema de Zod recibido
const validar = (schema) => (req, res, next) => {
  const resultado = schema.safeParse(req.body)

  if (!resultado.success) {
    // flattenError agrupa los errores: { formErrors: [...], fieldErrors: { campo: [...] } }
    return next(new AppError('Datos invalidos', 400, z.flattenError(resultado.error)))
  }

  // Se reemplaza el body por los datos ya limpios (trim, minusculas, sin campos desconocidos)
  req.body = resultado.data
  next()
}

module.exports = validar
