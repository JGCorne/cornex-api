// Fabrica de dependencias: aca se arma a mano cada pieza y se le pasa lo que necesita
const config = require('./config')
const { sequelize, Usuario, Producto, Orden, ItemOrden } = require('./db/connection')

const crearUsuarioDao = require('./daos/usuarioDao')
const crearProductoDao = require('./daos/productoDao')
const crearOrdenDao = require('./daos/ordenDao')
const crearAuthUseCase = require('./usecases/authUseCase')
const crearProductoUseCase = require('./usecases/productoUseCase')
const crearOrdenUseCase = require('./usecases/ordenUseCase')
const crearAuthController = require('./controllers/authController')
const crearProductoController = require('./controllers/productoController')
const crearOrdenController = require('./controllers/ordenController')

// Transaccion administrada de Sequelize: commit si fn termina bien, rollback si tira un error
const enTransaccion = (fn) => sequelize.transaction(fn)

// DAOs
const usuarioDao = crearUsuarioDao({ Usuario })
const productoDao = crearProductoDao({ Producto })
const ordenDao = crearOrdenDao({ Orden, ItemOrden, Producto })

// Casos de uso
const authUseCase = crearAuthUseCase({ usuarioDao, config })
const productoUseCase = crearProductoUseCase({ productoDao })
const ordenUseCase = crearOrdenUseCase({ ordenDao, productoDao, usuarioDao, config, enTransaccion })

// Controllers
const authController = crearAuthController({ authUseCase })
const productoController = crearProductoController({ productoUseCase })
const ordenController = crearOrdenController({ ordenUseCase })

module.exports = {
  usuarioDao,
  productoDao,
  ordenDao,
  authUseCase,
  productoUseCase,
  ordenUseCase,
  authController,
  productoController,
  ordenController
}
