export interface Proyecto {
  id: string
  nombre: string
  valor_total: number
  created_at?: string
}

export interface Ingreso {
  id: string
  proyecto_id: string
  porcentaje: number
  valor_esperado: number
  retefuente: number
  reteica: number
  reteiva: number
  valor_recibido: number
  fecha?: string
}

export interface Egreso {
  id: string
  proyecto_id: string
  tipo: string
  valor: number
  descripcion?: string
  fecha?: string
}

export interface Resumen {
  totalIngresos: number
  totalEgresos: number
  caja: number
}