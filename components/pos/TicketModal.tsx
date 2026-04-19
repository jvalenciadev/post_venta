'use client'

import { useState, useEffect } from 'react'
import { getOrderById } from '@/lib/actions/orders'
import type { Order } from '@/types/database'
import { TicketRole } from '@/lib/pdf/generateTicket'
import {
  FileText,
  Printer,
  X,
  Download,
  CheckCircle2,
  ChefHat,
  User,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ClockIcon,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'

export default function TicketModal({
  orderId,
  orderNumber,
  onClose,
}: {
  orderId: string
  orderNumber: number
  onClose: () => void
}) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState<TicketRole | 'all' | null>(null)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load order on mount
  useEffect(() => {
    if (!order && !loading) {
      setLoading(true)
      getOrderById(orderId).then((o) => {
        setOrder(o)
        setLoading(false)
      })
    }
  }, [orderId, order, loading])

  async function handleAction(role: TicketRole | 'all' = 'customer', action: 'download' | 'print' = 'print') {
    if (!order) return
    setPdfLoading(role as any)
    try {
      const res = await fetch(`/api/ticket?orderId=${order.id}&role=${role}`)
      if (!res.ok) throw new Error('Error generando PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)

      if (action === 'print') {
        const printWindow = window.open(url, '_blank')
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print()
          }
        }
      } else {
        const a = document.createElement('a')
        a.href = url
        a.download = `tickets-${role}-${String(order.order_number).padStart(4, '0')}.pdf`
        a.click()
      }

      // Cleanup slightly delayed to allow print window to load
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) {
      console.error(err)
      alert('Error en el servicio de tickets. Verifica tu conexión e intenta de nuevo.')
    } finally {
      setPdfLoading(null)
    }
  }

  const methodLabel: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-500 font-[Outfit]">
      {/* Cinematic Backdrop */}
      <div
        className="absolute inset-0 bg-[#050505]/80 backdrop-blur-2xl animate-in fade-in duration-700"
        onClick={onClose}
      />

      {/* Master Modal Container */}
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0a0a0a] border border-white/10 rounded-[3.5rem] shadow-[0_100px_150px_-50px_rgba(0,0,0,0.9)] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 overflow-hidden">
        
        {/* Main Body: Two Column Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* Left Section: Immersive Receipt View */}
          <div className="w-full md:w-[42%] bg-gradient-to-br from-white/5 to-transparent p-6 lg:p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative shrink-0 overflow-y-auto no-scrollbar">
            {/* Ambient Glows */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-orange-600/10 rounded-full blur-[120px] animate-pulse" />

            <div
              className="relative w-full max-w-[280px] bg-white text-black p-8 font-mono text-[10px] leading-tight shadow-[0_40px_80px_rgba(0,0,0,0.4)] transition-all duration-700 ease-out flex flex-col group cursor-default shrink-0"
              style={{
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 95%, 98% 98%, 96% 95%, 94% 98%, 92% 95%, 90% 98%, 88% 95%, 86% 98%, 84% 95%, 82% 98%, 80% 95%, 78% 98%, 76% 95%, 74% 98%, 72% 95%, 70% 98%, 68% 95%, 66% 98%, 64% 95%, 62% 98%, 60% 95%, 58% 98%, 56% 95%, 54% 98%, 52% 95%, 50% 98%, 48% 95%, 46% 98%, 44% 95%, 42% 98%, 40% 95%, 38% 98%, 36% 95%, 34% 98%, 32% 95%, 30% 98%, 28% 95%, 26% 98%, 24% 95%, 22% 98%, 20% 95%, 18% 98%, 16% 95%, 14% 98%, 12% 95%, 10% 98%, 8% 95%, 6% 98%, 4% 95%, 2% 98%, 0% 95%)'
              }}
            >
              {/* Ink bleed effect */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-10 transition-opacity" />

              <div className="text-center space-y-2 mb-6 border-b border-gray-200 pb-6">
                <p className="font-extrabold text-xs tracking-tighter uppercase italic leading-none">Grand Gourmet Premium</p>
                <div className="flex items-center justify-center gap-2 opacity-60 text-[8px]">
                  <ClockIcon className="w-2.5 h-2.5" />
                  <span>{mounted && order?.created_at ? format(new Date(order.created_at), 'dd MMM yyyy • HH:mm') : '--:--'}</span>
                </div>
                <p className="font-bold text-gray-500 text-[9px]">TICKET #{String(orderNumber).padStart(4, '0')}</p>
              </div>

              <div className="space-y-3 mb-6 flex-1 min-h-[140px]">
                {order?.items?.map(item => (
                  <div key={item.id} className="flex justify-between items-baseline gap-4">
                    <span className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
                      {item.quantity}× {item.product?.name}
                    </span>
                    <span className="font-bold text-gray-800">Bs. {(item.unit_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-[1.5px] border-black border-dashed pt-4 space-y-2">
                <div className="flex justify-between text-base font-black italic">
                  <span>TOTAL</span>
                  <span>Bs. {order?.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between opacity-50 text-[9px] items-center">
                  <span className="uppercase tracking-widest">{order?.payment?.method ? methodLabel[order.payment.method] : 'EFECTIVO'}</span>
                  <span className="text-[7px]">TX: {orderId.slice(0, 8).toUpperCase()}</span>
                </div>
              </div>

              {/* Printing Progress Overlay */}
              {pdfLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-600 animate-[shimmer_1.5s_infinite_linear] bg-[length:50%_100%] bg-gradient-to-r from-orange-600 via-white to-orange-600" />
                  </div>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-orange-600 animate-pulse">Servidor de Impresión</p>
                </div>
              )}
            </div>

            <div className="mt-6 text-center animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-300">
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Pago Verificado
              </div>
              <h3 className="text-3xl font-black text-white tracking-widest italic uppercase">Validada</h3>
            </div>
          </div>

          {/* Service Terminal: Master Control Center */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-14 bg-[#0a0a0a] relative overflow-hidden shrink-0">
            {/* Background Terminal Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-20" />

            {/* Close Trigger */}
            <button onClick={onClose} className="absolute top-8 right-8 w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all z-50">
              <X className="w-7 h-7" />
            </button>

            <div className="relative z-10 w-full max-w-sm text-center space-y-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] animate-v10-in">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  Transacción Autenticada
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                  Centro de <span className="text-orange-500">Control</span>
                </h2>
                <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.5em]">Mote y Chuño • {String(orderNumber).padStart(4, '0')}</p>
              </div>

              {/* THE MASTER BUTTON */}
              <div className="relative group">
                <div className="absolute -inset-10 bg-orange-500/20 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                <button
                  onClick={() => handleAction('all', 'print')}
                  disabled={!!pdfLoading}
                  className="relative w-full h-48 md:h-56 rounded-[3rem] overflow-hidden transition-all active:scale-[0.95] shadow-[0_50px_100px_-20px_rgba(249,115,22,0.4)] group/btn"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 group-hover/btn:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/60-lines.png')] pointer-events-none" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center shadow-2xl group-hover/btn:rotate-[360deg] transition-transform duration-1000">
                      {pdfLoading ? <Loader2 className="w-10 h-10 text-white animate-spin" /> : <Printer className="w-10 h-10 text-white drop-shadow-lg" />}
                    </div>
                    <div className="space-y-1">
                      <span className="block text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Imprimir Ticket</span>
                      <span className="block text-[8px] font-black text-white/60 uppercase tracking-[0.4em]">Protocolo de Impresión Directo</span>
                    </div>
                  </div>

                  {/* Aesthetic Scanning Line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/40 shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-[scan_3s_infinite_linear] pointer-events-none" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAction('all', 'download')}
                  className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-[9px] font-black uppercase text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <Download className="w-4 h-4" /> Exportar
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-[9px] font-black uppercase text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <ChevronRight className="w-4 h-4" /> Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Global Modal Footer: Static Balance */}
        <div className="px-10 py-6 border-t border-white/5 flex items-center justify-between opacity-30 shrink-0 bg-[#0a0a0a]">
          <div className="flex items-center gap-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em]">v11.4 Consola Cyber-Luxe</span>
          </div>
          <button onClick={onClose} className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
            Finalizar Sesión <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <style jsx>{`
          @keyframes scan {
            0% { top: 0; }
            50% { top: 100%; }
            100% { top: 0; }
          }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </div>
  )
}
