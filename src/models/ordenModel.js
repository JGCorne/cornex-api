const { DataTypes } = require('sequelize')
const { DESCUENTO_PORCENTAJE } = require('../config')

// Orden de compra de un usuario
module.exports = (sequelize) => {
  const Orden = sequelize.define(
    'Orden',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // FK a usuarios (la relacion se define en db/connection.js)
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      // Sin descuento (0) o con el descuento configurado (25 por defecto)
      porcentajeDescuento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isIn: {
            args: [[0, DESCUENTO_PORCENTAJE]],
            msg: `El descuento debe ser 0 o ${DESCUENTO_PORCENTAJE}`
          }
        }
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: { args: [0], msg: 'El total no puede ser negativo' }
        }
      }
    },
    {
      tableName: 'ordenes',
      freezeTableName: true,
      // Solo guarda la fecha de creacion
      timestamps: true,
      updatedAt: false
    }
  )

  return Orden
}
