const { Router } = require('express')
const authRouter = require('./authRouter')
const productoRouter = require('./productoRouter')
const ordenRouter = require('./ordenRouter')

// Router principal: centraliza los prefijos de cada grupo de rutas
const router = Router()

router.use('/auth', authRouter)
router.use('/productos', productoRouter)
router.use('/ordenes', ordenRouter)

module.exports = router
