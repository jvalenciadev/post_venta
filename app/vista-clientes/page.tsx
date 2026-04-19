'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Order } from '@/types/database'
import { 
  Bell, 
  ChefHat, 
  Sparkles,
  Pizza,
  UtensilsCrossed,
  Clock as ClockIcon,
  Activity
} from 'lucide-react'

export default function CustomerFacingPage() {
  const [preparing, setPreparing] = useState<Order[]>([])
  const [ready, setReady] = useState<Order[]>([])
  const [currentTime, setCurrentTime] = useState<string>('')
  const [lastOrderReady, setLastOrderReady] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()

    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      }))
    }, 1000)

    const supabase = createClient()
    const channel = supabase
      .channel('public-orders-cfd-elite-v10.2')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new && (payload.new as Order).status === 'completado') {
             setLastOrderReady((payload.new as Order).id)
             playNotification()
          }
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      clearInterval(timer)
      supabase.removeChannel(channel)
    }
  }, [])

  const playNotification = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
      audio.volume = 0.4
      audio.play().catch(() => {})
    } catch (e) {
      console.error('Audio error:', e)
    }
  }

  async function fetchOrders() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['pendiente', 'preparando', 'completado'])
      .order('updated_at', { ascending: false })

    if (error) console.error('Error fetching orders:', error)

    if (data) {
      const orders = data as Order[]
      const today = new Date().toISOString().split('T')[0]
      const dailyOrders = orders.filter(o => o.created_at.startsWith(today))
      
      setPreparing(dailyOrders.filter(o => o.status === 'pendiente' || o.status === 'preparando').slice(0, 15))
      setReady(dailyOrders.filter(o => o.status === 'completado').slice(0, 6))
    }
  }

  return (
    <div className="h-screen w-screen bg-[#020202] text-white flex flex-col font-sans overflow-hidden relative selection:bg-orange-500/30 text-[Outfit]">
      
      {/* CINEMATIC NEURAL ENGINE v10.2 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-30%] left-[-10%] w-[80%] h-[80%] bg-orange-600/[0.04] rounded-full blur-[250px]" style={{ animation: 'pulse 8s infinite ease-in-out' }} />
         <div className="absolute bottom-[-30%] right-[-10%] w-[80%] h-[80%] bg-blue-600/[0.03] rounded-full blur-[250px]" style={{ animation: 'pulse 12s infinite ease-in-out reverse' }} />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
         
         {/* Moving Light Streaks */}
         <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" style={{ animation: 'shimmer 8s infinite linear' }} />
         <div className="absolute bottom-1/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/[0.05] to-transparent" style={{ animation: 'shimmer 12s infinite linear', animationDelay: '2s' }} />
      </div>

      {/* MINIMALIST COMMAND OVERLAY */}
      <div className="absolute top-10 left-10 right-10 z-50 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-6 bg-white/[0.03] backdrop-blur-3xl px-8 py-4 rounded-3xl border border-white/5 shadow-2xl">
           <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg">
              <UtensilsCrossed className="w-5 h-5 text-white" />
           </div>
           <div className="h-4 w-px bg-white/10" />
           <h1 className="text-xl font-black tracking-[0.4em] uppercase italic opacity-60">Elite Operational Display</h1>
        </div>

        <div className="flex items-center gap-8 bg-white/[0.03] backdrop-blur-3xl px-10 py-4 rounded-3xl border border-white/5 shadow-2xl">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest leading-none mb-1">Live Feed</span>
              <div className="text-4xl font-black text-white tabular-nums tracking-tighter leading-none">
                 {currentTime?.split(' ')[0] || '--:--'}
                 <span className="text-sm text-gray-600 ml-2 uppercase">{currentTime?.split(' ')[1]}</span>
              </div>
           </div>
        </div>
      </div>

      {/* ASYMMETRIC MASTER LANDSCAPE */}
      <div className="relative z-10 flex flex-1 min-h-0 pt-32 px-10 pb-10 gap-10">
        
        {/* TACTICAL SIDEBAR (25%): Preparing Stream */}
        <div className="w-[380px] flex flex-col min-h-0 bg-white/[0.01] backdrop-blur-3xl rounded-[4rem] border border-white/5 p-8 shadow-inner relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 px-4">
             <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" style={{ animation: 'pulse 2s infinite' }} />
                <h2 className="text-2xl font-black uppercase tracking-tight text-white/40 italic">In Queue</h2>
             </div>
             <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{preparing.length} Active</span>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-2">
            {preparing.map(order => (
              <div 
                key={order.id}
                className="bg-white/[0.02] border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group transition-all duration-500 hover:bg-white/[0.05]"
              >
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-orange-500/40 uppercase tracking-widest mb-1 leading-none">Ticket #</span>
                   <div className="text-4xl font-black text-white/50 group-hover:text-white tabular-nums transition-colors tracking-tighter">
                      {String(order.order_number).padStart(3, '0')}
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black text-gray-800 uppercase tracking-widest leading-none">Prep Stage</span>
                      <div className="w-12 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                         <div className="h-full bg-orange-500/40 w-1/2" style={{ animation: 'shimmer 2s infinite linear' }} />
                      </div>
                   </div>
                </div>
              </div>
            ))}
            {preparing.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center opacity-10 py-20 grayscale">
                  <Pizza className="w-24 h-24 mb-6" />
                  <p className="text-xl font-black uppercase tracking-[0.5em] italic">Standby</p>
               </div>
            )}
          </div>

          {/* Tactical Overlay Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020202] to-transparent pointer-events-none" />
        </div>

        {/* CINEMATIC STAGE (75%): Ready Showcase */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          
          <div className="flex items-center justify-between mb-8 px-10">
             <div className="flex items-center gap-6">
                <ChefHat className="w-8 h-8 text-orange-500" style={{ animation: 'float 6s infinite ease-in-out' }} />
                <h2 className="text-6xl font-black uppercase tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Ready for pickup</h2>
             </div>
             <div className="flex items-center gap-4 py-2 px-6 rounded-2xl bg-orange-600 shadow-[0_10px_25px_rgba(249,115,22,0.4)]">
                <Bell className="w-5 h-5 text-white" style={{ animation: 'shake 1s infinite' }} />
                <span className="text-xs font-black text-white uppercase tracking-[0.3em]">Collection Hub</span>
             </div>
          </div>

          <div className={`grid gap-10 flex-1 min-h-0 items-center justify-center content-center transition-all duration-1000 ${
            ready.length === 1 ? 'grid-cols-1' :
            ready.length === 2 ? 'grid-cols-2' :
            ready.length <= 4 ? 'grid-cols-2 lg:grid-cols-2' : 'grid-cols-3'
          }`}>
            {ready.map((order) => {
              const isMain = ready.length <= 2;
              return (
                <div 
                  key={order.id}
                  className={`relative group ${lastOrderReady === order.id ? 'animate-teleport' : ''}`}
                >
                  {/* Dynamic Neon Background Glow */}
                  <div className={`absolute inset-[-10%] bg-orange-600 rounded-full blur-[100px] opacity-0 group-hover:opacity-20 transition-all duration-1000 ${isMain ? 'blur-[150px]' : ''}`} />
                  
                  <div className={`relative w-full aspect-[4/5] mx-auto bg-gradient-to-br from-[#111] to-[#050505] border-[10px] border-orange-500 shadow-[0_50px_100px_-20px_rgba(249,115,22,0.6)] rounded-[6rem] flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 group-hover:border-white group-hover:-translate-y-8 ${isMain ? 'max-w-[550px]' : 'max-w-[380px]'}`}>
                     
                     {/* Cyber Aura */}
                     <div className="absolute inset-x-8 top-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                     <div className="absolute inset-x-8 bottom-10 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                     
                     <div className="relative z-10 flex flex-col items-center">
                       <span className={`font-black text-white tabular-nums tracking-tighter leading-none italic group-hover:scale-110 group-hover:rotate-1 transition-all duration-1000 ${isMain ? 'text-[22rem] drop-shadow-[0_40px_60px_rgba(0,0,0,1)]' : 'text-[15rem] drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]'}`}>
                          {String(order.order_number).slice(-2)}
                       </span>
                       <div className={`mt-6 px-10 py-3 rounded-full bg-orange-500 text-white font-black uppercase tracking-[0.5em] italic transition-all duration-1000 group-hover:bg-white group-hover:text-orange-600 group-hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] ${isMain ? 'text-xl' : 'text-sm'}`}>
                          Collect At Counter
                       </div>
                     </div>

                     {/* Particle Float Internal */}
                     <div className="absolute top-12 right-14 w-4 h-4 rounded-full bg-orange-500 shadow-[0_0_30px_rgba(249,115,22,1)] animate-pulse" />
                     {isMain && (
                        <div className="absolute top-1/2 left-10 -translate-y-1/2 flex flex-col gap-2 opacity-20">
                           <div className="w-8 h-1 bg-white" />
                           <div className="w-12 h-1 bg-white" />
                           <div className="w-8 h-1 bg-white" />
                        </div>
                     )}
                  </div>
                </div>
              );
            })}

            {ready.length === 0 && (
               <div className="col-span-full flex flex-col items-center justify-center py-60 opacity-5">
                  <Sparkles className="w-64 h-64 mb-12" style={{ animation: 'pulse 4s infinite' }} />
                  <p className="text-6xl font-black uppercase tracking-[1em] italic">Awaiting Magic</p>
               </div>
            )}
          </div>
          
          {/* Legend Overlay */}
          <div className="mt-10 flex items-center justify-between px-10 opacity-30 group/legend cursor-default">
             <div className="flex items-center gap-6">
                <span className="text-xl font-black uppercase tracking-[1em] italic text-white/50">Next-Gen Order Pipeline</span>
             </div>
             <div className="text-[10px] font-black uppercase tracking-[0.8em] flex items-center gap-4">
                <span>Data Integrity Check</span>
                <div className="w-2 h-2 rounded-full bg-green-500" />
             </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        
        body { 
          margin: 0; 
          padding: 0; 
          background: #020202; 
          overflow: hidden; 
          font-family: 'Outfit', sans-serif;
          cursor: none;
        }

        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes float { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(25px, -25px); } }
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
        @keyframes teleport { 0% { transform: scale(0.2) translateY(200px); opacity: 0; filter: brightness(10) blur(40px); } 100% { transform: scale(1) translateY(0); opacity: 1; filter: brightness(1) blur(0px); } }
        @keyframes pulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }

        .animate-teleport { animation: teleport 1.4s cubic-bezier(0.19, 1, 0.22, 1); }

        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}