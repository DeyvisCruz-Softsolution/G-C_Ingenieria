'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { calcularCaja } from '@/lib/contabilidad'
import { formatCOP } from '@/lib/formato'

import {
  Proyecto,
  Ingreso,
  Egreso,
  Resumen
} from '@/types/contabilidad'

export default function ProyectoDetalle() {
  const { id } = useParams()

  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [ingresos, setIngresos] = useState<Ingreso[]>([])
  const [egresos, setEgresos] = useState<Egreso[]>([])
  const [resumen, setResumen] = useState<Resumen>({
    totalIngresos: 0,
    totalEgresos: 0,
    caja: 0
  })

  const [loading, setLoading] = useState(false)

  const [porcentaje, setPorcentaje] = useState(0)
  const [retefuente, setRetefuente] = useState(0)
  const [reteica, setReteica] = useState(0)

  const [tipo, setTipo] = useState('')
  const [valor, setValor] = useState(0)
  const [descripcion, setDescripcion] = useState('')

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      setLoading(true)

      const { data: proyectoData } = await supabase
        .from('proyectos')
        .select('*')
        .eq('id', id)
        .single()

      const { data: ingresosData } = await supabase
        .from('ingresos')
        .select('*')
        .eq('proyecto_id', id)

      const { data: egresosData } = await supabase
        .from('egresos')
        .select('*')
        .eq('proyecto_id', id)

      const ingresosTipados = (ingresosData || []) as Ingreso[]
      const egresosTipados = (egresosData || []) as Egreso[]

      setProyecto(proyectoData)
      setIngresos(ingresosTipados)
      setEgresos(egresosTipados)

      const calc = calcularCaja(ingresosTipados, egresosTipados)
      setResumen(calc)

      setLoading(false)
    }

    fetchData()
  }, [id])

  const porcentajeActual = ingresos.reduce(
    (acc, i) => acc + Number(i.porcentaje || 0),
    0
  )

  const registrarIngreso = async () => {
    if (!proyecto) return

    if (porcentaje <= 0) {
      alert('El porcentaje debe ser mayor a 0')
      return
    }

    if (porcentajeActual + porcentaje > 100) {
      alert(`Ya tienes ${porcentajeActual}%. No puedes superar el 100%`)
      return
    }

    const valorEsperado =
      (porcentaje / 100) * Number(proyecto.valor_total)

    const totalRetenciones =
      Number(retefuente) + Number(reteica)

    const valorRecibido = valorEsperado - totalRetenciones

    if (valorRecibido < 0) {
      alert('El valor recibido no puede ser negativo')
      return
    }

    await supabase.from('ingresos').insert({
      proyecto_id: proyecto.id,
      porcentaje,
      valor_esperado: valorEsperado,
      retefuente,
      reteica,
      reteiva: 0,
      valor_recibido: valorRecibido
    })

    location.reload()
  }

  const registrarEgreso = async () => {
    if (!tipo || valor <= 0) {
      alert('Completa correctamente el egreso')
      return
    }

    if (valor > resumen.caja) {
      alert('No tienes suficiente caja')
      return
    }

    await supabase.from('egresos').insert({
      proyecto_id: id,
      tipo,
      valor,
      descripcion
    })

    location.reload()
  }

  if (loading || !proyecto)
    return <p className="p-6">Cargando...</p>

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">{proyecto.nombre}</h1>
        <p className="text-gray-500">
          Valor total: {formatCOP(proyecto.valor_total)}
        </p>
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Ingresos" value={formatCOP(resumen.totalIngresos)} color="blue" />
        <Card title="Gastos" value={formatCOP(resumen.totalEgresos)} color="red" />
        <Card
          title="Caja"
          value={formatCOP(resumen.caja)}
          color={resumen.caja >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* INGRESOS */}
      <div className="bg-white p-5 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-semibold">Ingresos</h2>

        <p className="text-sm text-gray-500">
          Acumulado: {porcentajeActual}%
        </p>

        <div className="grid md:grid-cols-4 gap-2">
          <Input
            placeholder="%"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPorcentaje(Number(e.target.value))
            }
          />
          <Input
            placeholder="ReteFuente"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setRetefuente(Number(e.target.value))
            }
          />
          <Input
            placeholder="ReteICA"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setReteica(Number(e.target.value))
            }
          />
          <Button color="green" onClick={registrarIngreso}>
            Agregar
          </Button>
        </div>

        <Table<Ingreso>
          data={ingresos}
          columns={[
            { key: 'porcentaje', label: '%' },
            { key: 'valor_recibido', label: 'Valor', format: formatCOP }
          ]}
        />
      </div>

      {/* EGRESOS */}
      <div className="bg-white p-5 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-semibold">Egresos</h2>

        <div className="grid md:grid-cols-4 gap-2">
          <Input
            placeholder="Tipo"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTipo(e.target.value)
            }
          />
          <Input
            placeholder="Valor"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setValor(Number(e.target.value))
            }
          />
          <Input
            placeholder="Descripción"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDescripcion(e.target.value)
            }
          />
          <Button color="red" onClick={registrarEgreso}>
            Agregar
          </Button>
        </div>

        <Table<Egreso>
          data={egresos}
          columns={[
            { key: 'tipo', label: 'Tipo' },
            { key: 'valor', label: 'Valor', format: formatCOP }
          ]}
        />
      </div>

    </div>
  )
}

/* COMPONENTES TIPADOS */

type CardProps = {
  title: string
  value: string
  color: 'blue' | 'red' | 'green'
}

function Card({ title, value, color }: CardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600'
  }

  return (
    <div className={`p-4 rounded-xl shadow ${colors[color]}`}>
      <p className="text-sm">{title}</p>
      <h3 className="text-xl font-bold">{value}</h3>
    </div>
  )
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

function Input(props: InputProps) {
  return (
    <input
      {...props}
      className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  )
}

type ButtonProps = {
  children: React.ReactNode
  color: 'green' | 'red'
} & React.ButtonHTMLAttributes<HTMLButtonElement>

function Button({ children, color, ...props }: ButtonProps) {
  const colors = {
    green: 'bg-green-600 hover:bg-green-700',
    red: 'bg-red-600 hover:bg-red-700'
  }

  return (
    <button
      {...props}
      className={`text-white rounded-lg px-4 ${colors[color]}`}
    >
      {children}
    </button>
  )
}

type Column<T> = {
  key: keyof T
  label: string
  format?: (value: number) => string
}

type TableProps<T> = {
  data: T[]
  columns: Column<T>[]
}

function Table<T extends { id: string }>({ data, columns }: TableProps<T>) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-500 border-b">
          {columns.map((col) => (
            <th key={String(col.key)} className="py-2">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id} className="border-b hover:bg-gray-50">
            {columns.map((col) => (
              <td key={String(col.key)} className="py-2">
                {col.format
                  ? col.format(Number(row[col.key]))
                  : String(row[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}