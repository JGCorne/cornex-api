const express = require('express')
const config = require('./config')
const { sequelize } = require('./db/connection')

const app = express()

app.use(express.json())

// Endpoint de prueba para saber si el servidor esta levantado
app.get('/salud', (req, res) => {
  res.json({ estado: 'ok' })
})

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
