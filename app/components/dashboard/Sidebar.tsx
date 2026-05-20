'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const linkStyle = (path: string) =>
    `block px-4 py-3 rounded-lg transition-all duration-300 ${
      pathname === path
        ? 'bg-orange-500 text-black shadow-[0_0_15px_rgba(255,85,0,0.7)]'
        : 'hover:bg-gray-800 hover:text-orange-400'
    }`

  return (
    <aside className="w-64 bg-black border-r border-orange-500 p-6">
      <h2 className="text-2xl font-bold text-orange-500 mb-10">
        G&C Admin
      </h2>

      <nav className="space-y-3">
        <Link href="/dashboard" className={linkStyle('/dashboard')}>
          Panel Principal
        </Link>
        <Link href="/dashboard/clientes" className={linkStyle('/dashboard/clientes')}>
          Registro Nuevo Cliente
        </Link>
        <Link href="/dashboard/cotizacion" className={linkStyle('/dashboard/cotizacion')}>
          Cotización
        </Link>
        <Link href="/dashboard/cotizaciones" className={linkStyle('/dashboard/cotizaciones')}>
          Historial Cotizaciones
        </Link>
        <Link href="/dashboard/facturas" className={linkStyle('/dashboard/facturas')}>
          Historial Facturas
        </Link>

        {/* Contabilidad: acceso controlado por clave en la página */}
        <Link
          href="/dashboard/contabilidad/acceso"
          className={linkStyle('/dashboard/contabilidad/acceso')}
        >
          Contabilidad
        </Link>
      </nav>
    </aside>
  )
}