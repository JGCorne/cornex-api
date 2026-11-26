const AppError = require('../errors/AppError')

// Devuelve un middleware que solo deja pasar a los roles indicados. Uso: autorizar('admin')
// Va siempre despues de autenticar, que es quien carga req.usuario
const autorizar = (...rolesPermitidos) => (req, res, next) => {
  if (!req.usuario) {
    return next(new AppError('No autenticado', 401))
  }

  if (!rolesPermitidos.includes(req.usuario.rol)) {
    return next(new AppError('No tiene permisos para realizar esta accion', 403))
  }

  next()
}

module.exports = autorizar
