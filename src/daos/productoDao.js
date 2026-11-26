const { Op, Sequelize } = require('sequelize')
const AppError = require('../errors/AppError')

// SQLite puede devolver los DECIMAL como texto: se normaliza el precio a numero
const aPlano = (producto) => {
  const plano = producto.get({ plain: true })
  return { ...plano, precio: Number(plano.precio) }
}

// Acceso a datos de productos. Recibe el modelo de Sequelize (lo inyecta container.js)
// Devuelve siempre objetos planos, nunca instancias de Sequelize
// Los metodos que se usan dentro de una orden aceptan { transaction }
const crearProductoDao = ({ Producto }) => {
  const crearProducto = async (datos) => {
    try {
      const producto = await Producto.create(datos)
      return aPlano(producto)
    } catch (error) {
      // Red de seguridad: el indice unico de la tabla tambien impide duplicados
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new AppError('Ya existe un producto con ese nombre, plataforma, formato y condicion', 409)
      }
      throw error
    }
  }

  // Busca un producto con la misma combinacion unica (activo o no)
  const buscarDuplicado = async ({ nombre, plataforma, formato, condicion }) => {
    const producto = await Producto.findOne({ where: { nombre, plataforma, formato, condicion } })
    return producto ? aPlano(producto) : null
  }

  // filtros: { plataforma?, formato?, condicion?, empresa?, activo? } (se ignoran los undefined)
  const listar = async (filtros = {}) => {
    const where = Object.fromEntries(
      Object.entries(filtros).filter(([, valor]) => valor !== undefined)
    )
    const productos = await Producto.findAll({ where, order: [['nombre', 'ASC'], ['id', 'ASC']] })
    return productos.map(aPlano)
  }

  const buscarPorId = async (id, { transaction } = {}) => {
    const producto = await Producto.findByPk(id, { transaction })
    return producto ? aPlano(producto) : null
  }

  // Descuenta stock de forma atomica: solo actualiza si el producto esta activo y el stock alcanza
  // Devuelve true si se desconto, false si no (sin stock suficiente o inactivo)
  const descontarStock = async (id, cantidad, { transaction } = {}) => {
    const [filasAfectadas] = await Producto.update(
      { stock: Sequelize.literal(`stock - ${Number(cantidad)}`) },
      {
        where: { id, activo: true, stock: { [Op.gte]: cantidad } },
        transaction,
        // El where ya garantiza que el stock no quede negativo
        validate: false
      }
    )
    return filasAfectadas > 0
  }

  return { crearProducto, buscarDuplicado, listar, buscarPorId, descontarStock }
}

module.exports = crearProductoDao
