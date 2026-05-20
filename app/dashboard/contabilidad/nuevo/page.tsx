'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NuevoProyecto() {
  const router = useRouter()

  const [nombre, setNombre] = useState('')
  const [valorTotal, setValorTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const crearProyecto = async () => {
    if (!nombre || valorTotal <= 0) {
      alert('Completa los datos correctamente')
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('proyectos')
      .insert({
        nombre,
        valor_total: valorTotal
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      alert('Error creando proyecto')
      setLoading(false)
      return
    }

    // redirigir al proyecto creado
    router.push(`/dashboard/contabilidad/${data.id}`)
  }

  return (
    <div className="p-6 max-w-xl">

      <h1 className="text-2xl font-bold mb-6">
        Crear Proyecto
      </h1>

      <div className="flex flex-col gap-4">

        <input
          placeholder="Nombre del proyecto"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="border p-3 rounded"
        />

        <input
          type="number"
          placeholder="Valor total"
          value={valorTotal}
          onChange={(e) => setValorTotal(Number(e.target.value))}
          className="border p-3 rounded"
        />

        <button
          onClick={crearProyecto}
          disabled={loading}
          className="bg-blue-600 text-white p-3 rounded"
        >
          {loading ? 'Creando...' : 'Crear Proyecto'}
        </button>

      </div>
    </div>
  )
}