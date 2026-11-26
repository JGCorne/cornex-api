// Fabrica de dependencias: aca se arma a mano cada pieza y se le pasa lo que necesita
const config = require('./config')
const { Usuario, Producto } = require('./db/connection')

const crearUsuarioDao = require('./daos/usuarioDao')
const crearProductoDao = require('./daos/productoDao')
const crearAuthUseCase = require('./usecases/authUseCase')
const crearProductoUseCase = require('./usecases/productoUseCase')
const crearAuthController = require('./controllers/authController')
const crearProductoController = require('./controllers/productoController')

// DAOs
const usuarioDao = crearUsuarioDao({ Usuario })
const productoDao = crearProductoDao({ Producto })

// Casos de uso
const authUseCase = crearAuthUseCase({ usuarioDao, config })
const productoUseCase = crearProductoUseCase({ productoDao })

// Controllers
const authController = crearAuthController({ authUseCase })
const productoController = crearProductoController({ productoUseCase })

module.exports = {
  usuarioDao,
  productoDao,
  authUseCase,
  productoUseCase,
  authController,
  productoController
}
