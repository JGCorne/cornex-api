const { DataTypes } = require('sequelize')

// Renglon de una orden: que producto, cuantas unidades y a que precio
module.exports = (sequelize) => {
  const ItemOrden = sequelize.define(
    'ItemOrden',
    {
      // PK compuesta (ordenId, productoId): un producto no se repite en la misma orden
      ordenId: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      productoId: {
        type: DataTypes.INTEGER,
        primaryKey: true
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'La cantidad debe ser un numero entero' },
          min: { args: [1], msg: 'La cantidad debe ser al menos 1' }
        }
      },
      // Precio del producto al momento de la compra
      precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          mayorACero(valor) {
            if (Number(valor) <= 0) {
              throw new Error('El precio unitario debe ser mayor a 0')
            }
          }
        }
      }
    },
    {
      tableName: 'items_orden',
      freezeTableName: true,
      timestamps: false
    }
  )

  return ItemOrden
}
