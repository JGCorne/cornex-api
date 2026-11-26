const { z } = require('zod')

// Mensaje si el body no llega o no es un objeto
const errorBody = { error: 'El cuerpo de la peticion debe ser un objeto JSON' }

// z.object descarta los campos que no estan definidos: si llega un "rol" en el body, se ignora
const registroSchema = z.object({
  nombre: z
    .string({ error: 'El nombre es obligatorio' })
    .trim()
    .min(1, 'El nombre no puede estar vacio'),
  email: z
    .string({ error: 'El email es obligatorio' })
    .trim()
    .toLowerCase()
    .email('El email no es valido'),
  dni: z
    .string({ error: 'El DNI es obligatorio' })
    .regex(/^\d{7,8}$/, 'El DNI debe tener 7 u 8 digitos'),
  clave: z
    .string({ error: 'La clave es obligatoria' })
    .min(8, 'La clave debe tener al menos 8 caracteres')
}, errorBody)

const loginSchema = z.object({
  // Se normaliza igual que en el registro para que el email coincida con el guardado
  email: z
    .string({ error: 'El email es obligatorio' })
    .trim()
    .toLowerCase()
    .min(1, 'El email es obligatorio'),
  clave: z
    .string({ error: 'La clave es obligatoria' })
    .min(1, 'La clave es obligatoria')
}, errorBody)

module.exports = { registroSchema, loginSchema }
