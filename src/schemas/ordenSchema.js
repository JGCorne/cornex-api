const { z } = require('zod')

// Mensaje si el body no llega o no es un objeto
const errorBody = { error: 'El cuerpo de la peticion debe ser un objeto JSON' }

const itemSchema = z.object({
  productoId: z
    .number({ error: 'El productoId es obligatorio y debe ser un numero' })
    .int('El productoId debe ser un numero entero')
    .positive('El productoId debe ser mayor a 0'),
  cantidad: z
    .number({ error: 'La cantidad es obligatoria y debe ser un numero' })
    .int('La cantidad debe ser un numero entero')
    .positive('La cantidad debe ser mayor a 0')
})

// Alta de orden (POST /ordenes). Body: { items: [{ productoId, cantidad }] }
const crearOrdenSchema = z.object({
  items: z
    .array(itemSchema, { error: 'items es obligatorio y debe ser una lista' })
    .min(1, 'La orden debe tener al menos un item')
    // Un producto no se puede repetir en la misma orden (ademas, la PK de items_orden lo impide)
    .refine(
      (items) => new Set(items.map((i) => i.productoId)).size === items.length,
      'No se puede repetir un producto en la misma orden'
    )
}, errorBody)

module.exports = { crearOrdenSchema }
