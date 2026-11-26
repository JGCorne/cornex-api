const { Op } = require('sequelize')

// Acceso a datos para los reportes. Recibe los modelos de Sequelize (los inyecta container.js)
const crearReporteDao = ({ Orden, ItemOrden, Producto }) => {
  // Devuelve cada renglon vendido (items_orden) con los datos de su orden y su producto,
  // filtrando por la fecha de la orden. Formato plano:
  // { ordenId, productoId, nombre, plataforma, cantidad, precioUnitario, porcentajeDescuento }
  const listarItemsVendidos = async ({ desde, hasta } = {}) => {
    const whereOrden = {}
    if (desde || hasta) {
      whereOrden.createdAt = {}
      if (desde) whereOrden.createdAt[Op.gte] = desde
      if (hasta) whereOrden.createdAt[Op.lte] = hasta
    }

    const items = await ItemOrden.findAll({
      include: [
        { model: Orden, attributes: ['porcentajeDescuento'], where: whereOrden, required: true },
        { model: Producto, attributes: ['nombre', 'plataforma'] }
      ]
    })

    return items.map((item) => {
      const plano = item.get({ plain: true })
      return {
        ordenId: plano.ordenId,
        productoId: plano.productoId,
        nombre: plano.Producto.nombre,
        plataforma: plano.Producto.plataforma,
        cantidad: plano.cantidad,
        precioUnitario: Number(plano.precioUnitario),
        porcentajeDescuento: plano.Orden.porcentajeDescuento
      }
    })
  }

  return { listarItemsVendidos }
}

module.exports = crearReporteDao
