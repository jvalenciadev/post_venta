'use client'

import { usePathname } from 'next/navigation'
import { Bell, Search, User, CloudOff, CloudUpload, Server, RefreshCw } from 'lucide-react'
import { useSyncStore } from '@/lib/store/syncStore'
import { useState, useEffect } from 'react'
import { createOrder } from '@/lib/actions/orders'
import { createExpense } from '@/lib/actions/expenses'

export default function Header() {
  const pathname = usePathname()
  const { actions, removeAction } = useSyncStore()
  const [syncing, setSyncing] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    setIsOffline(!navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleSync = async () => {
    if (!navigator.onLine) {
      alert('Sigues sin conexión a internet. Reconéctate para iniciar sincronización principal.')
      return
    }
    setSyncing(true)
    let syncCount = 0
    for (const action of actions) {
      try {
        if (action.type === 'order') {
          const { items, paymentMethod, amountPaid, notes, modoDirecto } = action.payload
          await createOrder(items, paymentMethod, amountPaid, notes, modoDirecto)
        } else if (action.type === 'expense') {
          await createExpense(action.payload)
        }
        removeAction(action.id)
        syncCount++
      } catch (e) {
        console.error('Error sincronizando cola', action, e)
      }
    }
    setSyncing(false)
    if (syncCount > 0) {
      alert(`¡✅ Sincronización Élite Completa!\n\nSe restablecieron ${syncCount} operaciones locales en la Nube Supabase.`)
      window.location.reload()
    }
  }
  
  const getTitle = () => {
    if (pathname.includes('/dashboard')) return { main: 'Consola', sub: 'CENTRAL' }
    if (pathname.includes('/pos')) return { main: 'Mote y Chuño', sub: 'VENTAS' }
    if (pathname.includes('/productos')) return { main: 'Inventario', sub: 'MAESTRO' }
    if (pathname.includes('/reportes')) return { main: 'Inteligencia', sub: 'DATOS' }
    if (pathname.includes('/cocina')) return { main: 'Cocina', sub: 'RADAR' }
    return { main: 'Sistema', sub: 'ELITE' }
  }

  const title = getTitle()

  return (
    <header className="h-24 lg:h-28 bg-transparent lg:bg-[#050505]/40 backdrop-blur-3xl sticky top-0 z-[40] flex items-center justify-between px-6 lg:px-10 border-b border-white/[0.03] transition-all duration-500">
      <div className="flex flex-col">
          <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.5em] mb-1 opacity-80">{title.sub}</span>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
            {title.main}
          </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden xl:flex relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-4 h-4 text-gray-700 group-focus-within:text-orange-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Búsqueda Global de Comandos..."
            className="bg-white/[0.02] border border-white/5 rounded-2xl pl-16 pr-6 py-3 text-[11px] font-black uppercase tracking-widest text-white placeholder-gray-700 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 transition-all w-80"
          />
        </div>

        <div className="flex items-center gap-3">
           {actions.length > 0 && (
             <button 
               onClick={handleSync}
               disabled={syncing}
               className="relative flex items-center gap-2 px-4 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 transition-all text-white font-black italic tracking-widest uppercase shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]"
             >
               {syncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Server className="w-5 h-5" />}
               <span className="text-[10px]">Sync ({actions.length})</span>
               <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-[#050505] animate-pulse flex items-center justify-center text-[8px]">{actions.length}</span>
             </button>
           )}

           {isOffline && (
             <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 group relative">
               <CloudOff className="w-5 h-5 animate-pulse" />
               <div className="absolute top-14 opacity-0 group-hover:opacity-100 bg-red-500 text-white text-[8px] font-black uppercase px-3 py-1.5 rounded-lg whitespace-nowrap transition-opacity pointer-events-none">
                 Pérdida de Conexión
               </div>
             </div>
           )}

           <button className="relative w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-gray-500 hover:text-orange-500 transition-all group">
             <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
             <span className="absolute top-3 right-3 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#050505] shadow-[0_0_10px_rgba(249,115,22,1)]"></span>
           </button>

           <div className="h-10 w-px bg-white/[0.05] mx-2 hidden md:block"></div>

           <button className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-white/[0.02] transition-all border border-transparent hover:border-white/5 group">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
               <User className="w-5 h-5 text-orange-500/80" />
             </div>
             <div className="hidden md:flex flex-col items-start mr-3">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Maestro Op</span>
                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.2em] leading-none mt-1">Estado: En Línea</span>
             </div>
           </button>
        </div>
      </div>
    </header>
  )
}
