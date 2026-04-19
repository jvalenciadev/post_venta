'use client'

import { useState, useMemo } from 'react'
import { useCartStore } from '@/lib/store/cartStore'
import { useUIStore } from '@/lib/store/uiStore'
import { createOrder } from '@/lib/actions/orders'
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  Zap,
  Monitor,
  UtensilsCrossed,
  ShoppingBag,
  Car
} from 'lucide-react'

export default function Cart({ onOrderCreated }: { onOrderCreated: (id: string, num: number) => void }) {
  const { items, removeItem, updateQuantity, clearCart, total } = useCartStore()
  const { modoDirecto, toggleModoDirecto } = useUIStore()
  const [serviceType, setServiceType] = useState<'local' | 'llevar' | 'auto'>('local')
  const [amountPaid, setAmountPaid] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subtotal = total()



  async function printTicketCopies(orderId: string) {
    // Print copy 1 - customer ticket
    const res1 = await fetch(`/api/ticket?orderId=${orderId}&role=customer`)
    if (res1.ok) {
      const blob1 = await res1.blob()
      const url1 = URL.createObjectURL(blob1)
      const win1 = window.open(url1, '_blank')
      if (win1) win1.onload = () => { win1.print(); setTimeout(() => URL.revokeObjectURL(url1), 2000) }
    }
    // Print copy 2 - kitchen/admin copy
    const res2 = await fetch(`/api/ticket?orderId=${orderId}&role=kitchen`)
    if (res2.ok) {
      const blob2 = await res2.blob()
      const url2 = URL.createObjectURL(blob2)
      setTimeout(() => {
        const win2 = window.open(url2, '_blank')
        if (win2) win2.onload = () => { win2.print(); setTimeout(() => URL.revokeObjectURL(url2), 2000) }
      }, 800) // slight delay so they don't open simultaneously
    }
  }

  async function handleCheckout() {
    if (items.length === 0) return
    setError(null)
    setLoading(true)

    const result = await createOrder(
      items,
      'cash',
      subtotal,
      notes ? `[${serviceType.toUpperCase()}] ${notes}` : `[${serviceType.toUpperCase()}]`,
      modoDirecto
    )

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else if (result.orderId && result.orderNumber) {
      clearCart()
      setNotes('')
      if (modoDirecto) {
        // Auto-print 2 copies and skip modal
        await printTicketCopies(result.orderId)
      } else {
        onOrderCreated(result.orderId, result.orderNumber)
      }
    }
  }



  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Real-time Order Intelligence Header - Persistente */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.03] bg-[#050505]/40 backdrop-blur-3xl z-30">
        <div>
          <h2 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">Orden <span className="text-orange-500">Actual</span></h2>
          <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.4em] mt-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Centro de Registro
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Modo Directo Toggle */}
          <button
            onClick={toggleModoDirecto}
            title={modoDirecto ? 'Desactivar Modo Directo' : 'Activar Modo Directo (sin cola cocina)'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[7px] font-black uppercase tracking-widest border transition-all ${
              modoDirecto
                ? 'bg-green-500/15 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                : 'bg-white/[0.02] border-white/5 text-gray-700 hover:text-gray-400'
            }`}
          >
            <Zap className={`w-3 h-3 ${modoDirecto ? 'text-green-400' : ''}`} />
            {modoDirecto ? 'DIRECTO' : 'DIRECTO'}
          </button>
          {/* Vista Clientes Link - hidden in modoDirecto */}
          {!modoDirecto && (
            <a
              href="/vista-clientes"
              target="_blank"
              title="Abrir Vista Clientes"
              className="w-8 h-8 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-gray-700 hover:text-blue-400 transition-all hover:bg-blue-500/5"
            >
              <Monitor className="w-3.5 h-3.5" />
            </a>
          )}
          <button 
            onClick={clearCart}
            className="w-8 h-8 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-gray-700 hover:text-red-500 transition-all hover:bg-red-500/5 group"
          >
            <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Dynamic Item Stream v10.7 - STRICT CONSOLE LIMIT */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-1 custom-scrollbar relative max-h-[190px] md:max-h-[220px]">
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(249, 115, 22, 0.2);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(249, 115, 22, 0.5);
          }
        `}</style>
        <div className="space-y-2 pb-2">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-10 gap-4 py-20">
               <ShoppingCart className="w-12 h-12" />
               <p className="text-[8px] font-black uppercase tracking-[0.3em] text-center">Registro Vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.product.id} 
                className="bg-white/[0.01] border border-white/5 rounded-2xl p-2.5 group/item transition-all hover:bg-white/[0.03] animate-v10-in"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[12px] font-black text-white uppercase tracking-tight truncate group-hover/item:text-orange-500 transition-colors">
                      {item.product.name}
                    </h4>
                    <p className="text-[8px] font-bold text-gray-600 mt-0.5 uppercase tracking-widest leading-none">
                      Bs. {item.product.price.toFixed(2)} UNIT
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white tabular-nums tracking-tighter">
                      Bs. {(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.03]">
                  <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-md hover:bg-white/10 transition-colors flex items-center justify-center text-gray-700 hover:text-red-500"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-black text-[10px] text-orange-500">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-md hover:bg-white/10 transition-colors flex items-center justify-center text-orange-500"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="w-6 h-6 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-gray-800 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Multimodal Command Center v10.6 - NANO CONSOLE */}
      {items.length > 0 && (
        <div className="flex-shrink-0 bg-[#070707] border-t border-white/10 p-3 space-y-2.5 z-40 relative shadow-[0_-20px_40px_rgba(0,0,0,0.9)] animate-v10-in">
           {/* Visual Fade Overlay - Slimmer */}
           <div className="absolute top-[-20px] left-0 right-0 h-[20px] bg-gradient-to-t from-[#070707] to-transparent pointer-events-none" />

          {/* Service Type Selector - LOCAL / LLEVAR / AUTO */}
          <div className="grid grid-cols-3 gap-1 p-0.5 bg-black/60 rounded-lg border border-white/5">
            {([
              { id: 'local', label: 'LOCAL', icon: <UtensilsCrossed className="w-4 h-4" /> },
              { id: 'llevar', label: 'LLEVAR', icon: <ShoppingBag className="w-4 h-4" /> },
              { id: 'auto', label: 'AUTO', icon: <Car className="w-4 h-4" /> },
            ] as const).map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setServiceType(id)}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-md transition-all duration-300 ${
                  serviceType === id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-700 hover:text-gray-400'
                }`}
              >
                <div className="scale-75">{icon}</div>
                <span className="text-[7px] font-black uppercase tracking-widest leading-none">{label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1.5">

             <div className="bg-white/[0.02] rounded-xl border border-white/5 px-4 py-2 hover:bg-white/[0.04] transition-all">
                <input 
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="AÑADIR NOTA DE LA ORDEN..."
                  className="w-full bg-transparent border-none p-0 text-[12px] text-white focus:ring-0 placeholder:text-gray-700 font-black uppercase tracking-wider h-6"
                />
             </div>
          </div>

          {/* Transaction Bar v10.6 - UNIFIED TRIGGER */}
          <div className="pt-1.5">
            {/* Modo Directo Status Banner */}
            {modoDirecto && (
              <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
                <Zap className="w-3 h-3 text-green-400 shrink-0" />
                <p className="text-[7px] font-black text-green-400 uppercase tracking-widest leading-none">
                  Modo Directo — Pedido completo al instante
                </p>
              </div>
            )}
            <button
              id="btn-checkout"
              onClick={handleCheckout}
              disabled={loading || items.length === 0}
              className={`w-full h-[54px] flex items-center justify-between px-5 group relative overflow-hidden rounded-xl active:scale-[0.98] transition-all ${
                modoDirecto
                  ? 'bg-gradient-to-r from-green-600 to-green-500 shadow-[0_10px_30px_rgba(34,197,94,0.25)]'
                  : 'btn-v10-primary'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                <>
                  <div className="text-left relative z-10">
                    <div className="flex items-center gap-1.5 opacity-50 mb-0.5">
                       <span className="text-[7px] font-black text-white uppercase tracking-widest">
                         {modoDirecto ? 'Cobro Directo' : 'Total a Pagar'}
                       </span>
                       <span className="w-1 h-1 rounded-full bg-white opacity-40" />
                       <span className="text-[8px] font-black text-white/70">{items.reduce((acc, i) => acc + i.quantity, 0)} Items</span>
                    </div>
                    <span className="text-2xl font-black text-white tracking-tighter italic leading-none">
                       Bs. {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 relative z-10">
                     {modoDirecto ? <Zap className="w-5 h-5 text-white" /> : <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform text-white opacity-80" />}
                  </div>
                </>
              )}
            </button>
            
            {error && (
              <div className="mt-2 text-red-500 text-[6px] font-black uppercase text-center animate-pulse">
                 {error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
