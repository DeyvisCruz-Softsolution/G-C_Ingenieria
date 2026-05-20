'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Cotizacion {
  id: string
  numero_cotizacion: string
  cliente_id: string
  total: number
  estado: string
  created_at: string
}

interface Cliente {
  id: string
  empresa: string
}

export default function HistorialCotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filtroEstado, setFiltroEstado] = useState<string>('todas')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true)

      const { data: clientesData } = await supabase
        .from('clientes')
        .select('id, empresa')

      if (clientesData) {
        setClientes(clientesData)
      }

      let query = supabase
        .from('cotizaciones')
        .select('*')
        .order('created_at', { ascending: false })

      if (filtroEstado !== 'todas') {
        query = query.eq('estado', filtroEstado)
      }

      const { data, error } = await query

      if (!error && data) {
        setCotizaciones(data)
      }

      setLoading(false)
    }

    cargarDatos()
  }, [filtroEstado])

  const obtenerNombreCliente = (cliente_id: string) => {
    const cliente = clientes.find(c => c.id === cliente_id)
    return cliente?.empresa || 'Cliente'
  }

  const colorEstado = (estado: string) => {
    switch (estado) {
      case 'borrador':
        return 'bg-gray-500'
      case 'enviada':
        return 'bg-yellow-500'
      case 'aprobada':
        return 'bg-green-600'
      case 'facturada':
        return 'bg-blue-600'
      default:
        return 'bg-gray-500'
    }
  }

  const eliminarCotizacion = async (id: string, estado: string) => {
    if (estado === 'facturada') 
      return alert('No se puede eliminar una cotización facturada')

    if (!confirm('¿Deseas eliminar esta cotización?')) return

    await supabase.from('cotizacion_items').delete().eq('cotizacion_id', id)

    const { error } = await supabase
      .from('cotizaciones')
      .delete()
      .eq('id', id)

    if (error) return alert('Error eliminando cotización')

    setCotizaciones(cotizaciones.filter(c => c.id !== id))
    alert('Cotización eliminada correctamente')
  }

  const generarFactura = async (cotizacion: Cotizacion) => {
    if (cotizacion.estado !== 'aprobada') {
      return alert('Solo cotizaciones aprobadas pueden generar factura')
    }

    // 🔹 Verificar si ya existe factura
    const { data: facturaExistente } = await supabase
      .from('facturas')
      .select('id')
      .eq('cotizacion_id', cotizacion.id)
      .maybeSingle()

    if (facturaExistente) {
      return alert('Esta cotización ya tiene una factura generada')
    }

    // 🔹 Obtener items
    const { data: itemsCotizacion, error: errorItems } = await supabase
      .from('cotizacion_items')
      .select('*')
      .eq('cotizacion_id', cotizacion.id)

    if (errorItems || !itemsCotizacion) {
      return alert('Error obteniendo items de la cotización')
    }

    const numeroFactura = `FAC-${Date.now()}`

    // 🔹 Crear factura
    const { data: nuevaFactura, error: errorFactura } = await supabase
      .from('facturas')
      .insert([
        {
          cotizacion_id: cotizacion.id,
          numero_factura: numeroFactura,
          cliente_id: cotizacion.cliente_id,
          subtotal: cotizacion.total,
          iva: 0,
          total: cotizacion.total,
          estado: 'emitida'
        }
      ])
      .select()
      .single()

    if (errorFactura || !nuevaFactura) {
      return alert('Error creando factura')
    }

    // 🔹 Insertar factura_items
    const itemsFactura = itemsCotizacion.map((item) => ({
      factura_id: nuevaFactura.id,
      servicio_id: item.servicio_id,
      cantidad: item.cantidad,
      valor_unitario: item.valor_unitario,
      total: item.total
    }))

    const { error: errorInsertItems } = await supabase
      .from('factura_items')
      .insert(itemsFactura)

    if (errorInsertItems) {
      return alert('Error copiando items a factura')
    }

    // 🔹 Marcar cotización como facturada
    await supabase
      .from('cotizaciones')
      .update({ estado: 'facturada' })
      .eq('id', cotizacion.id)

    alert('Factura generada correctamente')

    setCotizaciones(prev =>
      prev.map(c =>
        c.id === cotizacion.id
          ? { ...c, estado: 'facturada' }
          : c
      )
    )
  }

  return (
    <div className="min-h-screen bg-[#0A1628] text-gray-200 p-10">
      <h1 className="text-3xl font-bold text-[#FF6B00] mb-8">
        Historial de Cotizaciones
      </h1>

      <div className="flex gap-3 mb-6">
        {['todas', 'borrador', 'enviada', 'aprobada', 'facturada'].map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltroEstado(estado)}
            className={`px-4 py-2 rounded font-semibold ${
              filtroEstado === estado
                ? 'bg-[#FF6B00] text-black'
                : 'bg-[#13233A]'
            }`}
          >
            {estado.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="bg-[#13233A] rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-6">Cargando...</p>
        ) : cotizaciones.length === 0 ? (
          <p className="p-6">No hay cotizaciones.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#0F1E33] text-gray-400 text-sm">
              <tr>
                <th className="p-4">Número</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Total</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Acción</th>
              </tr>
            </thead>

            <tbody>
              {cotizaciones.map((cot) => (
                <tr key={cot.id} className="border-t border-gray-700">
                  <td className="p-4 font-semibold">
                    {cot.numero_cotizacion}
                  </td>

                  <td className="p-4">
                    {obtenerNombreCliente(cot.cliente_id)}
                  </td>

                  <td className="p-4 font-semibold text-[#FF6B00]">
                    {cot.total.toLocaleString('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                    })}
                  </td>

                  <td className="p-4">
                    <span
                      className={`text-xs px-3 py-1 rounded-full text-white ${colorEstado(
                        cot.estado
                      )}`}
                    >
                      {cot.estado.toUpperCase()}
                    </span>
                  </td>

                  <td className="p-4 text-sm">
                    {new Date(cot.created_at).toLocaleDateString('es-CO')}
                  </td>

                  <td className="p-4 flex items-center gap-2">
                    <Link
                      href={`/dashboard/cotizacion?id=${cot.id}`}
                      className="text-[#FF6B00] font-semibold"
                    >
                      Ver / Editar
                    </Link>

                    <button
                      onClick={() => eliminarCotizacion(cot.id, cot.estado)}
                      className="text-red-500 font-semibold"
                    >
                      Eliminar
                    </button>

                    {cot.estado === 'aprobada' && (
                      <button
                        onClick={() => generarFactura(cot)}
                        className="text-blue-500 font-semibold"
                      >
                        Generar Factura
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}