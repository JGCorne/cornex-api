// Controller de productos: solo traduce HTTP <-> caso de uso
const crearProductoController = ({ productoUseCase }) => {
  const crear = async (req, res) => {
    const producto = await productoUseCase.crear(req.body)
    res.status(201).json(producto)
  }

  // req.query ya viene validado y limpio por validar(filtrosProductoSchema, 'query')
  const listar = async (req, res) => {
    const productos = await productoUseCase.listar(req.query)
    res.status(200).json(productos)
  }

  // req.params.id ya es un numero (lo convierte validar(idProductoSchema, 'params'))
  const obtenerPorId = async (req, res) => {
    const producto = await productoUseCase.obtenerPorId(req.params.id)
    res.status(200).json(producto)
  }

  return { crear, listar, obtenerPorId }
}

module.exports = crearProductoController
