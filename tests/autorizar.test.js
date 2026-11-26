const autorizar = require('../src/middlewares/autorizar')

// Ejecuta el middleware con un req armado a mano y devuelve con que se llamo a next
const ejecutar = (middleware, req) => {
  const next = jest.fn()
  middleware(req, {}, next)
  return next
}

describe("autorizar('admin')", () => {
  const soloAdmin = autorizar('admin')

  test('deja pasar a un admin', () => {
    const next = ejecutar(soloAdmin, { usuario: { id: 1, rol: 'admin' } })
    expect(next).toHaveBeenCalledWith()
  })

  test('devuelve 403 a un cliente', () => {
    const next = ejecutar(soloAdmin, { usuario: { id: 2, rol: 'cliente' } })
    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 403 })
  })

  test('devuelve 401 si no hay usuario', () => {
    const next = ejecutar(soloAdmin, {})
    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 })
  })
})
