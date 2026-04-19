'use server'

import { createClient } from '@/utils/supabase/server'

export async function getDailySalesReport(startDate: string, endDate: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('created_at, total, status')
    .eq('status', 'completado')
    .gte('created_at', `${startDate}T00:00:00`)
    .lte('created_at', `${endDate}T23:59:59`)
    .order('created_at')

  if (error) throw error

  // Group by day
  const grouped: Record<string, { total_revenue: number; total_orders: number }> = {}
  for (const order of data) {
    const date = order.created_at.slice(0, 10)
    if (!grouped[date]) {
      grouped[date] = { total_revenue: 0, total_orders: 0 }
    }
    grouped[date].total_revenue += order.total
    grouped[date].total_orders += 1
  }

  return Object.entries(grouped).map(([date, stats]) => ({
    date,
    total_orders: stats.total_orders,
    total_revenue: stats.total_revenue,
    avg_order_value: stats.total_revenue / stats.total_orders,
  }))
}

export async function getProductSalesReport(startDate: string, endDate: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('order_items')
    .select(`
      quantity,
      subtotal,
      product:products(id, name),
      order:orders!inner(created_at, status)
    `)
    .eq('order.status', 'completado')
    .gte('order.created_at', `${startDate}T00:00:00`)
    .lte('order.created_at', `${endDate}T23:59:59`)

  if (error) throw error

  // Group by product
  const grouped: Record<string, { name: string; total_quantity: number; total_revenue: number }> = {}
  for (const item of data as any[]) {
    const pid = item.product?.id
    if (!pid) continue
    if (!grouped[pid]) {
      grouped[pid] = { name: item.product.name, total_quantity: 0, total_revenue: 0 }
    }
    grouped[pid].total_quantity += item.quantity
    grouped[pid].total_revenue += item.subtotal
  }

  return Object.entries(grouped)
    .map(([product_id, stats]) => ({
      product_id,
      product_name: stats.name,
      total_quantity: stats.total_quantity,
      total_revenue: stats.total_revenue,
    }))
    .sort((a, b) => b.total_revenue - a.total_revenue)
}

export async function getSummaryStats() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [todayOrders, activeOrders, totalRevenue] = await Promise.all([
    supabase
      .from('orders')
      .select('total', { count: 'exact' })
      .gte('created_at', today.toISOString()),
    supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .in('status', ['pendiente', 'preparando']),
    supabase
      .from('orders')
      .select('total')
      .eq('status', 'completado')
      .gte('created_at', today.toISOString()),
  ])

  const todayRevenue = (totalRevenue.data || []).reduce(
    (sum: number, o: { total: number }) => sum + o.total,
    0
  )

  return {
    todayOrderCount: todayOrders.count ?? 0,
    activeOrderCount: activeOrders.count ?? 0,
    todayRevenue,
  }
}

export async function getSalesByCategory(startDate: string, endDate: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('order_items')
    .select(`
      subtotal,
      product:products!inner(
        category:categories(id, name, color)
      ),
      order:orders!inner(created_at, status)
    `)
    .eq('order.status', 'completado')
    .gte('order.created_at', `${startDate}T00:00:00`)
    .lte('order.created_at', `${endDate}T23:59:59`)

  if (error) throw error

  const grouped: Record<string, { name: string; color: string; value: number }> = {}
  for (const item of data as any[]) {
    const cat = item.product?.category
    if (!cat) continue
    if (!grouped[cat.id]) {
      grouped[cat.id] = { name: cat.name, color: cat.color, value: 0 }
    }
    grouped[cat.id].value += item.subtotal
  }

  return Object.values(grouped).sort((a, b) => b.value - a.value)
}

export async function getSalesByPaymentMethod(startDate: string, endDate: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payments')
    .select(`
      amount,
      method,
      order:orders!inner(created_at, status)
    `)
    .eq('order.status', 'completado')
    .gte('order.created_at', `${startDate}T00:00:00`)
    .lte('order.created_at', `${endDate}T23:59:59`)

  if (error) throw error

  const grouped: Record<string, number> = { cash: 0, card: 0, transfer: 0 }
  for (const p of data as any[]) {
    grouped[p.method] = (grouped[p.method] || 0) + p.amount
  }

  return Object.entries(grouped).map(([name, value]) => ({ 
    name: name === 'cash' ? 'EFECTIVO' : name === 'card' ? 'TARJETA' : 'TRANSFERENCIA', 
    value 
  }))
}

export async function getSalesByOperator(startDate: string, endDate: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      total,
      profile:profiles(full_name)
    `)
    .eq('status', 'completado')
    .gte('created_at', `${startDate}T00:00:00`)
    .lte('created_at', `${endDate}T23:59:59`)

  if (error) throw error

  const grouped: Record<string, number> = {}
  for (const o of data as any[]) {
    const name = o.profile?.full_name || 'Sistema'
    grouped[name] = (grouped[name] || 0) + o.total
  }

  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}
