// Fabrica de dependencias: aca se arma a mano cada pieza y se le pasa lo que necesita
const config = require('./config')
const { Usuario } = require('./db/connection')

const crearUsuarioDao = require('./daos/usuarioDao')
const crearAuthUseCase = require('./usecases/authUseCase')
const crearAuthController = require('./controllers/authController')

// DAOs
const usuarioDao = crearUsuarioDao({ Usuario })

// Casos de uso
const authUseCase = crearAuthUseCase({ usuarioDao, config })

// Controllers
const authController = crearAuthController({ authUseCase })

module.exports = { usuarioDao, authUseCase, authController }
