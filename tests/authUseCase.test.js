const jwt = require('jsonwebtoken')
const AppError = require('../src/errors/AppError')
const crearAuthUseCase = require('../src/usecases/authUseCase')

// Config de prueba: pocas rondas de bcrypt para que los tests sean rapidos
const config = { BCRYPT_ROUNDS: 4, JWT_SECRET: 'secreto_de_prueba', JWT_EXPIRES_IN: '1h' }

// DAO falso en memoria, con el mismo contrato que el real (sin tocar SQLite)
const crearUsuarioDaoFalso = () => {
  const usuarios = []
  let proximoId = 1

  return {
    usuarios,
    crearUsuario: async (datos) => {
      if (usuarios.some((u) => u.email === datos.email || u.dni === datos.dni)) {
        throw new AppError('Ya existe un usuario con ese email o DNI', 409)
      }
      const usuario = { id: proximoId++, ...datos }
      usuarios.push(usuario)
      return { ...usuario }
    },
    buscarPorEmail: async (email) => {
      const usuario = usuarios.find((u) => u.email === email)
      return usuario ? { ...usuario } : null
    },
    buscarPorId: async (id) => {
      const usuario = usuarios.find((u) => u.id === id)
      if (!usuario) return null
      const { clave, ...resto } = usuario
      return resto
    }
  }
}

const datosCliente = { nombre: 'Ana', email: 'ana@mail.com', dni: '12345678', clave: 'clave1234' }

describe('authUseCase', () => {
  let usuarioDao
  let authUseCase

  beforeEach(() => {
    usuarioDao = crearUsuarioDaoFalso()
    authUseCase = crearAuthUseCase({ usuarioDao, config })
  })

  describe('registrar', () => {
    test('guarda la clave hasheada, fuerza rol cliente y no devuelve la clave', async () => {
      const usuario = await authUseCase.registrar({ ...datosCliente, rol: 'admin' })

      const guardado = usuarioDao.usuarios[0]
      expect(guardado.clave).not.toBe(datosCliente.clave)
      expect(guardado.clave).toMatch(/^\$2[aby]\$/)
      expect(guardado.rol).toBe('cliente')

      expect(usuario.rol).toBe('cliente')
      expect(usuario).not.toHaveProperty('clave')
      expect(usuario).toMatchObject({ id: 1, nombre: 'Ana', email: 'ana@mail.com', dni: '12345678' })
    })

    test('con email repetido falla con 409', async () => {
      await authUseCase.registrar(datosCliente)
      await expect(
        authUseCase.registrar({ ...datosCliente, dni: '87654321' })
      ).rejects.toMatchObject({ statusCode: 409 })
    })

    test('con DNI repetido falla con 409', async () => {
      await authUseCase.registrar(datosCliente)
      await expect(
        authUseCase.registrar({ ...datosCliente, email: 'otra@mail.com' })
      ).rejects.toMatchObject({ statusCode: 409 })
    })
  })

  describe('iniciarSesion', () => {
    beforeEach(async () => {
      await authUseCase.registrar(datosCliente)
    })

    test('con datos correctos devuelve un token valido con sub y rol', async () => {
      const { token, usuario } = await authUseCase.iniciarSesion({
        email: datosCliente.email,
        clave: datosCliente.clave
      })

      const payload = jwt.verify(token, config.JWT_SECRET)
      expect(payload.sub).toBe(1)
      expect(payload.rol).toBe('cliente')
      expect(usuario).not.toHaveProperty('clave')
    })

    test('con clave incorrecta o email inexistente devuelve el mismo 401', async () => {
      const esperado = { statusCode: 401, message: 'Credenciales invalidas' }

      await expect(
        authUseCase.iniciarSesion({ email: datosCliente.email, clave: 'otraclave' })
      ).rejects.toMatchObject(esperado)

      await expect(
        authUseCase.iniciarSesion({ email: 'nadie@mail.com', clave: datosCliente.clave })
      ).rejects.toMatchObject(esperado)
    })
  })
})
