const crearProductoUseCase = require('../src/usecases/productoUseCase')

// DAO falso en memoria, con el mismo contrato que el real (sin tocar SQLite)
const crearProductoDaoFalso = (iniciales = []) => {
  const productos = iniciales.map((p) => ({ ...p }))
  let proximoId = productos.length + 1

  return {
    productos,
    crearProducto: async (datos) => {
      const producto = { id: proximoId++, activo: true, ...datos }
      productos.push(producto)
      return { ...producto }
    },
    buscarDuplicado: async ({ nombre, plataforma, formato, condicion }) => {
      const producto = productos.find((p) =>
        p.nombre === nombre && p.plataforma === plataforma && p.formato === formato && p.condicion === condicion
      )
      return producto ? { ...producto } : null
    },
    listar: async (filtros = {}) => {
      return productos
        .filter((p) => Object.entries(filtros).every(([campo, valor]) => p[campo] === valor))
        .map((p) => ({ ...p }))
    },
    buscarPorId: async (id) => {
      const producto = productos.find((p) => p.id === id)
      return producto ? { ...producto } : null
    }
  }
}

const tlou = {
  nombre: 'The Last of Us',
  tipo: 'juego',
  plataforma: 'PS3',
  formato: 'fisico',
  condicion: 'usado',
  empresa: 'Naughty Dog',
  precio: 15000,
  stock: 3
}

describe('productoUseCase', () => {
  describe('crear', () => {
    test('crea el producto y lo devuelve con id', async () => {
      const productoDao = crearProductoDaoFalso()
      const productoUseCase = crearProductoUseCase({ productoDao })

      const producto = await productoUseCase.crear(tlou)

      expect(producto).toMatchObject({ id: 1, ...tlou })
      expect(productoDao.productos).toHaveLength(1)
    })

    test('con mismo nombre, plataforma, formato y condicion falla con 409', async () => {
      const productoDao = crearProductoDaoFalso([{ id: 1, activo: true, ...tlou }])
      const productoUseCase = crearProductoUseCase({ productoDao })

      await expect(productoUseCase.crear({ ...tlou, precio: 99999 })).rejects.toMatchObject({ statusCode: 409 })
      expect(productoDao.productos).toHaveLength(1)
    })

    test('si cambia la condicion no es duplicado', async () => {
      const productoDao = crearProductoDaoFalso([{ id: 1, activo: true, ...tlou }])
      const productoUseCase = crearProductoUseCase({ productoDao })

      const producto = await productoUseCase.crear({ ...tlou, condicion: 'nuevo' })
      expect(producto.id).toBe(2)
    })
  })

  describe('listar y obtenerPorId', () => {
    const productoDao = crearProductoDaoFalso([
      { id: 1, activo: true, ...tlou },
      { id: 2, activo: true, ...tlou, nombre: 'Halo 3', plataforma: 'Xbox 360', empresa: 'Microsoft' },
      { id: 3, activo: false, ...tlou, nombre: 'Juego dado de baja' }
    ])
    const productoUseCase = crearProductoUseCase({ productoDao })

    test('listar devuelve solo activos', async () => {
      const productos = await productoUseCase.listar()
      expect(productos.map((p) => p.id)).toEqual([1, 2])
    })

    test('listar aplica los filtros recibidos', async () => {
      const productos = await productoUseCase.listar({ plataforma: 'Xbox 360' })
      expect(productos.map((p) => p.id)).toEqual([2])
    })

    test('obtenerPorId devuelve el producto activo', async () => {
      const producto = await productoUseCase.obtenerPorId(1)
      expect(producto.nombre).toBe('The Last of Us')
    })

    test('obtenerPorId falla con 404 si no existe o esta inactivo', async () => {
      await expect(productoUseCase.obtenerPorId(99)).rejects.toMatchObject({ statusCode: 404 })
      await expect(productoUseCase.obtenerPorId(3)).rejects.toMatchObject({ statusCode: 404 })
    })
  })
})
