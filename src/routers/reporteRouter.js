const { Router } = require('express')
const { reporteController } = require('../container')
const validar = require('../middlewares/validar')
const autenticar = require('../middlewares/autenticar')
const autorizar = require('../middlewares/autorizar')
const { reporteVentasSchema } = require('../schemas/reporteSchema')

// Rutas de /reportes: endpoint + middlewares + controller
const reporteRouter = Router()

// Solo un admin ve los reportes
reporteRouter.get('/ventas', autenticar, autorizar('admin'), validar(reporteVentasSchema, 'query'), reporteController.ventas)

module.exports = reporteRouter
