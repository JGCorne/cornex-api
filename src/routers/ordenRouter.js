const { Router } = require('express')
const { ordenController } = require('../container')
const validar = require('../middlewares/validar')
const autenticar = require('../middlewares/autenticar')
const autorizar = require('../middlewares/autorizar')
const { crearOrdenSchema } = require('../schemas/ordenSchema')

// Rutas de /ordenes: endpoint + middlewares + controller
const ordenRouter = Router()

// Solo un cliente puede comprar
ordenRouter.post('/', autenticar, autorizar('cliente'), validar(crearOrdenSchema), ordenController.crear)

// Cualquier usuario logueado ve sus propias ordenes
ordenRouter.get('/mias', autenticar, ordenController.listarMias)

module.exports = ordenRouter
