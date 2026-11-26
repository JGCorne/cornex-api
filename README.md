# CORNEX API

## Descripción

API REST de **CORNEX**, una tienda de videojuegos y consolas (físicos y digitales, nuevos y usados). Trabajo práctico final de Taller de Programación 2 (ORT).

Permite registrar clientes, iniciar sesión con JWT y, en próximas etapas, gestionar el catálogo de productos y las órdenes de compra.

## Stack

- **Node.js** + **Express 5** (CommonJS)
- **Sequelize** con **SQLite** como base de datos
- **Zod** para validar los datos de entrada
- **JWT** (`jsonwebtoken`) para la autenticación y **bcrypt** para hashear claves
- **dotenv** para la configuración
- **Jest** para los tests

Arquitectura en capas: `routers → controllers → usecases → daos → models`. Las dependencias se arman a mano en `src/container.js`.

## Instalación y ejecución

Requisitos: Node.js 22 o superior.

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de configuracion y completar los valores
cp .env.example .env

# 3. Crear la base y los 2 usuarios admin (definidos en el .env)
npm run seed

# 4. Levantar el servidor
npm run dev      # con recarga automatica
npm start        # sin recarga
```

El servidor escucha en `http://localhost:3000` (variable `PORT`). `GET /salud` responde `{ "estado": "ok" }`.

La base SQLite se guarda en `data/cornex.sqlite` (variable `DB_PATH`) y no se versiona. `sequelize.sync()` no modifica tablas existentes: si cambia el esquema, borrar el archivo y volver a correr `npm run seed`.

Variables principales del `.env` (ver `.env.example`):

| Variable | Descripción |
|---|---|
| `JWT_SECRET` | Secreto para firmar los tokens. **Obligatoria**: sin ella la app no arranca |
| `JWT_EXPIRES_IN` | Duración del token (ej. `1h`) |
| `BCRYPT_ROUNDS` | Rondas de hasheo de bcrypt |
| `ADMIN1_*`, `ADMIN2_*` | Nombre, email, DNI y clave de los admins que crea el seed |

Para probar los endpoints a mano está `http/auth.http` (extensión REST Client de VS Code).

## Modelo de datos

| Tabla | Columnas | Claves y restricciones |
|---|---|---|
| `usuarios` | `id`, `nombre`, `email`, `dni`, `clave`, `rol`, `createdAt`, `updatedAt` | `email` y `dni` únicos. `rol`: `admin` o `cliente`. `clave` guarda el hash de bcrypt |
| `productos` | `id`, `nombre`, `tipo`, `plataforma`, `formato`, `condicion`, `empresa`, `precio`, `stock`, `activo` | Único por (`nombre`, `plataforma`, `formato`, `condicion`). Valores permitidos en `config/listas.json` |
| `ordenes` | `id`, `usuarioId`, `porcentajeDescuento`, `total`, `createdAt` | FK `usuarioId → usuarios.id`. `porcentajeDescuento`: 0 o 25 |
| `items_orden` | `ordenId`, `productoId`, `cantidad`, `precioUnitario` | PK compuesta (`ordenId`, `productoId`). FK a `ordenes` y `productos` |

Relaciones:

- Un **usuario** tiene muchas **órdenes**.
- Una **orden** tiene muchos **productos** a través de **items_orden**, que guarda la cantidad y el precio al momento de la compra. Desde una orden, los ítems se incluyen con `as: 'items'`.
- Todas las FK usan `ON DELETE RESTRICT`: no se puede borrar un usuario con órdenes, ni una orden o un producto con ítems, para no perder el historial.

## Endpoints

Formato de error estándar en toda la API:

```json
{ "mensaje": "Descripcion del error", "detalles": { } }
```

`detalles` es opcional. En los errores de validación (400) trae `{ formErrors, fieldErrors }` con los mensajes por campo.

### Auth

| Método | Ruta | Requiere auth | Body | Respuestas |
|---|---|---|---|---|
| POST | `/auth/registro` | No | `{ nombre, email, dni, clave }` | **201** usuario creado (sin clave) · **400** datos inválidos · **409** email o DNI repetido |
| POST | `/auth/login` | No | `{ email, clave }` | **200** `{ token, usuario }` · **400** datos inválidos · **401** credenciales inválidas |
| GET | `/auth/perfil` | Sí (`Authorization: Bearer <token>`) | — | **200** usuario (sin clave) · **401** sin token, token inválido o expirado · **404** usuario no encontrado |

Notas:

- El registro siempre crea usuarios con rol `cliente`. Si el body incluye `rol`, se ignora.
- Validaciones del registro: `nombre` no vacío, `email` válido (se guarda en minúsculas y sin espacios), `dni` de 7 u 8 dígitos y `clave` de al menos 8 caracteres.
- El login devuelve el mismo error si el email no existe o si la clave es incorrecta.
- El token contiene `{ sub: id, rol }` y vence según `JWT_EXPIRES_IN`.

Otros:

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/salud` | **200** `{ "estado": "ok" }` |
| * | Ruta inexistente | **404** `{ "mensaje": "Ruta no encontrada: <método> <url>" }` |

## Reglas de negocio

Pendiente.

## Tests

Pendiente.
