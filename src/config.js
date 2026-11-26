const path = require('path')
const dotenv = require('dotenv')

// Raiz del proyecto (un nivel arriba de src/)
const RAIZ = path.resolve(__dirname, '..')

// Carga las variables del archivo .env de la raiz
dotenv.config({ path: path.join(RAIZ, '.env'), quiet: true })

// Sin secreto no se pueden firmar ni verificar tokens: se corta al arrancar
if (!process.env.JWT_SECRET) {
  throw new Error('Falta definir JWT_SECRET en el archivo .env (ver .env.example)')
}

// Listas de valores permitidos (plataformas, formatos, condiciones, empresas)
const listas = require('../config/listas.json')

const config = {
  PORT: parseInt(process.env.PORT, 10) || 3000,
  // Se resuelve desde la raiz para que funcione sin importar desde donde se ejecute
  DB_PATH: path.resolve(RAIZ, process.env.DB_PATH || './data/cornex.sqlite'),

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,

  STOCK_BAJO: parseInt(process.env.STOCK_BAJO, 10) || 2,
  DESCUENTO_PORCENTAJE: parseInt(process.env.DESCUENTO_PORCENTAJE, 10) || 25,
  DESCUENTO_DIAS: parseInt(process.env.DESCUENTO_DIAS, 10) || 30,

  // Datos de los admins que crea el seed
  ADMIN1_NOMBRE: process.env.ADMIN1_NOMBRE,
  ADMIN1_EMAIL: process.env.ADMIN1_EMAIL,
  ADMIN1_DNI: process.env.ADMIN1_DNI,
  ADMIN1_CLAVE: process.env.ADMIN1_CLAVE,

  ADMIN2_NOMBRE: process.env.ADMIN2_NOMBRE,
  ADMIN2_EMAIL: process.env.ADMIN2_EMAIL,
  ADMIN2_DNI: process.env.ADMIN2_DNI,
  ADMIN2_CLAVE: process.env.ADMIN2_CLAVE,

  listas
}

module.exports = config
