// Fabrica de dependencias: aca se arma a mano cada pieza y se le pasa lo que necesita
const config = require('./config')
const { sequelize, Usuario, Producto, Orden, ItemOrden } = require('./db/connection')

const crearUsuarioDao = require('./daos/usuarioDao')
const crearProductoDao = require('./daos/productoDao')
const crearOrdenDao = require('./daos/ordenDao')
const crearReporteDao = require('./daos/reporteDao')
const crearAuthUseCase = require('./usecases/authUseCase')
const crearProductoUseCase = require('./usecases/productoUseCase')
const crearOrdenUseCase = require('./usecases/ordenUseCase')
const crearReporteUseCase = require('./usecases/reporteUseCase')
const crearAuthController = require('./controllers/authController')
const crearProductoController = require('./controllers/productoController')
const crearOrdenController = require('./controllers/ordenController')
const crearReporteController = require('./controllers/reporteController')

// Transaccion administrada de Sequelize: commit si fn termina bien, rollback si tira un error
const enTransaccion = (fn) => sequelize.transaction(fn)

// DAOs
const usuarioDao = crearUsuarioDao({ Usuario })
const productoDao = crearProductoDao({ Producto })
const ordenDao = crearOrdenDao({ Orden, ItemOrden, Producto })
const reporteDao = crearReporteDao({ Orden, ItemOrden, Producto })

// Casos de uso
const authUseCase = crearAuthUseCase({ usuarioDao, config })
const productoUseCase = crearProductoUseCase({ productoDao })
const ordenUseCase = crearOrdenUseCase({ ordenDao, productoDao, usuarioDao, config, enTransaccion })
const reporteUseCase = crearReporteUseCase({ reporteDao })

// Controllers
const authController = crearAuthController({ authUseCase })
const productoController = crearProductoController({ productoUseCase })
const ordenController = crearOrdenController({ ordenUseCase })
const reporteController = crearReporteController({ reporteUseCase })

module.exports = {
  usuarioDao,
  productoDao,
  ordenDao,
  reporteDao,
  authUseCase,
  productoUseCase,
  ordenUseCase,
  reporteUseCase,
  authController,
  productoController,
  ordenController,
  reporteController
}
