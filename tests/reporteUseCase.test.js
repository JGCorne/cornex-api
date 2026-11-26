const crearReporteUseCase = require('../src/usecases/reporteUseCase')

// DAO falso: devuelve renglones fijos y registra con que filtros se lo llamo
const crearReporteDaoFalso = (items) => {
  const llamadas = []
  return {
    llamadas,
    listarItemsVendidos: async (filtros) => {
      llamadas.push(filtros)
      return items
    }
  }
}

// 3 ordenes: la 1 y la 2 con 25% de descuento, la 3 sin descuento
const items = [
  { ordenId: 1, productoId: 1, nombre: 'Uncharted 4', plataforma: 'PS4', cantidad: 2, precioUnitario: 100, porcentajeDescuento: 25 },
  { ordenId: 1, productoId: 2, nombre: 'PS5 Slim', plataforma: 'PS5', cantidad: 1, precioUnitario: 1000, porcentajeDescuento: 25 },
  { ordenId: 2, productoId: 1, nombre: 'Uncharted 4', plataforma: 'PS4', cantidad: 3, precioUnitario: 100, porcentajeDescuento: 25 },
  { ordenId: 3, productoId: 3, nombre: 'Halo 3', plataforma: 'Xbox 360', cantidad: 1, precioUnitario: 19.99, porcentajeDescuento: 0 },
  { ordenId: 3, productoId: 4, nombre: 'Gears of War', plataforma: 'Xbox 360', cantidad: 1, precioUnitario: 10, porcentajeDescuento: 0 },
  { ordenId: 3, productoId: 5, nombre: 'Crash Bandicoot', plataforma: 'PS1', cantidad: 1, precioUnitario: 5, porcentajeDescuento: 0 },
  { ordenId: 3, productoId: 6, nombre: 'Sonic', plataforma: 'Sega Genesis', cantidad: 1, precioUnitario: 1, porcentajeDescuento: 0 }
]

describe('reporteUseCase.ventas', () => {
  test('calcula cantidad de ordenes, total, ventas por plataforma y top 5 con el descuento de cada orden', async () => {
    const reporteDao = crearReporteDaoFalso(items)
    const reporteUseCase = crearReporteUseCase({ reporteDao })

    const reporte = await reporteUseCase.ventas()

    // Orden 1: (200 + 1000) * 0.75 = 900 | Orden 2: 300 * 0.75 = 225 | Orden 3: 19.99 + 10 + 5 + 1 = 35.99
    expect(reporte.cantidadOrdenes).toBe(3)
    expect(reporte.totalVendido).toBe(1160.99)

    expect(reporte.ventasPorPlataforma).toEqual([
      { plataforma: 'PS5', unidades: 1, monto: 750 },
      { plataforma: 'PS4', unidades: 5, monto: 375 },
      { plataforma: 'Xbox 360', unidades: 2, monto: 29.99 },
      { plataforma: 'PS1', unidades: 1, monto: 5 },
      { plataforma: 'Sega Genesis', unidades: 1, monto: 1 }
    ])

    // 6 productos vendidos: solo entran 5. Empates de unidades se ordenan por monto
    expect(reporte.topProductos).toEqual([
      { productoId: 1, nombre: 'Uncharted 4', unidades: 5, monto: 375 },
      { productoId: 2, nombre: 'PS5 Slim', unidades: 1, monto: 750 },
      { productoId: 3, nombre: 'Halo 3', unidades: 1, monto: 19.99 },
      { productoId: 4, nombre: 'Gears of War', unidades: 1, monto: 10 },
      { productoId: 5, nombre: 'Crash Bandicoot', unidades: 1, monto: 5 }
    ])
  })

  test('redondea a centavos solo al final de cada suma', async () => {
    // 19.99 * 3 * 0.75 = 44.9775 -> 44.98
    const reporteDao = crearReporteDaoFalso([
      { ordenId: 1, productoId: 1, nombre: 'X', plataforma: 'PC', cantidad: 3, precioUnitario: 19.99, porcentajeDescuento: 25 }
    ])
    const reporte = await crearReporteUseCase({ reporteDao }).ventas()
    expect(reporte.totalVendido).toBe(44.98)
  })

  test('sin ventas devuelve todo en cero y listas vacias', async () => {
    const reporteDao = crearReporteDaoFalso([])
    const reporte = await crearReporteUseCase({ reporteDao }).ventas()

    expect(reporte).toEqual({ cantidadOrdenes: 0, totalVendido: 0, ventasPorPlataforma: [], topProductos: [] })
  })

  test('pasa el rango de fechas al DAO', async () => {
    const reporteDao = crearReporteDaoFalso([])
    const desde = new Date('2026-11-01T00:00:00.000Z')
    const hasta = new Date('2026-11-30T23:59:59.999Z')

    await crearReporteUseCase({ reporteDao }).ventas({ desde, hasta })

    expect(reporteDao.llamadas).toEqual([{ desde, hasta }])
  })
})
