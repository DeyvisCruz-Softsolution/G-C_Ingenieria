'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ClientesPage() {
  const [form, setForm] = useState({
    nombre: '',
    empresa: '',
    nit: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    representante_legal: '',
    cargo_representante: '',
    observaciones: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const guardarCliente = async () => {
    const { error } = await supabase
      .from('clientes')
      .insert([form])

    if (error) {
      alert('Error guardando cliente')
      console.log(error)
    } else {
      alert('Cliente guardado correctamente')
      setForm({
        nombre: '',
        empresa: '',
        nit: '',
        telefono: '',
        email: '',
        direccion: '',
        ciudad: '',
        representante_legal: '',
        cargo_representante: '',
        observaciones: '',
      })
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-2xl text-orange-500 mb-6">
        Nuevo Cliente
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} className="p-2 bg-black border border-gray-700 rounded" />
        <input name="empresa" placeholder="Empresa" value={form.empresa} onChange={handleChange} className="p-2 bg-black border border-gray-700 rounded" />
        <input name="nit" placeholder="NIT" value={form.nit} onChange={handleChange} className="p-2 bg-black border border-gray-700 rounded" />
        <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} className="p-2 bg-black border border-gray-700 rounded" />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="p-2 bg-black border border-gray-700 rounded" />
        <input name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} className="p-2 bg-black border border-gray-700 rounded" />
        <input name="ciudad" placeholder="Ciudad" value={form.ciudad} onChange={handleChange} className="p-2 bg-black border border-gray-700 rounded" />
        <input name="representante_legal" placeholder="Representante Legal" value={form.representante_legal} onChange={handleChange} className="p-2 bg-black border border-gray-700 rounded" />
        <input name="cargo_representante" placeholder="Cargo Representante" value={form.cargo_representante} onChange={handleChange} className="p-2 bg-black border border-gray-700 rounded" />

      </div>

      <textarea
        name="observaciones"
        placeholder="Observaciones"
        value={form.observaciones}
        onChange={handleChange}
        className="mt-4 w-full p-2 bg-black border border-gray-700 rounded"
      />

      <button
        onClick={guardarCliente}
        className="mt-6 px-6 py-3 bg-orange-500 text-black font-bold rounded"
      >
        Guardar Cliente
      </button>
    </div>
  )
}