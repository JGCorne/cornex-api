const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const AppError = require('../errors/AppError')

// Quita la clave de un usuario antes de devolverlo
const sinClave = ({ clave, ...usuario }) => usuario

// Casos de uso de autenticacion. Recibe sus dependencias por parametro (inyeccion manual)
const crearAuthUseCase = ({ usuarioDao, config }) => {
  const registrar = async ({ nombre, email, dni, clave }) => {
    const hash = await bcrypt.hash(clave, config.BCRYPT_ROUNDS)
    // El rol se fija aca: quien se registra siempre es cliente
    const usuario = await usuarioDao.crearUsuario({ nombre, email, dni, clave: hash, rol: 'cliente' })
    return sinClave(usuario)
  }

  const iniciarSesion = async ({ email, clave }) => {
    const usuario = await usuarioDao.buscarPorEmail(email)
    const claveCorrecta = usuario ? await bcrypt.compare(clave, usuario.clave) : false

    // Mismo error si no existe el email o si la clave no coincide, para no revelar cual fallo
    if (!claveCorrecta) {
      throw new AppError('Credenciales invalidas', 401)
    }

    const token = jwt.sign({ sub: usuario.id, rol: usuario.rol }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN
    })

    return { token, usuario: sinClave(usuario) }
  }

  const obtenerPerfil = async (id) => {
    const usuario = await usuarioDao.buscarPorId(id)
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404)
    }
    return usuario
  }

  return { registrar, iniciarSesion, obtenerPerfil }
}

module.exports = crearAuthUseCase
