'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { updateOrderStatus } from '@/lib/actions/orders'
import { getOrderById } from '@/lib/actions/orders'
import type { Order, OrderStatus } from '@/types/database'
import { format } from 'date-fns'
import { Clock, ChefHat, CheckCircle, XCircle } from 'lucide-react'

const statusFlow: Record<OrderStatus, OrderStatus | null> = {
  pendiente: 'preparando',
  preparando: 'completado',
  completado: null,
  cancelado: null,
}

const statusIcon: Record<OrderStatus, React.ReactNode> = {
  pendiente: <Clock className="w-4 h-4" />,
  preparando: <ChefHat className="w-4 h-4" />,
  completado: <CheckCircle className="w-4 h-4" />,
  cancelado: <XCircle className="w-4 h-4" />,
}

export default function OrderStatus() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Initial load
    fetchActiveOrders()

    // Realtime subscription
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchActiveOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchActiveOrders() {
    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*, product:products(name)),
        payment:payments(*)
      `)
      .in('status', ['pendiente', 'preparando'])
      .order('created_at', { ascending: true })
      .limit(20)

    if (data) setOrders(data as Order[])
  }

  async function handleStatusChange(id: string, nextStatus: OrderStatus) {
    setLoading(true)
    await updateOrderStatus(id, nextStatus)
    await fetchActiveOrders()
    setLoading(false)
  }

  const statusMap: Record<OrderStatus, string> = {
    pendiente: 'badge-pendiente',
    preparando: 'badge-preparando',
    completado: 'badge-completado',
    cancelado: 'badge-cancelado',
  }

  return (
    <div className="space-y-3">

      {orders.length === 0 ? (
        <div className="text-center py-6 text-gray-600 text-sm">
          No hay pedidos activos
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const next = statusFlow[order.status]
            return (
              <div
                key={order.id}
                id={`order-card-${order.id}`}
                className="bg-gray-900/40 border border-white/5 rounded-[1.8rem] p-4 shadow-lg group hover:border-orange-500/30 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-black text-white text-base tracking-tighter">
                    #{String(order.order_number).padStart(4, '0')}
                  </span>
                  <span className={`text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-[0.2em] flex items-center gap-1.5 border ${statusMap[order.status]}`}>
                    {statusIcon[order.status]}
                    {order.status}
                  </span>
                </div>

                <div className="text-[9px] text-gray-700 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-900" />
                  {format(new Date(order.created_at), 'HH:mm:ss')}
                </div>

                <ul className="text-[11px] text-gray-500 space-y-1 mb-4 border-l border-orange-500/10 pl-3 py-0.5">
                  {order.items?.map((item) => (
                    <li key={item.id} className="flex gap-2">
                      <span className="text-orange-500/60 font-black">{item.quantity}x</span>
                      <span className="truncate">{item.product?.name}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2">
                  {next && (
                    <button
                      onClick={() => handleStatusChange(order.id, next)}
                      disabled={loading}
                      className="flex-1 text-[9px] font-black uppercase tracking-widest bg-orange-600 hover:bg-orange-500 text-white py-2 rounded-xl shadow-lg shadow-orange-600/10 transition-all active:scale-95"
                    >
                      → {next}
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusChange(order.id, 'cancelado')}
                    disabled={loading}
                    className="flex-shrink-0 text-[9px] font-black uppercase tracking-widest text-gray-600 hover:text-red-500 hover:bg-red-500/5 px-3 py-2 rounded-xl transition-all"
                  >
                    Anular
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
