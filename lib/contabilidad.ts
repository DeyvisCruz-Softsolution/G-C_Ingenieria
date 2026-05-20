import { Ingreso, Egreso, Resumen } from '@/types/contabilidad'

export const calcularCaja = (
  ingresos: Ingreso[],
  egresos: Egreso[]
): Resumen => {
  const totalIngresos = ingresos.reduce((acc, i) => {
    return acc + (i.valor_recibido ? Number(i.valor_recibido) : 0)
  }, 0)

  const totalEgresos = egresos.reduce((acc, e) => {
    return acc + (e.valor ? Number(e.valor) : 0)
  }, 0)

  return {
    totalIngresos,
    totalEgresos,
    caja: totalIngresos - totalEgresos
  }
}