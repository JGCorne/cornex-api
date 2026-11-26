// Test de integracion: caso de uso + DAOs reales + SQLite en memoria (no toca data/)
// Los modelos leen config.js, que exige JWT_SECRET: se define uno de prueba si no hay .env
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secreto_de_prueba'

const { Sequelize } = require('sequelize')
const inicializarModelos = require('../src/db/modelos')
const crearUsuarioDao = require('../src/daos/usuarioDao')
const crearProductoDao = require('../src/daos/productoDao')
const crearOrdenDao = require('../src/daos/ordenDao')
const crearOrdenUseCase = require('../src/usecases/ordenUseCase')

const config = { DESCUENTO_PORCENTAJE: 25, DESCUENTO_DIAS: 30 }
const MS_POR_DIA = 24 * 60 * 60 * 1000

const datosProducto = {
  tipo: 'juego',
  plataforma: 'PS4',
  formato: 'fisico',
  condicion: 'nuevo',
  empresa: 'Naughty Dog'
}

describe('ordenUseCase.crearOrden (integracion con SQLite en memoria)', () => {
  let sequelize
  let modelos
  let ordenUseCase
  let cliente
  let conStock
  let otroConStock
  let sinStock

  beforeEach(async () => {
    sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false })
    modelos = inicializarModelos(sequelize)
    await sequelize.sync({ force: true })

    const { Usuario, Producto, Orden, ItemOrden } = modelos
    ordenUseCase = crearOrdenUseCase({
      ordenDao: crearOrdenDao({ Orden, ItemOrden, Producto }),
      productoDao: crearProductoDao({ Producto }),
      usuarioDao: crearUsuarioDao({ Usuario }),
      config,
      enTransaccion: (fn) => sequelize.transaction(fn)
    })

    cliente = await Usuario.create({ nombre: 'Ana', email: 'ana@mail.com', dni: '12345678', clave: 'hash', rol: 'cliente' })
    conStock = await Producto.create({ ...datosProducto, nombre: 'Uncharted 4', precio: 19.99, stock: 5 })
    otroConStock = await Producto.create({ ...datosProducto, nombre: 'Spider-Man', empresa: 'Insomniac Games', precio: 100, stock: 2 })
    sinStock = await Producto.create({ ...datosProducto, nombre: 'The Last of Us Part II', precio: 50, stock: 0 })
  })

  afterEach(async () => {
    await sequelize.close()
  })

  const stockDe = async (producto) => (await modelos.Producto.findByPk(producto.id)).stock

  test('si un item no tiene stock, falla con 409 y no descuenta el stock de los otros items', async () => {
    const items = [
      { productoId: conStock.id, cantidad: 2 },
      { productoId: otroConStock.id, cantidad: 1 },
      { productoId: sinStock.id, cantidad: 1 }
    ]

    await expect(ordenUseCase.crearOrden({ usuarioId: cliente.id, items })).rejects.toMatchObject({ statusCode: 409 })

    // Rollback: los productos que se procesaron antes del error mantienen su stock
    expect(await stockDe(conStock)).toBe(5)
    expect(await stockDe(otroConStock)).toBe(2)
    expect(await stockDe(sinStock)).toBe(0)
    expect(await modelos.Orden.count()).toBe(0)
    expect(await modelos.ItemOrden.count()).toBe(0)
  })

  test('con un producto inexistente falla con 404 y no descuenta nada', async () => {
    const items = [
      { productoId: conStock.id, cantidad: 1 },
      { productoId: 999, cantidad: 1 }
    ]

    await expect(ordenUseCase.crearOrden({ usuarioId: cliente.id, items })).rejects.toMatchObject({ statusCode: 404 })
    expect(await stockDe(conStock)).toBe(5)
    expect(await modelos.Orden.count()).toBe(0)
  })

  test('con un producto inactivo falla con 409', async () => {
    await conStock.update({ activo: false })
    const items = [{ productoId: conStock.id, cantidad: 1 }]

    await expect(ordenUseCase.crearOrden({ usuarioId: cliente.id, items })).rejects.toMatchObject({ statusCode: 409 })
    expect(await stockDe(conStock)).toBe(5)
  })

  test('usuario nuevo: guarda la orden con 25% de descuento, descuenta stock y guarda el precio del momento', async () => {
    const items = [
      { productoId: conStock.id, cantidad: 3 },
      { productoId: otroConStock.id, cantidad: 1 }
    ]

    const orden = await ordenUseCase.crearOrden({ usuarioId: cliente.id, items })

    // (19.99 * 3 + 100) * 0.75 = 159.97 * 0.75 = 119.9775 -> 119.98
    expect(orden.porcentajeDescuento).toBe(25)
    expect(orden.total).toBe(119.98)
    expect(orden.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ productoId: conStock.id, cantidad: 3, precioUnitario: 19.99 }),
      expect.objectContaining({ productoId: otroConStock.id, cantidad: 1, precioUnitario: 100 })
    ]))
    expect(await stockDe(conStock)).toBe(2)
    expect(await stockDe(otroConStock)).toBe(1)

    // Si despues cambia el precio del producto, la orden guardada no cambia
    await conStock.update({ precio: 999 })
    const [guardada] = await ordenUseCase.listarMias(cliente.id)
    expect(guardada.items.find((i) => i.productoId === conStock.id).precioUnitario).toBe(19.99)
  })

  test('usuario con mas de 30 dias de antiguedad: orden sin descuento', async () => {
    const ahora = new Date(Date.now() + 31 * MS_POR_DIA)
    const items = [{ productoId: conStock.id, cantidad: 1 }]

    const orden = await ordenUseCase.crearOrden({ usuarioId: cliente.id, items }, ahora)

    expect(orden.porcentajeDescuento).toBe(0)
    expect(orden.total).toBe(19.99)
  })
})
