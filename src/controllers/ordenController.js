// Controller de ordenes: solo traduce HTTP <-> caso de uso
const crearOrdenController = ({ ordenUseCase }) => {
  // El usuario sale del token (req.usuario), nunca del body
  const crear = async (req, res) => {
    const orden = await ordenUseCase.crearOrden({ usuarioId: req.usuario.id, items: req.body.items })
    res.status(201).json(orden)
  }

  const listarMias = async (req, res) => {
    const ordenes = await ordenUseCase.listarMias(req.usuario.id)
    res.status(200).json(ordenes)
  }

  return { crear, listarMias }
}

module.exports = crearOrdenController
