'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { updateOrderStatus } from '@/lib/actions/orders'
import type { Order, OrderStatus } from '@/types/database'
import { 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  Timer, 
  MessageSquare, 
  RefreshCcw,
  Flame,
  ChevronRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function KitchenPage() {
  const [mounted, setMounted] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    fetchActiveOrders()

    const supabase = createClient()
    const channel = supabase
      .channel('kitchen-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          // Play a notification sound if it's a new order
          if (payload.eventType === 'INSERT') {
            try {
              const audio = new Audio('/sounds/notification.mp3')
              audio.play().catch(() => {}) // Ignore if browser blocks audio
            } catch (e) {}
          }
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

    if (data) setOrders(data as Order[])
    setLoading(false)
  }

  async function handleStatusChange(id: string, currentStatus: OrderStatus) {
    const nextStatus: OrderStatus = currentStatus === 'pendiente' ? 'preparando' : 'completado'
    await updateOrderStatus(id, nextStatus)
    fetchActiveOrders()
  }

  return (
    <div className="flex flex-col h-full gap-8 animate-v10-in pb-20 lg:pb-0">
      {/* KDS Strategic Header v11.6 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between glass-modern p-10 rounded-[3.5rem] border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/[0.03] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-[0_20px_50px_rgba(249,115,22,0.3)] group">
            <ChefHat className="w-12 h-12 group-hover:rotate-12 transition-transform duration-700" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
               <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.5em] opacity-80">Kitchen Radar v11.6</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
              RADAR DE <span className="text-orange-500">COCINA</span>
            </h1>
            <p className="text-gray-500 text-[11px] font-black tracking-[0.3em] uppercase flex items-center gap-3 mt-4">
               {orders.length} MÓDULOS EN PROCESO DE PRODUCCIÓN
            </p>
          </div>
        </div>
        
        <button 
          onClick={fetchActiveOrders}
          className="btn-v10-glass w-20 h-20 rounded-[2.5rem] mt-6 md:mt-0 active:scale-90 transition-all border border-white/5"
        >
          <RefreshCcw className={`w-8 h-8 ${loading ? 'animate-spin text-orange-500' : 'text-gray-400'}`} />
        </button>
      </div>

      {/* High-Performance KDS Grid - Enhanced 720px Breakpoints */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 overflow-y-auto pr-2 px-2 custom-scrollbar lg:custom-scrollbar">
        {loading && !orders.length ? (
          <div className="col-span-full py-40 flex flex-col items-center justify-center gap-8 glass-modern rounded-[4rem] border-white/5">
            <div className="w-20 h-20 border-4 border-orange-500/10 border-t-orange-500 rounded-full animate-spin shadow-2xl" />
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-500">Sincronizando Frecuencia Operativa...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="col-span-full py-40 glass-modern rounded-[4rem] border-dashed border-white/10 flex flex-col items-center justify-center animate-pulse">
             <div className="w-28 h-28 rounded-full bg-orange-500/5 flex items-center justify-center mb-8 border border-orange-500/10 shadow-inner">
                <Flame className="w-14 h-14 text-gray-800 opacity-20" />
             </div>
             <h2 className="text-3xl font-black text-white/40 uppercase tracking-tighter italic">Bahía Despejada</h2>
             <p className="text-gray-700 text-[10px] font-black uppercase tracking-[0.5em] mt-6">Esperando Inyección de Comandas</p>
          </div>
        ) : (
          orders.map((order) => (
            <div 
              key={order.id}
              className={`flex flex-col h-[620px] glass-modern rounded-[3.5rem] border transition-all duration-700 overflow-hidden shadow-3xl relative group ${
                order.status.toLowerCase() === 'preparando' 
                  ? 'border-orange-500/50 bg-orange-500/[0.02]' 
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              {/* Card Aura - Enhanced Design */}
              <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[100px] pointer-events-none opacity-20 transition-all duration-1000 group-hover:opacity-40 ${
                order.status.toLowerCase() === 'preparando' ? 'bg-orange-600' : 'bg-blue-600'
              }`} />

              <div className={`p-8 border-b border-white/[0.05] relative z-10 ${
                order.status.toLowerCase() === 'preparando' ? 'bg-orange-500/[0.05]' : 'bg-white/[0.02]'
              }`}>
                <div className="flex justify-between items-start mb-4">
                   <div className="w-14 h-14 rounded-[1.2rem] bg-black/40 border border-white/10 flex items-center justify-center text-white font-black text-xl tabular-nums italic shadow-2xl">
                      {String(order.order_number).slice(-2)}
                   </div>
                   <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 border ${
                     order.status.toLowerCase() === 'preparando' 
                      ? 'bg-orange-500 border-orange-400 text-white shadow-xl shadow-orange-500/30' 
                      : 'bg-white/[0.05] text-gray-400 border-white/10'
                   }`}>
                     {order.status.toLowerCase() === 'preparando' ? <Flame className="w-3 h-3 animate-pulse text-white" /> : <Clock className="w-3 h-3" />}
                     {order.status.toLowerCase() === 'preparando' ? 'PREPARANDO' : 'PENDIENTE'}
                   </div>
                </div>
                <h3 className="text-3xl font-black text-white italic tracking-tighter mb-1 uppercase leading-none">Ticket #{String(order.order_number).padStart(4, '0')}</h3>
                <div className="flex items-center gap-4">
                  <p className="text-[9px] font-black text-gray-500 flex items-center gap-2 uppercase tracking-widest">
                    <Timer className="w-3 h-3 text-orange-500 opacity-50" />
                    {mounted ? formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: es }) : 'Calculando...'}
                  </p>
                </div>
              </div>

              {/* Items List - Fixed Height & Internal Scroll */}
              <div className="flex-1 p-8 space-y-6 relative z-10 overflow-y-auto custom-scrollbar-mini">
                <style jsx>{`
                  .custom-scrollbar-mini::-webkit-scrollbar { width: 4px; }
                  .custom-scrollbar-mini::-webkit-scrollbar-track { background: transparent; }
                  .custom-scrollbar-mini::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.1); border-radius: 10px; }
                  .custom-scrollbar-mini:hover::-webkit-scrollbar-thumb { background: rgba(249, 115, 22, 0.3); }
                `}</style>
                {order.items?.map((item, idx) => (
                  <div key={item.id} className="flex items-start gap-4 group/item">
                     <div className="relative pt-0.5">
                        <span className="text-3xl font-black text-white tabular-nums opacity-20 min-w-[50px] block transition-all group-hover/item:opacity-100 group-hover/item:text-orange-500 leading-none">
                          {item.quantity}×
                        </span>
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-xl font-black text-white tracking-tight uppercase group-hover/item:text-orange-500 transition-all leading-tight">
                          {item.product?.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                           <div className="h-0.5 w-6 bg-orange-500/20 rounded-full" />
                           <span className="text-[8px] font-black text-gray-800 uppercase tracking-[0.2em]">SKU-{item.id.slice(0,4)}</span>
                        </div>
                     </div>
                  </div>
                ))}

                {order.notes && (
                  <div className="mt-8 p-6 rounded-[2rem] bg-black/60 border border-white/5 flex gap-4 text-[12px] font-bold italic text-orange-500/60 leading-relaxed shadow-3xl">
                     <MessageSquare className="w-5 h-5 flex-shrink-0 text-orange-500 opacity-40" />
                     <p>"{order.notes}"</p>
                  </div>
                )}
              </div>

              {/* Action Master - Fixed at Bottom */}
              <button
                onClick={() => handleStatusChange(order.id, order.status)}
                className={`w-full p-8 text-[10px] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-4 transition-all active:scale-[0.98] group/btn overflow-hidden relative ${
                  order.status.toLowerCase() === 'pendiente'
                    ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_-15px_50px_rgba(154,52,18,0.2)]'
                    : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_-15px_50px_rgba(20,83,45,0.2)]'
                }`}
              >
                {/* Button Light Shimmer */}
                <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                
                {order.status.toLowerCase() === 'pendiente' ? (
                  <>COMENZAR PREPARACIÓN <ChevronRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" /></>
                ) : (
                  <>FINALIZAR DESPACHO <CheckCircle2 className="w-6 h-6 group-hover/btn:scale-110 transition-transform" /></>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
