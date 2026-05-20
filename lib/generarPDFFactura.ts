import jsPDF from "jspdf"
import autoTable, { CellInput } from "jspdf-autotable"

interface ItemPlano {
  item: string
  descripcion: string
  cantidad: number
  unidad: string
  valorUnitario: number
  total: number
}

interface GenerarPDFProps {

  numeroFactura: string
  fecha?: string

  clienteEmpresa?: string
  clienteNombre?: string
  clienteNIT?: string
  clienteDireccion?: string
  clienteTelefono?: string
  clienteEmail?: string

  serviciosAgrupados?: Record<string, ItemPlano[]>
  items?: ItemPlano[]

  subtotal: number
  iva: number
  total: number

  vistaCliente?: boolean
  porcentajeAdmin?: number
  porcentajeUtilidad?: number
}

export const generarPDFFactura = async ({
  numeroFactura,
  fecha,

  clienteEmpresa = "",
  clienteNombre = "",
  clienteNIT = "",
  clienteDireccion = "",
  clienteTelefono = "",
  clienteEmail = "",

  items = [],

  subtotal,
  iva,
  total,

  vistaCliente = true,
  porcentajeAdmin = 0,
  porcentajeUtilidad = 0,
}: GenerarPDFProps) => {

  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageWidth = doc.internal.pageSize.width
  const margin = 15

  /* =========================
     MEMBRETE
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

  doc.text("Carrera 22 # 51-32 La Concordia", margin + 2, empresaY + 11)
  doc.text("Bucaramanga, Santander", margin + 2, empresaY + 15)
  doc.text("Tel: 3153411850", margin + 2, empresaY + 19)

  doc.text("NIT 0000000001", margin + 90, empresaY + 11)
  doc.text("Régimen Contributivo", margin + 90, empresaY + 15)
  doc.text("Resolución 98700987998", margin + 90, empresaY + 19)

  /* =========================
     TITULO FACTURA
  ========================= */

  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("FACTURA ELECTRÓNICA", pageWidth / 2, 34, { align: "center" })

  /* =========================
     BLOQUE CLIENTE
  ========================= */

  const startY = 70

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("DATOS DEL CLIENTE", pageWidth / 2, 66, { align: "center" })

  doc.setLineWidth(0.5)
  doc.rect(margin, startY, pageWidth - margin * 2, 37)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  doc.text(`Empresa: ${clienteEmpresa || ""}`, margin + 2, startY + 6)
  doc.text(`Contacto: ${clienteNombre || ""}`, margin + 2, startY + 12)
  doc.text(`NIT: ${clienteNIT || ""}`, margin + 2, startY + 18)
  doc.text(`Teléfono: ${clienteTelefono || ""}`, margin + 2, startY + 24)
  doc.text(`Email: ${clienteEmail || ""}`, margin + 2, startY + 30)
  doc.text(`Dirección: ${clienteDireccion || ""}`, margin + 2, startY + 36)

  doc.text(`Fecha: ${fecha ?? ""}`, 140, startY + 6)
  doc.text(`Factura N°: ${numeroFactura}`, 140, startY + 12)

  /* =========================
     TABLA
  ========================= */

  const body: CellInput[][] = []

  items.forEach((i) => {
    body.push([
      i.item,
      i.descripcion,
      i.cantidad.toString(),
      i.unidad,
      i.valorUnitario.toLocaleString("es-CO", { style: "currency", currency: "COP" }),
      i.total.toLocaleString("es-CO", { style: "currency", currency: "COP" })
    ])
  })

  autoTable(doc, {
    startY: startY + 45,

    head: [["Item", "Descripción", "Cantidad", "Unidad", "Valor Unit.", "Total"]],

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
      1: { cellWidth: 80 },
      4: { halign: "right" },
      5: { halign: "right" }
    },

    margin: { left: margin, right: margin },
    theme: "grid"
  })

  const finalY =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } })
      .lastAutoTable?.finalY ?? startY + 80

  let lineaY = finalY + 12

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)

  /* =========================
     BLOQUE DE TOTALES
  ========================= */

  if (!vistaCliente) {

    doc.text(
      `Subtotal: ${subtotal.toLocaleString("es-CO", { style: "currency", currency: "COP" })}`,
      140,
      lineaY
    )

    lineaY += 6

    if (iva > 0) {
      doc.text(
        `IVA: ${iva.toLocaleString("es-CO", { style: "currency", currency: "COP" })}`,
        140,
        lineaY
      )
      lineaY += 6
    }

  } else {

    if (iva > 0) {

      doc.text(
        `Subtotal: ${subtotal.toLocaleString("es-CO", { style: "currency", currency: "COP" })}`,
        140,
        lineaY
      )

      lineaY += 6

      doc.text(
        `IVA: ${iva.toLocaleString("es-CO", { style: "currency", currency: "COP" })}`,
        140,
        lineaY
      )

      lineaY += 6
    }

  }

  doc.setFontSize(13)

  doc.text(
    `TOTAL: ${total.toLocaleString("es-CO", { style: "currency", currency: "COP" })}`,
    140,
    lineaY + 4
  )

  /* =========================
     VISTA INTERNA
  ========================= */

  let firmaBase = lineaY + 25

  if (!vistaCliente) {

    const costoDirecto = subtotal
    const valorAdmin = costoDirecto * (porcentajeAdmin / 100)
    const valorUtilidad = costoDirecto * (porcentajeUtilidad / 100)

    const margen = total > 0
      ? ((valorUtilidad / total) * 100).toFixed(1)
      : "0"

    const resumenY = lineaY + 25

    doc.setFontSize(10)

    doc.text("RESUMEN FINANCIERO", margin, resumenY)

    doc.setFont("helvetica", "normal")

    doc.text(
      `Costo directo: ${costoDirecto.toLocaleString("es-CO", { style: "currency", currency: "COP" })}`,
      margin,
      resumenY + 6
    )

    doc.text(
      `Administración (${porcentajeAdmin}%): ${valorAdmin.toLocaleString("es-CO", { style: "currency", currency: "COP" })}`,
      margin,
      resumenY + 12
    )

    doc.text(
      `Utilidad (${porcentajeUtilidad}%): ${valorUtilidad.toLocaleString("es-CO", { style: "currency", currency: "COP" })}`,
      margin,
      resumenY + 18
    )

    doc.text(
      `Margen proyectado: ${margen}%`,
      margin,
      resumenY + 24
    )

    firmaBase = resumenY + 35
  }

  /* =========================
     FIRMAS
  ========================= */

  const firmaY = firmaBase + 10

  doc.line(margin, firmaY, margin + 60, firmaY)
  doc.text("Representante Legal", margin, firmaY + 6)

  const firma = new Image()
  firma.src = "/firma.png"

  await new Promise((resolve) => {
    firma.onload = resolve
  })

  doc.addImage(firma, "PNG", margin + 10, firmaY - 10, 40, 18)

  doc.line(pageWidth - 80, firmaY, pageWidth - margin, firmaY)
  doc.text("Recibe", pageWidth - 80, firmaY + 6)

  doc.save(`Factura_${numeroFactura}.pdf`)
}