const { Router } = require('express')
const { productoController } = require('../container')
const validar = require('../middlewares/validar')
const autenticar = require('../middlewares/autenticar')
const autorizar = require('../middlewares/autorizar')
const { crearProductoSchema, filtrosProductoSchema, idProductoSchema } = require('../schemas/productoSchema')

// Rutas de /productos: endpoint + middlewares + controller
const productoRouter = Router()

// Solo un admin puede dar de alta productos
productoRouter.post('/', autenticar, autorizar('admin'), validar(crearProductoSchema), productoController.crear)

// Catalogo publico
productoRouter.get('/', validar(filtrosProductoSchema, 'query'), productoController.listar)
productoRouter.get('/:id', validar(idProductoSchema, 'params'), productoController.obtenerPorId)

module.exports = productoRouter
