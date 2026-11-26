const calcularDescuento = require('../src/usecases/calcularDescuento')

const config = { DESCUENTO_PORCENTAJE: 25, DESCUENTO_DIAS: 30 }
const MS_POR_DIA = 24 * 60 * 60 * 1000

const alta = new Date('2026-01-01T12:00:00.000Z')
const diasDespues = (dias) => new Date(alta.getTime() + dias * MS_POR_DIA)

describe('calcularDescuento', () => {
  test('a los 29 dias del alta hay descuento', () => {
    expect(calcularDescuento(alta, diasDespues(29), config)).toBe(25)
  })

  test('a los 30 dias justos del alta todavia hay descuento (borde incluido)', () => {
    expect(calcularDescuento(alta, diasDespues(30), config)).toBe(25)
  })

  test('a los 31 dias del alta ya no hay descuento', () => {
    expect(calcularDescuento(alta, diasDespues(31), config)).toBe(0)
  })

  test('un instante despues de los 30 dias ya no hay descuento', () => {
    const ahora = new Date(diasDespues(30).getTime() + 1)
    expect(calcularDescuento(alta, ahora, config)).toBe(0)
  })

  test('usa los valores de config', () => {
    const otraConfig = { DESCUENTO_PORCENTAJE: 10, DESCUENTO_DIAS: 7 }
    expect(calcularDescuento(alta, diasDespues(7), otraConfig)).toBe(10)
    expect(calcularDescuento(alta, diasDespues(8), otraConfig)).toBe(0)
  })
})
