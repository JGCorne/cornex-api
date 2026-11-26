const { z } = require('zod')
const { listas } = require('../config')

// Mensaje si el body no llega o no es un objeto
const errorBody = { error: 'El cuerpo de la peticion debe ser un objeto JSON' }

// Enums tomados de config/listas.json (la misma fuente que usa el modelo)
const plataforma = z.enum(listas.plataformas, { error: `La plataforma debe ser una de: ${listas.plataformas.join(', ')}` })
const formato = z.enum(listas.formatos, { error: `El formato debe ser uno de: ${listas.formatos.join(', ')}` })
const condicion = z.enum(listas.condiciones, { error: `La condicion debe ser una de: ${listas.condiciones.join(', ')}` })
const empresa = z.enum(listas.empresas, { error: `La empresa debe ser una de: ${listas.empresas.join(', ')}` })

// Alta de producto (POST /productos)
const crearProductoSchema = z.object({
  nombre: z
    .string({ error: 'El nombre es obligatorio' })
    .trim()
    .min(1, 'El nombre no puede estar vacio'),
  tipo: z.enum(['juego', 'consola'], { error: 'El tipo debe ser juego o consola' }),
  plataforma,
  formato,
  condicion,
  empresa,
  precio: z
    .number({ error: 'El precio es obligatorio y debe ser un numero' })
    .positive('El precio debe ser mayor a 0'),
  stock: z
    .number({ error: 'El stock es obligatorio y debe ser un numero' })
    .int('El stock debe ser un numero entero')
    .min(0, 'El stock no puede ser negativo')
}, errorBody)

// Filtros opcionales del listado (GET /productos?plataforma=PS5&condicion=nuevo)
const filtrosProductoSchema = z.object({
  plataforma: plataforma.optional(),
  formato: formato.optional(),
  condicion: condicion.optional(),
  empresa: empresa.optional()
})

// Parametro :id de la ruta (llega como texto, se convierte a numero)
const idProductoSchema = z.object({
  id: z.coerce
    .number({ error: 'El id debe ser un numero' })
    .int('El id debe ser un numero entero')
    .positive('El id debe ser mayor a 0')
})

module.exports = { crearProductoSchema, filtrosProductoSchema, idProductoSchema }
