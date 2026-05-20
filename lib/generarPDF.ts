import jsPDF from "jspdf"
import autoTable, { RowInput } from "jspdf-autotable"

export interface ItemCotizacion {
  servicio?: string
  item?: string
  descripcion: string
  cantidad: number
  unidad?: string
  valorUnitario: number
  total?: number
}

export interface CotizacionPDF {
  cliente: string
  fecha: string
  items: ItemCotizacion[]
  total: number

  clienteNombre?: string
  clienteEmail?: string
  clienteTelefono?: string
  clienteDireccion?: string
  clienteNIT?: string
  numeroCotizacion?: string

  subtotal?: number
  administracion?: number
  utilidad?: number
  iva?: number
  mostrarDesgloseInterno?: boolean
  aplicarIVA?: boolean
}

export const generarPDFCotizacion = async (cotizacion: CotizacionPDF) => {

  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageWidth = doc.internal.pageSize.width
  const margin = 15

  /* =========================
     FONDO MEMBRETE
  ========================= */

  const fondo = new Image()
  fondo.src = "/membrete.png"

  await new Promise((resolve) => {
    fondo.onload = resolve
  })

  doc.addImage(fondo, "PNG", 0, 0, 210, 297)

  /* =========================
     MARCO EMPRESA
  ========================= */

  const empresaY = 38

  doc.setLineWidth(0.5)
  doc.rect(margin, empresaY, pageWidth - margin * 2, 22)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("G&C INGENIERIA", margin + 2, empresaY + 6)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)

  doc.text(
    "Carrera 22 # 51-32 La Concordia",
    margin + 2,
    empresaY + 11
  )

  doc.text(
    "Bucaramanga, Santander",
    margin + 2,
    empresaY + 15
  )

  doc.text(
    "Tel: 3153411850",
    margin + 2,
    empresaY + 19
  )

  doc.text(
    "NIT 0000000001",
    margin + 90,
    empresaY + 11
  )

  doc.text(
    "Régimen Contributivo",
    margin + 90,
    empresaY + 15
  )

  doc.text(
    "Resolución 98700987998",
    margin + 90,
    empresaY + 19
  )
  /* =========================
     TITULO FACTURA
  ========================= */

  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("COTIZACIÓN", pageWidth / 2, 34, { align: "center" })
  /* =========================
     BLOQUE CLIENTE (MISMA LOGICA ORIGINAL)
  ========================= */

  const startY = 70
/* =========================
   TITULO DATOS CLIENTE
========================= */

doc.setFont("helvetica", "bold")
doc.setFontSize(9)

doc.text(
  "DATOS DEL CLIENTE",
  pageWidth / 2,
  63,
  { align: "center" }
)

doc.setFont("helvetica", "normal")

doc.setLineWidth(0.5)
  doc.rect(margin, startY - 6, pageWidth - margin * 2, 37)

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")

  doc.text(`Empresa: ${cotizacion.cliente}`, margin + 2, startY)
  doc.text(`Contacto: ${cotizacion.clienteNombre || ""}`, margin + 2, startY + 6)
  doc.text(`NIT: ${cotizacion.clienteNIT || ""}`, margin + 2, startY + 12)
  doc.text(`Teléfono: ${cotizacion.clienteTelefono || ""}`, margin + 2, startY + 18)
  doc.text(`Email: ${cotizacion.clienteEmail || ""}`, margin + 2, startY + 24)
  doc.text(`Dirección: ${cotizacion.clienteDireccion || ""}`, margin + 2, startY + 30)

  doc.text(`Fecha: ${cotizacion.fecha}`, 140, startY)
  doc.text(`Cotización N°: ${cotizacion.numeroCotizacion || ""}`, 140, startY + 6)

  /* =========================
     TABLA ORIGINAL (SOLO ESTILO MEJORADO)
  ========================= */

  const body: RowInput[] = cotizacion.items.map((item) => [
    item.servicio || "",
    item.item || "",
    item.descripcion,
    item.cantidad.toString(),
    item.unidad || "Unidad",
    item.valorUnitario.toLocaleString("es-CO", { style: "currency", currency: "COP" }),
    (item.total ?? item.cantidad * item.valorUnitario)
      .toLocaleString("es-CO", { style: "currency", currency: "COP" })
  ])

  autoTable(doc, {

    startY: startY + 40,

    head: [
      ["Servicio", "Item", "Descripción", "Cantidad", "Unidad", "Valor Unit.", "Total"]
    ],

    body,

    styles: {
      fontSize: 8,
      cellPadding: 1.5
    },

    headStyles: {
      fillColor: [30, 30, 30],
      textColor: 255
    },

    columnStyles: {

      2: { cellWidth: 55 },

      5: { halign: "right" },

      6: { halign: "right" }

    },

    margin: { left: margin, right: margin },

    theme: "grid"
  })

  /* =========================
     FINAL TABLA (LOGICA ORIGINAL)
  ========================= */

  type AutoTableDoc = jsPDF & {
    lastAutoTable?: { finalY: number }
  }

  const finalY =
    (doc as AutoTableDoc).lastAutoTable?.finalY
      ? (doc as AutoTableDoc).lastAutoTable!.finalY + 10
      : startY + 80

  doc.setFont("helvetica", "bold")

  let lineaY = finalY

  /* =========================
     VISTA INTERNA
  ========================= */

  if (cotizacion.mostrarDesgloseInterno) {

    if (typeof cotizacion.subtotal === "number") {

      doc.text(
        `Subtotal Directo: ${cotizacion.subtotal.toLocaleString("es-CO", { style: "currency", currency: "COP" })}`,
        140,
        lineaY
      )

      lineaY += 6
    }

    if (typeof cotizacion.administracion === "number") {

      doc.text(
        `Administración: ${cotizacion.administracion.toLocaleString("es-CO", { style: "currency", currency: "COP" })}`,
        140,
        lineaY
      )

      lineaY += 6
    }

    if (typeof cotizacion.utilidad === "number") {

      doc.text(
        `Utilidad: ${cotizacion.utilidad.toLocaleString("es-CO", { style: "currency", currency: "COP" })}`,
        140,
        lineaY
      )

      lineaY += 6
    }

    const subtotalOperativo =
      (cotizacion.subtotal || 0) +
      (cotizacion.administracion || 0) +
      (cotizacion.utilidad || 0)

    doc.text(
      `Subtotal antes IVA: ${subtotalOperativo.toLocaleString("es-CO", { style: "currency", currency: "COP" })}`,
      140,
      lineaY
    )

    lineaY += 6
  }

  /* =========================
     IVA
  ========================= */

  if (cotizacion.aplicarIVA && typeof cotizacion.iva === "number") {

    doc.text(
      `IVA: ${cotizacion.iva.toLocaleString("es-CO", { style: "currency", currency: "COP" })}`,
      140,
      lineaY
    )

    lineaY += 6
  }

  /* =========================
     TOTAL
  ========================= */

  doc.setFontSize(13)

  doc.text(
    `TOTAL: ${cotizacion.total.toLocaleString("es-CO", { style: "currency", currency: "COP" })}`,
    140,
    lineaY + 4
  )

  /* =========================
     FIRMAS
  ========================= */

  const firmaY = lineaY + 20

  // Representante
  doc.line(margin, firmaY, margin + 60, firmaY)
  doc.text("Representante Legal", margin, firmaY + 6)

  const firma = new Image()
  firma.src = "/firma.png"

  await new Promise((resolve) => {
    firma.onload = resolve
  })

  doc.addImage(firma, "PNG", margin + 10, firmaY - 10, 40, 18)

  // Recibe
  doc.line(pageWidth - 80, firmaY, pageWidth - margin, firmaY)
  doc.text("Recibe", pageWidth - 80, firmaY + 6)

  doc.save(`Cotizacion_${cotizacion.numeroCotizacion || cotizacion.cliente}.pdf`)
}