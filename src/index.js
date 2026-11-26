const express = require('express')
const config = require('./config')
const { sequelize } = require('./db/connection')
const router = require('./routers')
const noEncontrado = require('./middlewares/noEncontrado')
const manejadorErrores = require('./middlewares/manejadorErrores')

const app = express()

// 1) Parseo del body JSON
app.use(express.json())

// 2) Rutas
// Endpoint de prueba para saber si el servidor esta levantado
app.get('/salud', (req, res) => {
  res.json({ estado: 'ok' })
})

app.use(router)

// 3) Ninguna ruta respondio: 404
app.use(noEncontrado)

// 4) Manejador de errores (siempre al final)
app.use(manejadorErrores)

const iniciar = async () => {
  // Conecta y crea las tablas que no existan
  await sequelize.sync()

  app.listen(config.PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${config.PORT}`)
  })
}

iniciar().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error.message)
  process.exit(1)
})
