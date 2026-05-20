import Link from 'next/link'
import { Proyecto } from '@/types/contabilidad'

interface Props {
  proyectos: Proyecto[]
}

export default function TablaProyectos({ proyectos }: Props) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Valor</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        {proyectos.map((p) => (
          <tr key={p.id}>
            <td>{p.nombre}</td>
            <td>${p.valor_total}</td>
            <td>
              <Link href={`/dashboard/contabilidad/${p.id}`}>
                Ver
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}