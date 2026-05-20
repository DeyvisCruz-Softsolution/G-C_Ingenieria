'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ResumenGlobal from '@/components/contabilidad/ResumenGlobal'
import TablaProyectos from '@/components/contabilidad/TablaProyectos'
import { Proyecto } from '@/types/contabilidad'

interface Resumen {
  totalIngresos: number
  totalEgresos: number
  caja: number
}

export default function ContabilidadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(true)
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [resumen, setResumen] = useState<Resumen>({
    totalIngresos: 0,
    totalEgresos: 0,
    caja: 0
  })

  useEffect(() => {
    const verificarAcceso = () => {
      const acceso = sessionStorage.getItem('acceso_contable')

      if (!acceso) {
        router.push('/dashboard/contabilidad/acceso')
      } else {
        // 🔔 Notificación de ingreso
        const userName = sessionStorage.getItem('nombre_usuario') || 'Un socio'

        // Evitar duplicados por React Strict Mode
        const notificado = sessionStorage.getItem('notificado_ingreso')

        if (!notificado) {
          fetch('https://tdizyrendjubmphfcyzi.supabase.co/functions/v1/notificar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName }),
          })
            .then(res => res.json())
            .then(data => console.log('Notificación enviada:', data))
            .catch(err => console.error('Error notificando ingreso:', err))

          sessionStorage.setItem('notificado_ingreso', 'true')
        }

        cargarDatos()
      }
    }

    const cargarDatos = async () => {
      try {
        setLoading(true)

        const { data: proyectosData } = await supabase.from('proyectos').select('*')
        const { data: ingresosData } = await supabase.from('ingresos').select('*')
        const { data: egresosData } = await supabase.from('egresos').select('*')

        setProyectos(proyectosData || [])

        const totalIngresos = (ingresosData || []).reduce(
          (acc, i: { valor: number }) => acc + i.valor,
          0
        )

        const totalEgresos = (egresosData || []).reduce(
          (acc, e: { valor: number }) => acc + e.valor,
          0
        )

        setResumen({
          totalIngresos,
          totalEgresos,
          caja: totalIngresos - totalEgresos
        })

      } catch (error) {
        console.error(error)
        alert('Error cargando datos contables')
      } finally {
        setLoading(false)
      }
    }

    verificarAcceso()
  }, [router])

  if (loading) return <p>Cargando datos...</p>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contabilidad</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => router.push('/dashboard/contabilidad/nuevo')}
        >
          + Nuevo Proyecto
        </button>
      </div>

      <ResumenGlobal data={resumen} />

      <div className="mt-6">
        <TablaProyectos proyectos={proyectos} />
      </div>
    </div>
  )
}