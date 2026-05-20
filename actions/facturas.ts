"use server"

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Genera número consecutivo tipo F-0001
 */
export async function generarNumeroFactura() {

  const { data, error } = await supabase
    .from("facturas")
    .select("numero_factura")
    .order("created_at", { ascending: false })
    .limit(1)

  if (error) throw new Error(error.message)

  let siguienteNumero = 1

  if (data && data.length > 0 && data[0].numero_factura) {

    const ultimo = data[0].numero_factura.replace("F-", "")

    siguienteNumero = parseInt(ultimo) + 1

  }

  return `F-${String(siguienteNumero).padStart(4, "0")}`

}

/**
 * Crear factura desde cotización aprobada
 */
export async function crearFacturaDesdeCotizacion(
  cotizacionId: string
) {

  const { data: cotizacion, error: cotError } = await supabase
    .from("cotizaciones")
    .select(`
      *,
      clientes (*),
      cotizacion_items (*)
    `)
    .eq("id", cotizacionId)
    .single()

  if (cotError || !cotizacion) {
    console.error(cotError)
    throw new Error("No se encontró la cotización")
  }

  // 🔒 evitar facturar dos veces la misma cotización
if (cotizacion.estado === "facturada") {
  throw new Error("Esta cotización ya fue facturada")
}

const numeroFactura = await generarNumeroFactura()

  const subtotal = cotizacion.subtotal_antes_iva ?? 0
  const iva = cotizacion.iva ?? 0
  const total = cotizacion.total ?? 0

  const { data: factura, error: facturaError } = await supabase
    .from("facturas")
    .insert({
      cotizacion_id: cotizacion.id,
      cliente_id: cotizacion.cliente_id,
      numero_factura: numeroFactura,
      subtotal,
      iva,
      total,
      estado: "emitida"
    })
    .select()
    .single()

  if (facturaError) {
    throw new Error(facturaError.message)
  }

  // 🔹 copiar items a factura_items
 const itemsFactura = cotizacion.cotizacion_items.map((item: {
  servicio_id: string
  cantidad: number
  valor_unitario: number
  total: number
}) => ({
  factura_id: factura.id,
  servicio_id: item.servicio_id,
  cantidad: item.cantidad,
  valor_unitario: item.valor_unitario,
  total: item.total
}))

  await supabase.from("factura_items").insert(itemsFactura)

  await supabase
    .from("cotizaciones")
    .update({ estado: "facturada" })
    .eq("id", cotizacion.id)

  return {
    factura,
    cotizacion,
    cliente: cotizacion.clientes
  }
}