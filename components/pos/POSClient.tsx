'use client'

import { useState, useEffect } from 'react'
import ProductGrid from '@/components/pos/ProductGrid'
import Cart from '@/components/pos/Cart'
import OrderStatus from '@/components/pos/OrderStatus'
import TicketModal from '@/components/pos/TicketModal'
import type { Product, Category } from '@/types/database'
import { Command, HelpCircle, UtensilsCrossed, ShoppingCart } from 'lucide-react'

export default function POSClient({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const [ticketOrder, setTicketOrder] = useState<{ id: string; num: number } | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement
        searchInput?.focus()
      }

      if (e.key === 'Escape' && ticketOrder) {
        setTicketOrder(null)
      }

      if (e.key === 'F2') {
        e.preventDefault()
        const checkoutBtn = document.getElementById('btn-checkout')
        checkoutBtn?.click()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [ticketOrder])

  const getEmoji = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('taco')) return '🌮'
    if (n.includes('bebida') || n.includes('refresco') || n.includes('agua')) return '🥤'
    if (n.includes('postre') || n.includes('dulce')) return '🍩'
    if (n.includes('comida') || n.includes('platillo')) return '🍽️'
    if (n.includes('entrada')) return '🥗'
    if (n.includes('alcohol') || n.includes('cerveza')) return '🍺'
    if (n.includes('marisco')) return '🍤'
    if (n.includes('arroz')) return '🍚'
    if (n.includes('asado') || n.includes('carne')) return '🥩'
    return '🍴'
  }

  return (
    <div className="h-full w-full flex flex-col pt-2 lg:pt-0 gap-4 lg:gap-6 overflow-hidden animate-v10-in">
      {/* Mobile-Only Total Bar */}
      <div className="lg:hidden flex items-center justify-between glass-modern p-5 rounded-[2rem] mx-2 mt-2 border-orange-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tighter uppercase italic">Mote y <span className="text-orange-500">Chuño</span></h1>
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Sesión Activa</p>
          </div>
        </div>
        <button
          onClick={() => {
            const cartScroll = document.getElementById('cart-section')
            cartScroll?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex flex-col items-end"
        >
          <span className="text-xs font-black text-orange-500 leading-none">VER ORDEN</span>
          <span className="text-[10px] font-bold text-white/60">Toca para revisar</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-0 px-2 lg:px-0">

        {/* CATEGORIES: Horizontal on Mobile, Vertical on Desktop */}
        <div className="flex-shrink-0 lg:w-[84px] flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto no-scrollbar py-1 lg:py-0">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex flex-col items-center justify-center gap-2 p-4 lg:p-0 lg:aspect-square rounded-[1.8rem] transition-all border min-w-[90px] lg:min-w-0 ${activeCategory === null
              ? 'bg-orange-500 border-orange-400 text-white shadow-[0_10px_25px_rgba(249,115,22,0.3)]'
              : 'glass-modern text-gray-500 hover:text-white'
              }`}
          >
            <Command className="w-5 h-5 lg:w-6 lg:h-6" />
            <span className="text-[9px] font-black uppercase tracking-tight">Todo</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex flex-col items-center justify-center gap-2 p-4 lg:p-0 lg:aspect-square rounded-[1.8rem] transition-all border min-w-[90px] lg:min-w-0 ${activeCategory === cat.id
                ? 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400 text-white shadow-2xl scale-105 z-10'
                : 'glass-modern text-gray-500 hover:text-white'
                }`}
            >
              <span className="text-2xl lg:text-3xl leading-none">{getEmoji(cat.name)}</span>
              <span className="text-[9px] font-black uppercase tracking-tight truncate w-full px-2 text-center">
                {cat.name}
              </span>
            </button>
          ))}
        </div>

        {/* PRODUCTS HUB: Dynamic Fluidity */}
        <div className="flex-1 min-h-0 lg:rounded-[3rem] glass-modern overflow-hidden relative shadow-inner">
          <ProductGrid
            products={products || []}
            categories={categories || []}
            externalActiveCategory={activeCategory}
          />
        </div>

        <div
          id="cart-section"
          className="w-full lg:w-[340px] xl:w-[380px] 2xl:w-[440px] flex flex-col gap-4 h-[55vh] lg:h-full flex-shrink-0 min-h-0 transition-all duration-500 relative"
        >
          <div className="flex-1 min-h-0 rounded-[2rem] lg:rounded-[3rem] bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/10 overflow-hidden flex flex-col shadow-3xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
            <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden relative z-10">
              <Cart onOrderCreated={(id, num) => setTicketOrder({ id, num })} />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Command Bar */}
      <div className="hidden lg:flex items-center gap-6 px-8 py-3 flex-shrink-0 glass-modern rounded-full mx-auto mb-4 border-white/10">
        <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
          <span className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">F2</span> Cobro Rápido
        </div>
        <div className="w-px h-4 bg-white/5" />
        <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
          <span className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">Alt+S</span> Búsqueda
        </div>
        <div className="w-px h-4 bg-white/5" />
        <div className="flex items-center gap-1.5 text-xs font-black text-white tracking-widest italic uppercase">
          <HelpCircle className="w-4 h-4 text-orange-500" /> POS <span className="opacity-40 text-orange-200">MASTER V.11</span>
        </div>
      </div>

      {/* TICKET DIALOG MODAL (RESTORED) */}
      {ticketOrder && (
        <TicketModal
          orderId={ticketOrder.id}
          orderNumber={ticketOrder.num}
          onClose={() => setTicketOrder(null)}
        />
      )}

    </div>
  )
}
