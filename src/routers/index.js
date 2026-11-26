const { Router } = require('express')
const authRouter = require('./authRouter')

// Router principal: centraliza los prefijos de cada grupo de rutas
const router = Router()

router.use('/auth', authRouter)

module.exports = router
