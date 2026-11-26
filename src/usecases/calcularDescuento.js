const MS_POR_DIA = 24 * 60 * 60 * 1000

// Funcion pura: devuelve el porcentaje de descuento que le corresponde a un usuario
// Regla: si el usuario se dio de alta hace config.DESCUENTO_DIAS dias o menos, recibe
// config.DESCUENTO_PORCENTAJE; si no, 0. "ahora" se recibe por parametro para poder testear los bordes
const calcularDescuento = (fechaAltaUsuario, ahora, config) => {
  const diasDesdeAlta = (new Date(ahora) - new Date(fechaAltaUsuario)) / MS_POR_DIA
  return diasDesdeAlta <= config.DESCUENTO_DIAS ? config.DESCUENTO_PORCENTAJE : 0
}

module.exports = calcularDescuento
