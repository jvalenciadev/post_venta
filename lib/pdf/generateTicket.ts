import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { Order } from '@/types/database'

export type TicketRole = 'customer' | 'kitchen' | 'admin'

// Helper to sanitize text and prevent PDF crashes with emojis
const sanitizeText = (text: string) => {
  return String(text).replace(/[^\x00-\x7F\xA0-\xFF]/g, '')
}

/**
 * Adds a single ticket page to a PDF document with dynamic height
 */
async function addTicketPage(pdfDoc: PDFDocument, order: Order, role: TicketRole) {
  // Terminal width: 80mm ≈ 226 points
  const pageWidth = 226
  const fontSize = role === 'kitchen' ? 10 : 8
  const headerSize = role === 'kitchen' ? 12 : 10
  const titleSize = 14

  // --- DYNAMIC HEIGHT CALCULATION ---
  const itemCount = order.items?.length ?? 0
  const notesHeight = order.notes ? 30 : 0
  const paymentHeight = (role !== 'kitchen' && order.payment) ? 40 : 0
  const footerHeight = role !== 'kitchen' ? 60 : 30
  
  const pageHeight = 160 + (itemCount * 18) + notesHeight + paymentHeight + footerHeight
  // ----------------------------------

  const page = pdfDoc.addPage([pageWidth, pageHeight])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let y = pageHeight - 30

  const drawText = (
    text: string,
    x: number,
    yPos: number,
    size: number = fontSize,
    isBold = false
  ) => {
    const cleanText = sanitizeText(text)
    if (!cleanText.trim() && String(text).trim()) return

    let finalX = x
    if (x < 0) {
      const textWidth = (isBold ? boldFont : font).widthOfTextAtSize(cleanText, size)
      finalX = (pageWidth - textWidth) / 2
    }

    page.drawText(cleanText, {
      x: finalX,
      y: yPos,
      size,
      font: isBold ? boldFont : font,
      color: rgb(0, 0, 0),
    })
  }

  const drawLine = (yPos: number, thickness = 0.5) => {
    page.drawLine({
      start: { x: 5, y: yPos },
      end: { x: pageWidth - 5, y: yPos },
      thickness,
      color: rgb(0, 0, 0),
    })
  }

  // ===== HEADER =====
  if (role === 'kitchen') {
    drawText('*** COMANDA COCINA ***', -1, y, titleSize, true)
  } else if (role === 'admin') {
    drawText('CONTROL ADO (COPIA)', -1, y, titleSize, true)
  } else {
    drawText('RESTAURANTE POS', -1, y, titleSize, true)
  }
  y -= 18

  if (role !== 'kitchen') {
    drawText('TICKET DE VENTA', -1, y, 7, true)
    y -= 12
  }

  const date = new Date(order.created_at).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  })

  drawText(`Fecha: ${date}`, 10, y, 7)
  y -= 12

  drawText(`Folio: #${order.order_number}`, 10, y, headerSize + 2, true)
  y -= 18

  drawLine(y, 1)
  y -= 12

  // ===== ITEMS HEADER =====
  if (role === 'kitchen') {
    drawText('PC', 10, y, fontSize, true)
    drawText('Descripción del Producto', 40, y, fontSize, true)
  } else {
    drawText('Cant', 10, y, 7, true)
    drawText('Producto', 35, y, 7, true)
    drawText('Total', 185, y, 7, true)
  }
  y -= 10

  drawLine(y)
  y -= 12

  // ===== ITEMS LIST =====
  for (const item of order.items ?? []) {
    const sub = item.subtotal || 0
    
    if (role === 'kitchen') {
      drawText(`${item.quantity || 1}`, 10, y, fontSize + 2, true)
      drawText(item.product?.name ?? 'Producto', 40, y, fontSize + 2, true)
      y -= 16
    } else {
      const name = (item.product?.name ?? 'Producto').slice(0, 22)
      drawText(`${item.quantity || 1}x`, 10, y, fontSize)
      drawText(name, 35, y, fontSize)
      drawText(`$${sub.toFixed(2)}`, 182, y, fontSize, true)
      y -= 14
    }
  }

  // Notes
  if (order.notes) {
    y -= 8
    drawText('NOTAS:', 10, y, 8, true)
    y -= 12
    drawText(order.notes, 10, y, role === 'kitchen' ? fontSize : 8)
    y -= 14
  }

  drawLine(y, 1)
  y -= 15

  // ===== TOTALS =====
  if (role !== 'kitchen') {
    const totalVal = order.total || 0
    drawText('TOTAL A PAGAR:', 10, y, headerSize, true)
    drawText(`$${totalVal.toFixed(2)}`, 170, y, headerSize + 2, true)
    y -= 20

    if (order.payment) {
      const methodLabel: Record<string, string> = {
        cash: 'EFECTIVO',
        card: 'TARJETA',
        transfer: 'TRANSF',
      }
      const changeGiven = order.payment.change_given || 0
      drawText(`PAGO: ${methodLabel[order.payment.method] ?? order.payment.method}`, 10, y, 7)
      y -= 12
      if (changeGiven > 0) {
        drawText(`CAMBIO: $${changeGiven.toFixed(2)}`, 10, y, 7, true)
        y -= 12
      }
    }

    drawLine(y)
    y -= 15

    // ===== FOOTER =====
    drawText('¡GRACIAS POR SU COMPRA!', -1, y, 8, true)
    y -= 12
    drawText('www.restaurante.com', -1, y, 6)
  } else {
    drawText('*** COMANDA FINALIZADA ***', -1, y, 8, true)
  }
}

/**
 * Generates a single-role ticket PDF
 */
export async function generateTicketPDF(order: Order, role: TicketRole = 'customer'): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  await addTicketPage(pdfDoc, order, role)
  return await pdfDoc.save()
}

/**
 * Generates a triple ticket PDF (Kitchen, Customer, Admin) as separate pages
 */
export async function generateAllTicketsPDF(order: Order): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  
  // Order: Kitchen -> Customer -> Admin
  await addTicketPage(pdfDoc, order, 'kitchen')
  await addTicketPage(pdfDoc, order, 'customer')
  await addTicketPage(pdfDoc, order, 'admin')
  
  return await pdfDoc.save()
}
