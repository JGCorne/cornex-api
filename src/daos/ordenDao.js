// Acceso a datos de ordenes. Recibe los modelos de Sequelize (los inyecta container.js)
// Devuelve siempre objetos planos, nunca instancias de Sequelize
const crearOrdenDao = ({ Orden, ItemOrden, Producto }) => {
  // Trae los items con el nombre y la plataforma del producto
  const incluirItems = {
    model: ItemOrden,
    as: 'items',
    include: [{ model: Producto, attributes: ['nombre', 'plataforma'] }]
  }

  // SQLite puede devolver los DECIMAL como texto: se normalizan a numero
  const aPlano = (orden) => {
    const plano = orden.get({ plain: true })
    return {
      id: plano.id,
      usuarioId: plano.usuarioId,
      porcentajeDescuento: plano.porcentajeDescuento,
      total: Number(plano.total),
      createdAt: plano.createdAt,
      items: (plano.items || []).map((item) => ({
        productoId: item.productoId,
        nombre: item.Producto ? item.Producto.nombre : undefined,
        plataforma: item.Producto ? item.Producto.plataforma : undefined,
        cantidad: item.cantidad,
        precioUnitario: Number(item.precioUnitario)
      }))
    }
  }

  const buscarPorId = async (id, { transaction } = {}) => {
    const orden = await Orden.findByPk(id, { include: [incluirItems], transaction })
    return orden ? aPlano(orden) : null
  }

  // Guarda la orden y sus items. Se llama dentro de la transaccion del caso de uso
  const crearOrden = async ({ usuarioId, porcentajeDescuento, total, items }, { transaction } = {}) => {
    const orden = await Orden.create({ usuarioId, porcentajeDescuento, total }, { transaction })
    await ItemOrden.bulkCreate(
      items.map((item) => ({ ...item, ordenId: orden.id })),
      { transaction, validate: true }
    )
    return buscarPorId(orden.id, { transaction })
  }

  // Ordenes de un usuario, de la mas nueva a la mas vieja
  const listarPorUsuario = async (usuarioId) => {
    const ordenes = await Orden.findAll({
      where: { usuarioId },
      include: [incluirItems],
      order: [['createdAt', 'DESC'], ['id', 'DESC']]
    })
    return ordenes.map(aPlano)
  }

  return { crearOrden, buscarPorId, listarPorUsuario }
}

module.exports = crearOrdenDao
