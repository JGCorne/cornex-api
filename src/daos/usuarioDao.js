const AppError = require('../errors/AppError')

// Acceso a datos de usuarios. Recibe el modelo de Sequelize (lo inyecta container.js)
// Devuelve siempre objetos planos, nunca instancias de Sequelize
const crearUsuarioDao = ({ Usuario }) => {
  const crearUsuario = async (datos) => {
    try {
      const usuario = await Usuario.create(datos)
      return usuario.get({ plain: true })
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new AppError('Ya existe un usuario con ese email o DNI', 409)
      }
      throw error
    }
  }

  // Incluye la clave (hash) porque se usa para el login
  const buscarPorEmail = async (email) => {
    const usuario = await Usuario.findOne({ where: { email } })
    return usuario ? usuario.get({ plain: true }) : null
  }

  // Nunca devuelve la clave
  const buscarPorId = async (id) => {
    const usuario = await Usuario.findByPk(id, { attributes: { exclude: ['clave'] } })
    return usuario ? usuario.get({ plain: true }) : null
  }

  return { crearUsuario, buscarPorEmail, buscarPorId }
}

module.exports = crearUsuarioDao
