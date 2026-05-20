import { Resumen } from '@/types/contabilidad'

interface Props {
  data: Resumen
}

export default function ResumenGlobal({ data }: Props) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <Card title="Ingresos" value={data.totalIngresos} />
      <Card title="Gastos" value={data.totalEgresos} />
      <Card title="Utilidad" value={data.caja} />
      <Card title="Caja" value={data.caja} />
    </div>
  )
}

interface CardProps {
  title: string
  value: number
}

function Card({ title, value }: CardProps) {
  return (
    <div className="p-4 shadow rounded bg-white">
      <p className="text-sm">{title}</p>
      <h3 className="text-xl font-bold">${value}</h3>
    </div>
  )
}