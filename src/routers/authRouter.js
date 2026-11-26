const { Router } = require('express')
const { authController } = require('../container')
const validar = require('../middlewares/validar')
const autenticar = require('../middlewares/autenticar')
const { registroSchema, loginSchema } = require('../schemas/authSchema')

// Rutas de /auth: endpoint + middlewares + controller
const authRouter = Router()

authRouter.post('/registro', validar(registroSchema), authController.registrar)
authRouter.post('/login', validar(loginSchema), authController.iniciarSesion)
authRouter.get('/perfil', autenticar, authController.perfil)

module.exports = authRouter
