'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AccesoContable() {
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const validar = async () => {
    if (!correo || !clave) {
      alert('Ingresa correo y clave')
      return
    }

    setLoading(true)

    try {
      // 🔐 Buscar clave activa para ese usuario
      const { data: acceso, error: errorAcceso } = await supabase
        .from('acceso_contable')
        .select('usuario, clave')
        .eq('usuario', correo)
        .eq('clave', clave)
        .eq('activo', true)
        .single()

      if (errorAcceso || !acceso) {
        alert('Correo o clave incorrectos')
        setLoading(false)
        return
      }

      // 🔎 Verificar que el usuario exista en socios
      const { data: socio, error: errorSocio } = await supabase
        .from('socios')
        .select('nombre, email')
        .eq('email', correo)
        .single()

      if (errorSocio || !socio) {
        alert('Usuario no autorizado')
        setLoading(false)
        return
      }

      // 🧾 Registrar log
      await supabase.from('logs_contabilidad').insert({
        usuario: socio.email,
        nombre: socio.nombre,
        accion: 'Ingreso a contabilidad',
        fecha: new Date()
      })

      // ✅ Marcar acceso y redirigir
      sessionStorage.setItem('acceso_contable', 'true')
      router.push('/dashboard/contabilidad')

    } catch (error) {
      console.error('Error validando acceso:', error)
      alert('Error validando acceso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-black p-6 rounded-xl shadow w-80 space-y-4">
        <h2 className="text-xl font-bold text-center">🔐 Acceso Contabilidad</h2>

        <input
          type="email"
          placeholder="Correo del socio"
          className="border p-2 w-full text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />

        <input
          type="password"
          placeholder="Clave"
          className="border p-2 w-full text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />

        <button
          onClick={validar}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-lg transition"
        >
          {loading ? 'Validando...' : 'Ingresar'}
        </button>
      </div>
    </div>
  )
}