const AppError = require('../errors/AppError')

// Casos de uso de productos. Recibe sus dependencias por parametro (inyeccion manual)
const crearProductoUseCase = ({ productoDao }) => {
  // Regla: no puede haber dos productos con el mismo nombre, plataforma, formato y condicion
  const crear = async (datos) => {
    const { nombre, plataforma, formato, condicion } = datos
    const duplicado = await productoDao.buscarDuplicado({ nombre, plataforma, formato, condicion })
    if (duplicado) {
      throw new AppError('Ya existe un producto con ese nombre, plataforma, formato y condicion', 409)
    }
    return productoDao.crearProducto(datos)
  }

  // El catalogo publico solo muestra productos activos
  const listar = async (filtros = {}) => {
    return productoDao.listar({ ...filtros, activo: true })
  }

  // Un producto inactivo se trata igual que uno inexistente
  const obtenerPorId = async (id) => {
    const producto = await productoDao.buscarPorId(id)
    if (!producto || !producto.activo) {
      throw new AppError('Producto no encontrado', 404)
    }
    return producto
  }

  return { crear, listar, obtenerPorId }
}

module.exports = crearProductoUseCase
