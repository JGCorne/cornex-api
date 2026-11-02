const bcrypt = require('bcrypt')
const config = require('../config')
const { sequelize, Usuario } = require('./connection')

// Datos de los admins, tomados del .env (nunca hardcodeados)
const admins = [
  {
    nombre: config.ADMIN1_NOMBRE,
    email: config.ADMIN1_EMAIL,
    dni: config.ADMIN1_DNI,
    clave: config.ADMIN1_CLAVE
  },
  {
    nombre: config.ADMIN2_NOMBRE,
    email: config.ADMIN2_EMAIL,
    dni: config.ADMIN2_DNI,
    clave: config.ADMIN2_CLAVE
  }
]

const seed = async () => {
  await sequelize.sync()

  for (const [i, admin] of admins.entries()) {
    // Si falta algun dato en el .env, cortamos con un mensaje claro
    if (!admin.nombre || !admin.email || !admin.dni || !admin.clave) {
      throw new Error(`Faltan datos del ADMIN${i + 1} en el archivo .env`)
    }

    // Idempotente: si ya existe un usuario con ese email, no lo vuelve a crear
    const existente = await Usuario.findOne({ where: { email: admin.email } })
    if (existente) {
      console.log(`El admin ${admin.email} ya existe, se omite`)
      continue
    }

    const hash = await bcrypt.hash(admin.clave, config.BCRYPT_ROUNDS)
    await Usuario.create({ ...admin, clave: hash, rol: 'admin' })
    console.log(`Admin ${admin.email} creado`)
  }
}

seed()
  .then(() => console.log('Seed terminado'))
  .catch((error) => {
    console.error('Error en el seed:', error.message)
    process.exitCode = 1
  })
  .finally(() => sequelize.close())
