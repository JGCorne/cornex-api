// Controller de reportes: solo traduce HTTP <-> caso de uso
const crearReporteController = ({ reporteUseCase }) => {
  // req.query ya trae desde/hasta como Date (lo convierte validar(reporteVentasSchema, 'query'))
  const ventas = async (req, res) => {
    const reporte = await reporteUseCase.ventas(req.query)
    res.status(200).json(reporte)
  }

  return { ventas }
}

module.exports = crearReporteController
