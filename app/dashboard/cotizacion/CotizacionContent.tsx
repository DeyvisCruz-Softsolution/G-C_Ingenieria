'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { generarPDFCotizacion } from "@/lib/generarPDF"
import { useSearchParams } from 'next/navigation'
import { crearFacturaDesdeCotizacion } from "@/actions/facturas"
import { generarPDFFactura } from "@/lib/generarPDFFactura"

interface Cliente {
  id: string
  empresa: string
  nombre: string
  email?: string
  telefono?: string
  direccion?: string
  nit?: string
}

interface Servicio {
  id: string
  grupo: string
  item: string
  descripcion: string
  unidad: string
  valor_mano_obra: number
}

interface ItemCotizacion {
  grupo: string
  servicio_id: string
  cantidad: number
  valorUnitario: number
}

interface CotizacionItemDB {
  servicio_id: string
  cantidad: number
  valor_unitario: number
  servicios: { grupo: string } | null
}

export default function CotizacionPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState('')
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [items, setItems] = useState<ItemCotizacion[]>([])
  const [administracion, setAdministracion] = useState(10)
  const [utilidad, setUtilidad] = useState(15)
  const [aplicarIVA, setAplicarIVA] = useState(false)
  const [vistaCliente, setVistaCliente] = useState(false)
  const [numeroCotizacion, setNumeroCotizacion] = useState<string>()
  const [cotizacionId, setCotizacionId] = useState<string | null>(null)
  const [fecha] = useState(() => new Date().toLocaleDateString('es-CO'))
  const [estadoCotizacion, setEstadoCotizacion] = useState<string | null>(null)
  const estaFacturada = estadoCotizacion === 'facturada'
  

  const ivaPorcentaje = 0.19

  useEffect(() => {
    const cargarDatos = async () => {
      const { data: clientesData } = await supabase.from('clientes').select('*')
      if (clientesData) setClientes(clientesData)

      const { data: serviciosData } = await supabase.from('servicios').select('*')
      if (serviciosData) setServicios(serviciosData)

      const { data: configData } = await supabase
        .from('configuracion_empresa')
        .select('*')
        .single()
      if (configData) {
        setAdministracion(Number(configData.administracion_porcentaje))
        setUtilidad(Number(configData.utilidad_porcentaje))
        
      }

      if (id) {
        const { data: cotizacion } = await supabase
          .from('cotizaciones')
          .select('*')
          .eq('id', id)
          .single()

        if (cotizacion) {
          setCotizacionId(cotizacion.id)
          setNumeroCotizacion(cotizacion.numero_cotizacion)
          setClienteSeleccionado(cotizacion.cliente_id)
          setAdministracion(Number(cotizacion.administracion_porcentaje))
          setUtilidad(Number(cotizacion.utilidad_porcentaje))
          setAplicarIVA(cotizacion.iva > 0)
          setEstadoCotizacion(cotizacion.estado)
        }

        const { data: itemsDB } = await supabase
          .from('cotizacion_items')
          .select(`*, servicios (*)`)
          .eq('cotizacion_id', id)

        if (itemsDB) {
          const itemsFormateados = (itemsDB as CotizacionItemDB[]).map((item) => ({
            grupo: item.servicios?.grupo || '',
            servicio_id: item.servicio_id,
            cantidad: item.cantidad,
            valorUnitario: item.valor_unitario,
          }))
          setItems(itemsFormateados)
        }
      }
    }
    cargarDatos()
  }, [id])

  const clienteActivo = clientes.find(c => c.id === clienteSeleccionado)

  const agregarItem = () => {
    setItems([...items, { grupo: '', servicio_id: '', cantidad: 1, valorUnitario: 0 }])
  }

  const actualizarItem = (index: number, campo: string, valor: string | number) => {
    const nuevos = [...items]
    if (campo === 'grupo') {
      nuevos[index] = { grupo: String(valor), servicio_id: '', cantidad: 1, valorUnitario: 0 }
    }
    if (campo === 'servicio_id') {
      const servicio = servicios.find(s => s.id === valor)
      nuevos[index] = {
        ...nuevos[index],
        servicio_id: String(valor),
        valorUnitario: servicio?.valor_mano_obra || 0,
      }
    }
    if (campo === 'cantidad') {
      nuevos[index] = { ...nuevos[index], cantidad: Number(valor) }
    }
    setItems(nuevos)
  }

  const calculo = useMemo(() => {
    const subtotalDirecto = items.reduce((acc, item) => acc + item.cantidad * item.valorUnitario, 0)
    const adminValor = subtotalDirecto * (administracion / 100)
    const subtotalOperativo = subtotalDirecto + adminValor
    const utilidadValor = subtotalOperativo * (utilidad / 100)
    const subtotalAntesIVA = subtotalOperativo + utilidadValor
    const ivaValor = aplicarIVA ? subtotalAntesIVA * ivaPorcentaje : 0
    const totalFinal = subtotalAntesIVA + ivaValor
    return { subtotalDirecto, adminValor, utilidadValor, subtotalAntesIVA, ivaValor, totalFinal }
  }, [items, administracion, utilidad, aplicarIVA])

  const factorCliente = (1 + administracion / 100) * (1 + utilidad / 100)

  const formato = (valor: number) =>
    valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })

  const guardarConfiguracion = async () => {
    await supabase
      .from('configuracion_empresa')
      .update({
        administracion_porcentaje: administracion,
        utilidad_porcentaje: utilidad,
        updated_at: new Date(),
      })
      .not('id', 'is', null)
  }

  const obtenerNumeroCotizacion = async () => {
    const { data, error } = await supabase
      .from('consecutivos')
      .select('*')
      .eq('tipo', 'cotizacion')
      .single()

    if (error || !data) {
      alert('Error obteniendo consecutivo')
      return null
    }

    const numeroActual = data.numero
    await supabase
      .from('consecutivos')
      .update({ numero: numeroActual + 1, updated_at: new Date() })
      .eq('id', data.id)

    const numeroFormateado = String(numeroActual).padStart(6, '0')
    return `COT-${numeroFormateado}`
  }

  const guardarCotizacion = async () => {
    if (estaFacturada) {
  alert('No se puede modificar una cotización facturada')
  return
}
    if (!clienteActivo) return alert('Selecciona un cliente')

    let numeroActual = numeroCotizacion
    const cotizacionActualId = cotizacionId

    if (!numeroActual) {
      const nuevoNumero = await obtenerNumeroCotizacion()
      if (!nuevoNumero) return
      setNumeroCotizacion(nuevoNumero)
      numeroActual = nuevoNumero
    }

    if (!cotizacionActualId) {
      const { data: cotizacionInsertada, error } = await supabase
        .from('cotizaciones')
        .insert({
          cliente_id: clienteActivo.id,
          numero_cotizacion: numeroActual,
          subtotal_directo: calculo.subtotalDirecto,
          administracion_porcentaje: administracion,
          utilidad_porcentaje: utilidad,
          subtotal_antes_iva: calculo.subtotalAntesIVA,
          iva: calculo.ivaValor,
          total: calculo.totalFinal,
          estado: 'borrador',
        })
        .select()
        .single()

      if (error || !cotizacionInsertada) {
        alert('Error guardando cotización')
        return
      }

      setCotizacionId(cotizacionInsertada.id)

      const itemsDB = items.map(item => ({
        cotizacion_id: cotizacionInsertada.id,
        servicio_id: item.servicio_id,
        cantidad: item.cantidad,
        valor_unitario: item.valorUnitario,
        total: item.cantidad * item.valorUnitario,
      }))

      await supabase.from('cotizacion_items').insert(itemsDB)
      alert('Cotización guardada correctamente')
    } else {
      await supabase
        .from('cotizaciones')
        .update({
          subtotal_directo: calculo.subtotalDirecto,
          administracion_porcentaje: administracion,
          utilidad_porcentaje: utilidad,
          subtotal_antes_iva: calculo.subtotalAntesIVA,
          iva: calculo.ivaValor,
          total: calculo.totalFinal,
          updated_at: new Date(),
        })
        .eq('id', cotizacionActualId)

      await supabase
        .from('cotizacion_items')
        .delete()
        .eq('cotizacion_id', cotizacionActualId)

      const itemsDB = items.map(item => ({
        cotizacion_id: cotizacionActualId,
        servicio_id: item.servicio_id,
        cantidad: item.cantidad,
        valor_unitario: item.valorUnitario,
        total: item.cantidad * item.valorUnitario,
      }))

      await supabase.from('cotizacion_items').insert(itemsDB)
      alert('Cotización actualizada correctamente')
    }
  }

const handleGenerarPDF = async () => {
  if (!numeroCotizacion) {
    await guardarCotizacion()
  }
  if (!clienteActivo) return

  const itemsPDF = items.map((item, index) => {
    const servicio = servicios.find(s => s.id === item.servicio_id)

    const valorUnitarioCalculado = vistaCliente
      ? item.valorUnitario * factorCliente
      : item.valorUnitario

    return {
      servicio: servicio?.grupo || "",
      item: servicio?.item || (index + 1).toString(),
      descripcion: servicio?.descripcion || "",
      unidad: servicio?.unidad || "Unidad",
      cantidad: item.cantidad,
      valorUnitario: valorUnitarioCalculado,
      total: item.cantidad * valorUnitarioCalculado
    }
  })

  generarPDFCotizacion({
    cliente: clienteActivo.empresa,
    clienteNombre: clienteActivo.nombre,
    clienteEmail: clienteActivo.email,
    clienteTelefono: clienteActivo.telefono,
    clienteDireccion: clienteActivo.direccion,
    clienteNIT: clienteActivo.nit,
    numeroCotizacion: numeroCotizacion ?? undefined,
    fecha,
    items: itemsPDF,
    total: calculo.totalFinal,
    subtotal: vistaCliente
      ? calculo.subtotalAntesIVA
      : calculo.subtotalDirecto,
    administracion: calculo.adminValor,
    utilidad: calculo.utilidadValor,
    iva: calculo.ivaValor,
    aplicarIVA,
    mostrarDesgloseInterno: !vistaCliente,
  })

  if (cotizacionId) {
    await supabase
      .from('cotizaciones')
      .update({ estado: 'enviada', updated_at: new Date() })
      
      .eq('id', cotizacionId)
  }
}

const cambiarEstado = async (nuevoEstado: string) => {
  const idActual = cotizacionId || id

  if (!idActual) {
    alert('No hay ID de cotización')
    return
  }

  // 🔒 BLOQUEO SI YA ESTÁ FACTURADA
  if (estaFacturada) {
    alert('No se puede cambiar el estado de una cotización facturada')
    return
  }

  const { error } = await supabase
    .from('cotizaciones')
    .update({ estado: nuevoEstado })
    .eq('id', idActual)

  if (error) {
    console.error(error)
    alert('Error actualizando estado')
    return
  }

  // ✅ ACTUALIZA EL ESTADO EN PANTALLA SIN RECARGAR
  setEstadoCotizacion(nuevoEstado)

  alert(`Cotización marcada como ${nuevoEstado}`)
}
const generarFacturaDesdeCotizacion = async () => {
  const idActual = cotizacionId || id

  if (!idActual) {
    alert("No hay ID de cotización")
    return
  }

  // 🔒 Verificar estado de cotización
  const { data: cotizacion } = await supabase
    .from("cotizaciones")
    .select("estado")
    .eq("id", idActual)
    .single()

  if (cotizacion?.estado === "facturada") {
    alert("Esta cotización ya fue facturada")
    return
  }

  try {
    const resultado = await crearFacturaDesdeCotizacion(idActual)

    if (!resultado) {
      alert("No se pudo generar la factura")
      return
    }

    const { factura, cliente } = resultado
    // 📦 Obtener items reales desde la cotización
    const { data: itemsCotizacion } = await supabase
      .from("cotizacion_items")
      .select("*, servicios (*)")
      .eq("cotizacion_id", idActual)

    if (!itemsCotizacion || itemsCotizacion.length === 0) {
  alert("No hay items para facturar")
  return
}

    const itemsPDF = itemsCotizacion.map((item, index) => {
  const servicioObj = item.servicios;
  return {
    servicio: servicioObj?.grupo || "",
    item: servicioObj?.item || (index + 1).toString(),
    descripcion: item.descripcion || servicioObj?.descripcion || "",
    cantidad: item.cantidad,
    unidad: servicioObj?.unidad || "unidad",
    valorUnitario: item.valor_unitario,
    total: item.total
  };
});

    // 🧾 Generar PDF corporativo
    await generarPDFFactura({
  numeroFactura: factura.numero_factura,
  fecha: new Date().toLocaleDateString("es-CO"),

  clienteEmpresa: cliente.empresa,
  clienteNombre: cliente.nombre,
  clienteNIT: cliente.nit,
  clienteDireccion: cliente.direccion,
  clienteTelefono: cliente.telefono,
  clienteEmail: cliente.email,

  items: itemsPDF,

  subtotal: factura.subtotal,
  iva: factura.iva,
  total: factura.total,

  // 👇 ESTA ES LA CLAVE
  vistaCliente: vistaCliente,

  // 👇 necesarios para vista interna
  porcentajeAdmin: administracion,
  porcentajeUtilidad: utilidad
})
// ✅ ACTUALIZA ESTADO LOCAL
setEstadoCotizacion("facturada")
    alert("Factura generada correctamente")

  } catch (error) {
    console.error(error)
    alert("Error generando factura")
  }
}
  return (
    <div className="min-h-screen bg-[#0A1628] text-gray-200 p-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#FF6B00]">Cotización Empresarial</h1>
        <button
          onClick={() => setVistaCliente(!vistaCliente)}
          className="px-6 py-2 bg-[#FF6B00] text-black font-semibold rounded"
        >
          {vistaCliente ? 'Vista Interna' : 'Vista Cliente'}
        </button>
      </div>

      {/* DATOS COTIZACION */}
      {vistaCliente && (
        <div className="bg-[#13233A] text-white p-6 rounded-xl mb-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold mb-2 border-b border-white/30 pb-1">
                DATOS DEL CLIENTE
              </h3>
              <p><strong>Empresa:</strong> {clienteActivo?.empresa}</p>
              <p><strong>Contacto:</strong> {clienteActivo?.nombre}</p>
              <p><strong>NIT:</strong> {clienteActivo?.nit}</p>
              <p><strong>Tel:</strong> {clienteActivo?.telefono}</p>
              <p><strong>Email:</strong> {clienteActivo?.email}</p>
              <p><strong>Dirección:</strong> {clienteActivo?.direccion}</p>
            </div>
            <div className="text-right space-y-2">
              <h3 className="text-lg font-semibold mb-2 border-b border-white/30 pb-1">
                INFORMACIÓN DE COTIZACIÓN
              </h3>
              <p className="text-xl font-bold">N° {numeroCotizacion}</p>
              <p className="text-sm opacity-90">Fecha: {fecha}</p>
            </div>
          </div>
        </div>
      )}

      {/* SELECT CLIENTE */}
      {!vistaCliente && (
        <div className="bg-[#13233A] p-6 rounded-xl mb-8">
          <select
            value={clienteSeleccionado}
            onChange={(e) => setClienteSeleccionado(e.target.value)}
            className="w-full p-3 bg-[#0F1E33] border border-gray-600 rounded"
          >
            <option value="">Seleccionar Cliente</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>
                {c.empresa} - {c.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* TABLA */}
      <div className="bg-[#13233A] rounded-xl p-6 mb-8">
        <div className="grid grid-cols-7 font-semibold border-b border-gray-600 pb-3 mb-4">
          <div>Servicio</div>
          <div>Item</div>
          <div>Descripción</div>
          <div>Cantidad</div>
          <div>Unidad</div>
          <div>Valor Unit.</div>
          <div>Total</div>
        </div>

        {items.map((item, index) => {
          const serviciosFiltrados = servicios.filter(s => s.grupo === item.grupo)
          const servicioSeleccionado = servicios.find(s => s.id === item.servicio_id)

          return (
            <div key={index} className="grid grid-cols-7 gap-4 mb-4 items-center">
              <select
                value={item.grupo}
                disabled={estaFacturada}
                onChange={(e) => actualizarItem(index, 'grupo', e.target.value)}
                className="p-2 bg-[#0F1E33] border border-gray-600 rounded"
              >
                <option value="">Seleccionar</option>
                {[...new Set(servicios.map(s => s.grupo))].map(grupo => (
                  <option key={grupo} value={grupo}>{grupo}</option>
                ))}
              </select>

              <select
                value={item.servicio_id}
                
                onChange={(e) => actualizarItem(index, 'servicio_id', e.target.value)}
                className="p-2 bg-[#0F1E33] border border-gray-600 rounded"
                disabled={!item.grupo || estaFacturada}
              >
                <option value="">Seleccionar</option>
                {serviciosFiltrados.map(s => (
                  <option key={s.id} value={s.id}>{s.item}</option>
                ))}
              </select>

              <div>{servicioSeleccionado?.descripcion}</div>

              <input
                type="number"
                disabled={estaFacturada}
                value={item.cantidad}
                onChange={(e) => actualizarItem(index, 'cantidad', e.target.value)}
                className="p-2 bg-[#0F1E33] border border-gray-600 rounded"
              />

              <div>{servicioSeleccionado?.unidad}</div>

              <div>
                {vistaCliente
                  ? formato(item.valorUnitario * factorCliente)
                  : formato(item.valorUnitario)}
              </div>

              <div className="font-semibold text-[#FF6B00]">
                {vistaCliente
                  ? formato(item.cantidad * item.valorUnitario * factorCliente)
                  : formato(item.cantidad * item.valorUnitario)}
              </div>
            </div>
          )
        })}

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-sm mb-1">% Administración</label>
            <input
              type="number"
              disabled={estaFacturada}
              value={administracion}
              onChange={(e) => setAdministracion(Number(e.target.value))}
              className="w-full p-2 bg-[#0F1E33] border border-gray-600 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">% Utilidad</label>
            <input
              type="number"
              disabled={estaFacturada}
              value={utilidad}
              onChange={(e) => setUtilidad(Number(e.target.value))}
              className="w-full p-2 bg-[#0F1E33] border border-gray-600 rounded"
            />
          </div>
          <button
            onClick={guardarConfiguracion}
            className="mt-4 px-6 py-2 bg-gray-700 rounded"
          >
            Guardar Configuración
          </button>
        </div>

        {!vistaCliente && !estaFacturada && (
          <button
            onClick={agregarItem}
            className="mt-4 px-6 py-2 bg-[#FF6B00] text-black rounded"
          >
            + Agregar Servicio
          </button>
        )}
      </div>

      {/* IVA */}
      <div className="mb-6 flex items-center gap-3">
        <input
          type="checkbox"
          checked={aplicarIVA}
          onChange={(e) => setAplicarIVA(e.target.checked)}
        />
        Aplicar IVA (19%)
      </div>

      {/* RESUMEN */}
      <div className="bg-[#13233A] p-6 rounded-xl">
        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>
            {vistaCliente
              ? formato(calculo.subtotalAntesIVA)
              : formato(calculo.subtotalDirecto)}
          </span>
        </div>

        {aplicarIVA && (
          <div className="flex justify-between mb-2">
            <span>IVA (19%)</span>
            <span>{formato(calculo.ivaValor)}</span>
          </div>
        )}

        {!vistaCliente && (
          <>
            <div className="flex justify-between mb-2">
              <span>Administración</span>
              <span>{formato(calculo.adminValor)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Utilidad</span>
              <span>{formato(calculo.utilidadValor)}</span>
            </div>
          </>
        )}

        <hr className="my-4 border-gray-600" />

        <div className="flex justify-between text-xl font-bold text-[#FF6B00]">
          <span>Total Final</span>
          <span>{formato(calculo.totalFinal)}</span>
        </div>

        <button
          onClick={guardarCotizacion}
          disabled={estaFacturada}
          className="mt-4 w-full bg-gray-700 text-white font-bold py-3 rounded-lg disabled:opacity-40"
>
          Guardar Cotización
        </button>

        {cotizacionId && (
          
          <div className="grid grid-cols-2 gap-4 mt-4">
          <button
  onClick={() => cambiarEstado('aprobada')}
  disabled={estaFacturada}
  className="bg-green-600 text-white font-bold py-2 rounded-lg disabled:opacity-40"
>
  {estaFacturada ? "Cotización Facturada" : "Marcar como Aprobada"}
</button>
            <button
  onClick={generarFacturaDesdeCotizacion}
  disabled={estadoCotizacion === "facturada"}
  className="bg-blue-600 text-white font-bold py-2 rounded-lg disabled:opacity-40"
>
  {estadoCotizacion === "facturada" ? "Factura ya generada" : "Generar Factura"}
  
</button>
          </div>
        )}

        <button
          onClick={handleGenerarPDF}
          className="mt-6 w-full bg-[#FF6B00] text-black font-bold py-3 rounded-lg"
        >
          Descargar Cotización en PDF
        </button>
      </div>
    </div>
  )
}