const fs = require('fs')
const path = require('path')
const { Sequelize } = require('sequelize')
const config = require('../config')
const inicializarModelos = require('./modelos')

// SQLite no crea carpetas: nos aseguramos de que exista la carpeta del archivo (data/ no se versiona)
fs.mkdirSync(path.dirname(config.DB_PATH), { recursive: true })

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: config.DB_PATH,
  logging: false
})

// Modelos y relaciones (definidos en db/modelos.js)
const { Usuario, Producto, Orden, ItemOrden } = inicializarModelos(sequelize)

module.exports = { sequelize, Usuario, Producto, Orden, ItemOrden }
