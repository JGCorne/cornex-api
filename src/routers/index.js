const { Router } = require('express')
const authRouter = require('./authRouter')
const productoRouter = require('./productoRouter')

// Router principal: centraliza los prefijos de cada grupo de rutas
const router = Router()

router.use('/auth', authRouter)
router.use('/productos', productoRouter)

module.exports = router
