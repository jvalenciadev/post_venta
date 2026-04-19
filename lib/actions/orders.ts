'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type { CartItem, Order, OrderStatus } from '@/types/database'

export async function createOrder(
  items: CartItem[],
  paymentMethod: 'cash' | 'card' | 'transfer',
  amountPaid: number,
  notes?: string,
  directMode?: boolean
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      total,
      notes: notes || null,
      created_by: user.id,
      status: directMode ? 'completado' : 'pendiente',
    })
    .select()
    .single()

  if (orderError) return { error: orderError.message }

  // Create order items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.product.price,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) return { error: itemsError.message }

  // Create payment
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      order_id: order.id,
      amount: total,
      method: paymentMethod,
      change_given: Math.max(0, amountPaid - total),
    })

  if (paymentError) return { error: paymentError.message }

  revalidatePath('/pos')
  revalidatePath('/cocina')
  revalidatePath('/dashboard')
  return { success: true, orderId: order.id, orderNumber: order.order_number }
}

export async function getOrders(limit = 50) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*, product:products(*)),
      profile:profiles(full_name, email),
      payment:payments(*)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Order[]
}

export async function getOrderById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*, product:products(*)),
      profile:profiles(full_name, email),
      payment:payments(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Order
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/pos')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getTodayOrders() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*, product:products(*)),
      payment:payments(*)
    `)
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Order[]
}

export async function getActiveOrders() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*, product:products(*)),
      payment:payments(*)
    `)
    .in('status', ['pendiente', 'preparando'])
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Order[]
}
