const { DataTypes } = require('sequelize')
const { listas } = require('../config')

// Producto de la tienda: un juego o una consola
module.exports = (sequelize) => {
  const Producto = sequelize.define(
    'Producto',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El nombre no puede estar vacio' }
        }
      },
      tipo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: { args: [['juego', 'consola']], msg: 'El tipo debe ser juego o consola' }
        }
      },
      plataforma: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: { args: [listas.plataformas], msg: 'La plataforma no es valida' }
        }
      },
      formato: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: { args: [listas.formatos], msg: 'El formato no es valido' }
        }
      },
      condicion: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: { args: [listas.condiciones], msg: 'La condicion no es valida' }
        }
      },
      empresa: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: { args: [listas.empresas], msg: 'La empresa no es valida' }
        }
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          mayorACero(valor) {
            if (Number(valor) <= 0) {
              throw new Error('El precio debe ser mayor a 0')
            }
          }
        }
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: { msg: 'El stock debe ser un numero entero' },
          min: { args: [0], msg: 'El stock no puede ser negativo' }
        }
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: 'productos',
      freezeTableName: true,
      timestamps: false,
      indexes: [
        // No puede haber dos productos iguales en nombre, plataforma, formato y condicion
        {
          unique: true,
          fields: ['nombre', 'plataforma', 'formato', 'condicion']
        }
      ]
    }
  )

  return Producto
}
