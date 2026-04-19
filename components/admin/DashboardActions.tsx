'use client'

import { useTransition } from 'react'
import { updateOrderStatus } from '@/lib/actions/orders'
import { Play, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { OrderStatus } from '@/types/database'

interface DashboardActionsProps {
  orderId: string
  currentStatus: OrderStatus
}

export default function DashboardActions({ orderId, currentStatus }: DashboardActionsProps) {
  const [isPending, startTransition] = useTransition()

  const handleStatusUpdate = (nextStatus: OrderStatus) => {
    startTransition(async () => {
      await updateOrderStatus(orderId, nextStatus)
    })
  }

  if (currentStatus === 'completado' || currentStatus === 'cancelado') {
    return (
      <div className="flex justify-center">
         <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center opacity-20">
            <CheckCircle2 className="w-4 h-4" />
         </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {currentStatus === 'pendiente' && (
        <button
          onClick={() => handleStatusUpdate('preparando')}
          disabled={isPending}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white border border-orange-500/20 transition-all active:scale-95"
          title="Iniciar Preparación"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
          <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Iniciar</span>
        </button>
      )}

      {currentStatus === 'preparando' && (
        <button
          onClick={() => handleStatusUpdate('completado')}
          disabled={isPending}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/20 transition-all active:scale-95"
          title="Finalizar Pedido"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
          <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Completar</span>
        </button>
      )}

      {isPending ? (
        <div className="w-8 h-8 flex items-center justify-center transition-all animate-pulse">
           <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
           <div className="w-1 h-1 bg-white rounded-full animate-bounce mx-0.5" style={{ animationDelay: '150ms' }} />
           <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      ) : (
        <button
          onClick={() => handleStatusUpdate('cancelado')}
          className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-700 hover:text-red-500 hover:bg-red-500/10 transition-all hover:border-red-500/20 active:scale-90"
          title="Anular Pedido"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
