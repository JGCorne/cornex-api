const { DataTypes } = require('sequelize')

// Usuario del sistema: admin o cliente
module.exports = (sequelize) => {
  const Usuario = sequelize.define(
    'Usuario',
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: 'El email no es valido' }
        }
      },
      dni: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          is: { args: /^\d{7,8}$/, msg: 'El DNI debe tener 7 u 8 digitos' }
        }
      },
      // Guarda el hash de bcrypt, nunca la clave en texto plano
      clave: {
        type: DataTypes.STRING,
        allowNull: false
      },
      rol: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'cliente',
        validate: {
          isIn: { args: [['admin', 'cliente']], msg: 'El rol debe ser admin o cliente' }
        }
      }
    },
    {
      tableName: 'usuarios',
      freezeTableName: true,
      timestamps: true
    }
  )

  return Usuario
}
