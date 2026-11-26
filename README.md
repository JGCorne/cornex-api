# CORNEX API

## Descripción

API REST de **CORNEX**, una tienda de videojuegos y consolas (físicos y digitales, nuevos y usados). Trabajo práctico final de Taller de Programación 2 (ORT).

Permite registrar clientes, iniciar sesión con JWT, gestionar el catálogo de productos, comprar (órdenes con descuento para clientes nuevos y control de stock) y consultar un reporte de ventas.

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
| `DESCUENTO_PORCENTAJE` | Porcentaje de descuento para clientes nuevos (por defecto `25`) |
| `DESCUENTO_DIAS` | Días desde el alta en los que el cliente tiene descuento (por defecto `30`) |

Para probar los endpoints a mano están `http/auth.http`, `http/productos.http`, `http/ordenes.http` y `http/reportes.http` (extensión REST Client de VS Code).

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

### Productos

| Método | Ruta | Requiere auth | Body / Query | Respuestas |
|---|---|---|---|---|
| POST | `/productos` | Sí, rol `admin` | `{ nombre, tipo, plataforma, formato, condicion, empresa, precio, stock }` | **201** producto creado · **400** datos inválidos · **401** sin token · **403** no es admin · **409** producto duplicado |
| GET | `/productos` | No | Query opcional: `plataforma`, `formato`, `condicion`, `empresa` | **200** lista de productos activos · **400** filtro con valor inválido |
| GET | `/productos/:id` | No | — | **200** producto · **400** id inválido · **404** no existe o está inactivo |

Notas:

- `tipo`: `juego` o `consola`. `plataforma`, `formato`, `condicion` y `empresa` deben ser valores de `config/listas.json`.
- `precio` es un número mayor a 0 y `stock` un entero mayor o igual a 0.
- No puede haber dos productos con el mismo `nombre`, `plataforma`, `formato` y `condicion` (**409**).
- El catálogo público solo muestra productos con `activo: true`.

### Órdenes

| Método | Ruta | Requiere auth | Body | Respuestas |
|---|---|---|---|---|
| POST | `/ordenes` | Sí, rol `cliente` | `{ items: [{ productoId, cantidad }] }` | **201** orden creada con sus ítems · **400** datos inválidos · **401** sin token · **403** no es cliente · **404** producto inexistente · **409** producto inactivo o sin stock suficiente |
| GET | `/ordenes/mias` | Sí (cualquier rol) | — | **200** órdenes del usuario logueado, de la más nueva a la más vieja · **401** sin token |

Notas:

- `items` debe tener al menos un ítem, `cantidad` es un entero mayor a 0 y no se puede repetir un `productoId` en la misma orden.
- El usuario de la orden se toma del token, nunca del body.
- Respuesta: `{ id, usuarioId, porcentajeDescuento, total, createdAt, items: [{ productoId, nombre, plataforma, cantidad, precioUnitario }] }`.

### Reportes

| Método | Ruta | Requiere auth | Query | Respuestas |
|---|---|---|---|---|
| GET | `/reportes/ventas` | Sí, rol `admin` | Opcional: `desde`, `hasta` (fechas ISO) | **200** reporte · **400** fecha inválida o `desde` posterior a `hasta` · **401** sin token · **403** no es admin |

Respuesta:

```json
{
  "cantidadOrdenes": 2,
  "totalVendido": 600059.97,
  "ventasPorPlataforma": [{ "plataforma": "PS5", "unidades": 1, "monto": 600000 }],
  "topProductos": [{ "productoId": 1, "nombre": "Uncharted 4", "unidades": 4, "monto": 59.97 }]
}
```

- `desde` y `hasta` aceptan `AAAA-MM-DD` o fecha y hora ISO (`2026-11-01T10:00:00Z`). Se interpretan en UTC y filtran por la fecha de creación de la orden. Si `hasta` es solo una fecha, incluye ese día completo.
- Los montos salen de `items_orden` (`precioUnitario × cantidad`) con el `porcentajeDescuento` de cada orden aplicado.
- `ventasPorPlataforma` va ordenado de mayor a menor monto. `topProductos` trae los 5 productos con más unidades vendidas; si empatan, va primero el de mayor monto.

Otros:

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/salud` | **200** `{ "estado": "ok" }` |
| * | Ruta inexistente | **404** `{ "mensaje": "Ruta no encontrada: <método> <url>" }` |

## Reglas de negocio

### Descuento para clientes nuevos

- Si el cliente se registró hace `DESCUENTO_DIAS` días **o menos** (30 por defecto), la orden tiene `DESCUENTO_PORCENTAJE` de descuento (25% por defecto). Si no, el descuento es 0.
- El cálculo está en la función pura `calcularDescuento(fechaAltaUsuario, ahora, config)` (`src/usecases/calcularDescuento.js`). El caso de uso recibe `ahora` por parámetro para poder testear los bordes: al día 30 justo hay descuento y al día 31 ya no.
- El porcentaje aplicado queda guardado en la orden (`porcentajeDescuento`).

### Total de la orden

- Se usa el precio del producto al momento de la compra, que queda guardado en `items_orden.precioUnitario`. Si después cambia el precio del producto, la orden no cambia.
- El total se calcula en **centavos enteros** para evitar errores de punto flotante y se redondea **una sola vez al final**: `total = round(Σ(precio × cantidad) × (100 − descuento) / 100)`.

### Stock

- La orden se crea dentro de **una única transacción** de Sequelize. Por cada ítem se verifica que el producto exista (**404**), que esté activo (**409**) y que el stock alcance (**409**), y se descuenta el stock.
- Si cualquier ítem falla, se hace rollback: **no se descuenta el stock de ningún producto** y no se guarda la orden.
- El descuento de stock es un `UPDATE ... WHERE stock >= cantidad`, así el stock nunca queda negativo aunque haya compras simultáneas.

## Tests

```bash
npm test
```

| Archivo | Qué prueba |
|---|---|
| `tests/authUseCase.test.js` | Registro (hash, rol forzado a cliente, duplicados 409) y login (token, 401) con DAO falso |
| `tests/autorizar.test.js` | Middleware de roles (pasa, 403, 401) |
| `tests/productoUseCase.test.js` | Alta, duplicado 409, listado solo de activos con filtros y 404, con DAO falso |
| `tests/calcularDescuento.test.js` | Bordes del descuento: días 29, 30 y 31 |
| `tests/ordenUseCase.integracion.test.js` | Integración con **SQLite en memoria**: una orden con un ítem sin stock no descuenta el stock de los otros (rollback), 404, 409, total con descuento y precio del momento |
| `tests/reporteUseCase.test.js` | Totales, ventas por plataforma, top 5 y redondeo del reporte con datos de prueba |

Los tests no usan la base de `data/`: los unitarios usan DAOs falsos y el de integración crea una base SQLite en memoria.
