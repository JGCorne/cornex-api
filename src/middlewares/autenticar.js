const jwt = require('jsonwebtoken')
const config = require('../config')
const AppError = require('../errors/AppError')

// Verifica el header "Authorization: Bearer <token>" y deja el usuario en req.usuario
const autenticar = (req, res, next) => {
  const header = req.headers.authorization

  if (!header) {
    return next(new AppError('Falta el token de autenticacion', 401))
  }

  const [esquema, token] = header.split(' ')
  if (esquema !== 'Bearer' || !token) {
    return next(new AppError('Formato de token invalido, se espera: Bearer <token>', 401))
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET)
    req.usuario = { id: payload.sub, rol: payload.rol }
    next()
  } catch (error) {
    const mensaje = error.name === 'TokenExpiredError' ? 'Token expirado' : 'Token invalido'
    next(new AppError(mensaje, 401))
  }
}

module.exports = autenticar
