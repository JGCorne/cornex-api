const { z } = require('zod')
const AppError = require('../errors/AppError')

// Devuelve un middleware que valida una parte del request con el schema de Zod recibido
// origen: 'body' (por defecto), 'query' o 'params'. Uso: validar(schema, 'query')
const validar = (schema, origen = 'body') => (req, res, next) => {
  const resultado = schema.safeParse(req[origen])

  if (!resultado.success) {
    // flattenError agrupa los errores: { formErrors: [...], fieldErrors: { campo: [...] } }
    return next(new AppError('Datos invalidos', 400, z.flattenError(resultado.error)))
  }

  // Se reemplazan los datos por los ya limpios (trim, minusculas, numeros convertidos, sin campos desconocidos)
  // En Express 5 req.query es de solo lectura (un getter), por eso se redefine como propiedad propia del request
  Object.defineProperty(req, origen, {
    value: resultado.data,
    writable: true,
    enumerable: true,
    configurable: true
  })
  next()
}

module.exports = validar
