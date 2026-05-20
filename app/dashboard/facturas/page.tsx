"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { generarPDFFactura } from "@/lib/generarPDFFactura"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Cliente = {
  empresa: string | null
  nombre: string | null
  nit: string | null
  direccion: string | null
  telefono: string | null
  email: string | null
}

type Servicio = {
  id: string
  item: string
  descripcion: string | null
  unidad: string | null
  valor_mano_obra: number
  grupo: string
  activo: boolean | null
}

type FacturaItemDB = {
  cantidad: number | null
  valor_unitario: number | null
  total: number | null
  servicios: Servicio | null
}

type Factura = {
  id: string
  numero_factura: string | null
  created_at: string
  subtotal: number | null
  iva: number | null
  total: number | null
  clientes: Cliente | null
  factura_items: FacturaItemDB[]
}

export default function FacturasPage() {

  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [vistaInternaId, setVistaInternaId] = useState<string | null>(null)

  useEffect(() => {

    const cargarFacturas = async () => {

      const { data, error } = await supabase
        .from("facturas")
        .select(`
          id,
          numero_factura,
          created_at,
          subtotal,
          iva,
          total,
          clientes (
            empresa,
            nombre,
            nit,
            direccion,
            telefono,
            email
          ),
          factura_items (
            cantidad,
            valor_unitario,
            total,
            servicios (
              id,
              item,
              descripcion,
              unidad,
              valor_mano_obra,
              grupo,
              activo
            )
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      setFacturas(data as unknown as Factura[])
      setLoading(false)

    }

    cargarFacturas()

  }, [])

  const handleGenerarPDF = async (factura: Factura) => {

    const cliente = factura.clientes
    const esVistaInterna = vistaInternaId === factura.id

    const items: {
      item: string
      descripcion: string
      cantidad: number
      unidad: string
      valorUnitario: number
      total: number
    }[] = []

    factura.factura_items.forEach((item, index) => {

      const cantidad = item.cantidad ?? 0
      const valorBase = item.valor_unitario ?? 0

      let valorUnitario = valorBase

      // ✅ VISTA CLIENTE → aplicar ADMIN + UTILIDAD correctamente
      if (!esVistaInterna) {

        const costoConAdmin = valorBase * 1.10
        const precioFinal = costoConAdmin * 1.15

        valorUnitario = precioFinal
      }

      const total = valorUnitario * cantidad

      items.push({
        item: item.servicios?.item ?? `Item ${index + 1}`,
        descripcion: item.servicios?.descripcion ?? "",
        cantidad,
        unidad: item.servicios?.unidad ?? "Unidad",
        valorUnitario,
        total
      })

    })

let subtotalFinal = 0

// ✅ VISTA INTERNA → subtotal = suma real de servicios base
if (esVistaInterna) {

  subtotalFinal = factura.factura_items.reduce((acc, item) => {
    const cantidad = item.cantidad ?? 0
    const valor = item.valor_unitario ?? 0
    return acc + (cantidad * valor)
  }, 0)

}

// ✅ VISTA CLIENTE → subtotal = suma servicios con admin y utilidad
else {

  subtotalFinal = items.reduce((acc, i) => acc + i.total, 0)

}

    await generarPDFFactura({

      numeroFactura: factura.numero_factura ?? "",

      clienteEmpresa: cliente?.empresa ?? "",
      clienteNombre: cliente?.nombre ?? "",
      clienteNIT: cliente?.nit ?? "",
      clienteDireccion: cliente?.direccion ?? "",
      clienteTelefono: cliente?.telefono ?? "",
      clienteEmail: cliente?.email ?? "",

      items,

      subtotal: subtotalFinal,
      iva: factura.iva ?? 0,
      total: factura.total ?? 0,

      vistaCliente: !esVistaInterna,

      porcentajeAdmin: 10,
      porcentajeUtilidad: 15

    })

  }

  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Historial de Facturas
      </h1>

      {loading && <p>Cargando facturas...</p>}

      {!loading && facturas.length === 0 && (
        <p className="text-gray-500">
          No hay facturas registradas.
        </p>
      )}

      <div className="space-y-4">

        {facturas.map((factura) => {

          const cliente = factura.clientes

          return (

            <div
              key={factura.id}
              className="bg-white shadow rounded-lg p-6 border"
            >

              <h2 className="text-lg font-semibold text-gray-900">
                Factura #{factura.numero_factura}
              </h2>

              <p className="text-gray-700 mt-2">
                <strong>Cliente:</strong>{" "}
                {cliente?.empresa ?? "Sin cliente"}
              </p>

              <p className="text-gray-700">
                <strong>Total:</strong>{" "}
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  minimumFractionDigits: 0,
                }).format(factura.total ?? 0)}
              </p>

              <button
                onClick={() =>
                  setVistaInternaId(
                    vistaInternaId === factura.id
                      ? null
                      : factura.id
                  )
                }
                className="mt-3 mr-3 bg-gray-200 px-3 py-1 rounded text-sm"
              >
                {vistaInternaId === factura.id
                  ? "Vista Cliente"
                  : "Vista Interna"}
              </button>

              <button
                onClick={() => handleGenerarPDF(factura)}
                className="mt-3 bg-black text-white px-4 py-2 rounded hover:opacity-80 transition"
              >
                Descargar PDF
              </button>

            </div>

          )

        })}

      </div>

    </div>

  )

}