const { z } = require('zod')

// Acepta fecha ISO (2026-11-01) o fecha y hora ISO (2026-11-01T10:00:00Z / -03:00). Se interpreta en UTC
// finDelDia: si llega solo la fecha en "hasta", se toma hasta el ultimo milisegundo de ese dia (inclusive)
const fechaIso = (finDelDia) =>
  z
    .union([z.iso.date(), z.iso.datetime({ offset: true })], {
      error: 'Debe ser una fecha ISO (AAAA-MM-DD o AAAA-MM-DDTHH:mm:ssZ)'
    })
    .transform((valor) => {
      const soloFecha = valor.length === 10
      return soloFecha && finDelDia ? new Date(`${valor}T23:59:59.999Z`) : new Date(valor)
    })

// Query de GET /reportes/ventas?desde=2026-11-01&hasta=2026-11-30 (ambos opcionales)
const reporteVentasSchema = z
  .object({
    desde: fechaIso(false).optional(),
    hasta: fechaIso(true).optional()
  })
  .refine(({ desde, hasta }) => !desde || !hasta || desde <= hasta, {
    message: 'desde no puede ser posterior a hasta',
    path: ['desde']
  })

module.exports = { reporteVentasSchema }
