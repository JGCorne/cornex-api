const fs = require('fs')
const path = require('path')
const { Sequelize } = require('sequelize')
const config = require('../config')

const crearUsuario = require('../models/usuarioModel')
const crearProducto = require('../models/productoModel')
const crearOrden = require('../models/ordenModel')
const crearItemOrden = require('../models/itemOrdenModel')

// SQLite no crea carpetas: nos aseguramos de que exista la carpeta del archivo (data/ no se versiona)
fs.mkdirSync(path.dirname(config.DB_PATH), { recursive: true })

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: config.DB_PATH,
  logging: false
})

// Inicializa los modelos
const Usuario = crearUsuario(sequelize)
const Producto = crearProducto(sequelize)
const Orden = crearOrden(sequelize)
const ItemOrden = crearItemOrden(sequelize)

// Relaciones (todas definidas aca, con el mismo foreignKey en ambos lados)
// onDelete 'RESTRICT' en todas: no se puede borrar un usuario, orden o producto que tenga
// registros asociados, para no perder el historial de compras. Va en cada asociacion porque
// Sequelize se queda con el valor de la ultima que se define sobre la misma FK.

// Un usuario tiene muchas ordenes; cada orden pertenece a un usuario
Usuario.hasMany(Orden, { foreignKey: 'usuarioId', onDelete: 'RESTRICT' })
Orden.belongsTo(Usuario, { foreignKey: 'usuarioId', onDelete: 'RESTRICT' })

// Una orden tiene muchos productos y un producto aparece en muchas ordenes, a traves de ItemOrden
Orden.belongsToMany(Producto, { through: ItemOrden, foreignKey: 'ordenId', otherKey: 'productoId', onDelete: 'RESTRICT' })
Producto.belongsToMany(Orden, { through: ItemOrden, foreignKey: 'productoId', otherKey: 'ordenId', onDelete: 'RESTRICT' })

// Relaciones directas con ItemOrden, para acceder a cantidad y precioUnitario de cada renglon
Orden.hasMany(ItemOrden, { foreignKey: 'ordenId', onDelete: 'RESTRICT' })
ItemOrden.belongsTo(Orden, { foreignKey: 'ordenId', onDelete: 'RESTRICT' })
Producto.hasMany(ItemOrden, { foreignKey: 'productoId', onDelete: 'RESTRICT' })
ItemOrden.belongsTo(Producto, { foreignKey: 'productoId', onDelete: 'RESTRICT' })

module.exports = { sequelize, Usuario, Producto, Orden, ItemOrden }
