import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { generateTicketPDF, TicketRole } from '@/lib/pdf/generateTicket'
import type { Order } from '@/types/database'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')
  const role = (searchParams.get('role') as TicketRole) || 'customer'

  if (!orderId) {
    return NextResponse.json({ error: 'orderId required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*, product:products(name, price)),
      payment:payments(*),
      profile:profiles(full_name)
    `)
    .eq('id', orderId)
    .single()

  if (error || !data) {
    console.error('Database query error:', error)
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Data Normalization: Supabase sometimes returns related data as arrays
  const order = {
    ...data,
    payment: Array.isArray(data.payment) ? data.payment[0] : data.payment,
    profile: Array.isArray(data.profile) ? data.profile[0] : data.profile,
  }

  try {
    let pdfBytes: Uint8Array

    if (role === 'all' as any) {
      const { generateAllTicketsPDF } = await import('@/lib/pdf/generateTicket')
      pdfBytes = await generateAllTicketsPDF(order as Order)
    } else {
      pdfBytes = await generateTicketPDF(order as Order, role as TicketRole)
    }

    const body = Buffer.from(pdfBytes)

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="tickets-triple-${String(order.order_number).padStart(4, '0')}.pdf"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}
