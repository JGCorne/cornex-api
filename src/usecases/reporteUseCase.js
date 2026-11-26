const TOP_PRODUCTOS = 5

// Monto de un renglon en centavos, con el descuento de su orden aplicado (sin redondear todavia)
const montoEnCentavos = ({ precioUnitario, cantidad, porcentajeDescuento }) =>
  (Math.round(precioUnitario * 100) * cantidad * (100 - porcentajeDescuento)) / 100

// Se redondea una sola vez, al final de cada suma, y se vuelve a pesos
const aPesos = (centavos) => Math.round(centavos) / 100

// Casos de uso de reportes. Recibe sus dependencias por parametro (inyeccion manual)
const crearReporteUseCase = ({ reporteDao }) => {
  const ventas = async ({ desde, hasta } = {}) => {
    const items = await reporteDao.listarItemsVendidos({ desde, hasta })

    const ordenes = new Set()
    let totalCentavos = 0
    const porPlataforma = new Map()
    const porProducto = new Map()

    for (const item of items) {
      const monto = montoEnCentavos(item)
      ordenes.add(item.ordenId)
      totalCentavos += monto

      const plataforma = porPlataforma.get(item.plataforma) || { plataforma: item.plataforma, unidades: 0, monto: 0 }
      plataforma.unidades += item.cantidad
      plataforma.monto += monto
      porPlataforma.set(item.plataforma, plataforma)

      const producto = porProducto.get(item.productoId) || { productoId: item.productoId, nombre: item.nombre, unidades: 0, monto: 0 }
      producto.unidades += item.cantidad
      producto.monto += monto
      porProducto.set(item.productoId, producto)
    }

    // Plataformas: de la que mas facturo a la que menos
    const ventasPorPlataforma = [...porPlataforma.values()]
      .sort((a, b) => b.monto - a.monto || a.plataforma.localeCompare(b.plataforma))
      .map((p) => ({ ...p, monto: aPesos(p.monto) }))

    // Top 5 por unidades vendidas; si empatan, primero el de mayor monto y despues el de menor id
    const topProductos = [...porProducto.values()]
      .sort((a, b) => b.unidades - a.unidades || b.monto - a.monto || a.productoId - b.productoId)
      .slice(0, TOP_PRODUCTOS)
      .map((p) => ({ ...p, monto: aPesos(p.monto) }))

    return {
      cantidadOrdenes: ordenes.size,
      totalVendido: aPesos(totalCentavos),
      ventasPorPlataforma,
      topProductos
    }
  }

  return { ventas }
}

module.exports = crearReporteUseCase
