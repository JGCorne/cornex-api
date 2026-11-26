const AppError = require('../errors/AppError')
const calcularDescuento = require('./calcularDescuento')

// Pasa un precio (ej. 19.99) a centavos enteros (1999) para no acumular errores de punto flotante
const aCentavos = (precio) => Math.round(Number(precio) * 100)

// Casos de uso de ordenes. Recibe sus dependencias por parametro (inyeccion manual)
// enTransaccion(fn): ejecuta fn(transaction) dentro de una transaccion; si fn tira un error, hace rollback
const crearOrdenUseCase = ({ ordenDao, productoDao, usuarioDao, config, enTransaccion }) => {
  // "ahora" se recibe por parametro para poder testear el descuento por antiguedad
  const crearOrden = async ({ usuarioId, items }, ahora = new Date()) => {
    const usuario = await usuarioDao.buscarPorId(usuarioId)
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404)
    }

    const porcentajeDescuento = calcularDescuento(usuario.createdAt, ahora, config)

    // Todo dentro de UNA transaccion: si un item falla, no se descuenta el stock de ninguno
    return enTransaccion(async (transaction) => {
      let subtotalCentavos = 0
      const renglones = []

      for (const { productoId, cantidad } of items) {
        const producto = await productoDao.buscarPorId(productoId, { transaction })

        if (!producto) {
          throw new AppError(`Producto ${productoId} no encontrado`, 404)
        }
        if (!producto.activo) {
          throw new AppError(`El producto "${producto.nombre}" no esta disponible`, 409)
        }
        if (producto.stock < cantidad) {
          throw new AppError(
            `Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock}, pedido: ${cantidad})`,
            409
          )
        }

        // El DAO vuelve a chequear el stock en el mismo UPDATE (por si otra compra lo cambio)
        const descontado = await productoDao.descontarStock(productoId, cantidad, { transaction })
        if (!descontado) {
          throw new AppError(`Stock insuficiente para "${producto.nombre}"`, 409)
        }

        subtotalCentavos += aCentavos(producto.precio) * cantidad
        // Se guarda el precio del momento: si despues cambia el precio del producto, la orden no cambia
        renglones.push({ productoId, cantidad, precioUnitario: producto.precio })
      }

      // Total en centavos con el descuento aplicado, redondeado una sola vez al final
      const totalCentavos = Math.round((subtotalCentavos * (100 - porcentajeDescuento)) / 100)

      return ordenDao.crearOrden(
        { usuarioId, porcentajeDescuento, total: totalCentavos / 100, items: renglones },
        { transaction }
      )
    })
  }

  const listarMias = async (usuarioId) => {
    return ordenDao.listarPorUsuario(usuarioId)
  }

  return { crearOrden, listarMias }
}

module.exports = crearOrdenUseCase
