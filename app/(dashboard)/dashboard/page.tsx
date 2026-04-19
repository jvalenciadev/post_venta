import { getSummaryStats } from '@/lib/actions/reports'
import { getTodayOrders, getActiveOrders } from '@/lib/actions/orders'
import { TrendingUp, ShoppingBag, Clock, DollarSign, ChefHat } from 'lucide-react'
import { format, differenceInHours } from 'date-fns'
import { es } from 'date-fns/locale'
import DashboardActions from '@/components/admin/DashboardActions'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [stats, todayOrders, activeOrders] = await Promise.all([
    getSummaryStats(),
    getTodayOrders(),
    getActiveOrders(),
  ])

  // Merge for the main list, ensuring pending ones are prioritized
  const allRelevant = [...activeOrders, ...todayOrders.filter(to => !activeOrders.find(ao => ao.id === to.id))]
  
  const completedToday = todayOrders.filter((o) => o.status === 'completado').length
  const cancelledToday = todayOrders.filter((o) => o.status === 'cancelado').length

  const statusMap: Record<string, string> = {
    pendiente: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
    preparando: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    completado: 'bg-green-500/10 border-green-500/20 text-green-500',
    cancelado: 'bg-red-500/10 border-red-500/20 text-red-400',
  }

  return (
    <div className="space-y-8 animate-v10-in pb-20 lg:pb-0">
      {/* Premium Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
           <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-2 block">Mote y Chuño • Enterprise Intelligence</span>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Control <span className="text-orange-500">Center</span></h1>
        </div>
        <div className="flex items-center gap-3 glass-modern px-5 py-3 rounded-2xl border-white/5">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           <p className="text-[11px] font-black text-white uppercase tracking-widest">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
           </p>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Operaciones Netas"
          value={`Bs. ${stats.todayRevenue.toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6" />}
          gradient="from-orange-500 to-orange-600"
          sub={`${completedToday} exitosos`}
        />
        <StatCard
          label="Cargas en Curso"
          value={String(stats.activeOrderCount)}
          icon={<Clock className="w-6 h-6" />}
          gradient="from-blue-500 to-indigo-600"
          sub="Monitoreo Live"
        />
        <StatCard
          label="Flujo de Pedidos"
          value={String(stats.todayOrderCount)}
          icon={<ShoppingBag className="w-6 h-6" />}
          gradient="from-purple-500 to-pink-600"
          sub={`${cancelledToday} descartados`}
        />
        <StatCard
          label="Eficiencia Ticket"
          value={
            completedToday > 0
              ? `Bs. ${(stats.todayRevenue / completedToday).toFixed(2)}`
              : 'Bs. 0.00'
          }
          icon={<TrendingUp className="w-6 h-6" />}
          gradient="from-emerald-500 to-teal-600"
          sub="ROI por Cliente"
        />
      </div>

      {/* Main Content Hub: Bento Style */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Major Bento: Critical & Recent Orders */}
        <div className="xl:col-span-8 glass-modern rounded-[3rem] p-8 lg:p-12 border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
           
           <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Consola de <span className="text-orange-500">Comandas</span></h2>
                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">Gestión Centralizada de Operaciones</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-right hidden sm:block">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Sincronicidad</p>
                    <p className="text-[10px] font-black text-green-500 uppercase italic">Activa</p>
                 </div>
              </div>
           </div>

           {allRelevant.length === 0 ? (
             <div className="py-24 flex flex-col items-center justify-center opacity-20">
                <ShoppingBag className="w-20 h-20 mb-6" />
                <p className="font-black uppercase tracking-[0.5em] text-[10px]">Sin actividad de red detectada</p>
             </div>
           ) : (
             <div className="overflow-x-auto no-scrollbar">
               <table className="w-full">
                 <thead>
                   <tr className="text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] border-b border-white/[0.03]">
                     <th className="pb-6 pl-4">Identificador</th>
                     <th className="pb-6">Temporalidad</th>
                     <th className="pb-6">Estado Consola</th>
                     <th className="pb-6 text-center">Acción</th>
                     <th className="pb-6 text-right pr-4">Total</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/[0.03]">
                   {allRelevant.slice(0, 15).map((order) => {
                     const hoursOld = differenceInHours(new Date(), new Date(order.created_at))
                     const isCritical = hoursOld >= 48 && (order.status === 'pendiente' || order.status === 'preparando')
                     
                     return (
                      <tr key={order.id} className={`group/row transition-all duration-300 ${isCritical ? 'bg-red-500/[0.02]' : 'hover:bg-white/[0.02]'}`}>
                        <td className="py-6 pl-4">
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-2xl bg-black/40 border flex items-center justify-center text-orange-500 font-black text-sm italic shadow-2xl transition-all group-hover/row:scale-110 ${isCritical ? 'border-red-500/50 shadow-red-500/20' : 'border-white/5'}`}>
                                {String(order.order_number).slice(-2)}
                             </div>
                             <div>
                                <span className="text-xs font-black text-white tracking-widest uppercase block">#{String(order.order_number).padStart(4, '0')}</span>
                                {isCritical && <span className="text-[7px] font-black text-red-500 uppercase tracking-[0.2em] animate-pulse">Ticket Crítico</span>}
                             </div>
                          </div>
                        </td>
                        <td className="py-6">
                          <div className="flex flex-col">
                             <span className="text-[11px] font-bold text-gray-400">{format(new Date(order.created_at), 'dd/MM/yy')}</span>
                             <span className="text-[9px] font-black text-gray-600 tracking-tighter">{format(new Date(order.created_at), 'HH:mm:ss')}</span>
                          </div>
                        </td>
                        <td className="py-6">
                          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] ${statusMap[order.status.toLowerCase()] || 'bg-gray-500/10 border-gray-500/20 text-gray-400'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            {order.status.toUpperCase()}
                          </div>
                        </td>
                        <td className="py-6 text-center">
                           <DashboardActions orderId={order.id} currentStatus={order.status.toLowerCase() as any} />
                        </td>
                        <td className="py-6 text-right pr-4">
                          <span className="text-lg font-black text-white tabular-nums tracking-tighter">Bs. {order.total.toFixed(2)}</span>
                        </td>
                      </tr>
                     )
                   })}
                 </tbody>
               </table>
             </div>
           )}
        </div>

        {/* Minor Bento: Quick Actions / Intelligence */}
        <div className="xl:col-span-4 flex flex-col gap-6">
           <div className="glass-modern p-10 rounded-[3rem] border border-orange-500/10 group cursor-pointer overflow-hidden relative flex-1 min-h-[250px]">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                 <TrendingUp className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-8 border border-orange-500/20">
                   <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-3">Analítica Avanzada</h3>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed mb-8 opacity-60">Visualiza el flujo de red y proyecciones de inventario.</p>
                <button className="btn-v10-primary w-full py-4 text-[10px] tracking-[0.3em]">DESPLEGAR INTELLIGENCE</button>
              </div>
           </div>

           <div className="glass-modern p-10 rounded-[3rem] border border-blue-500/10 group cursor-pointer overflow-hidden relative flex-1 min-h-[250px]">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-transform">
                 <ChefHat className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-8 border border-blue-500/20">
                   <ChefHat className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-3">Radar Cocina</h3>
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed mb-8 opacity-60">Control remoto de la terminal de producción KDS.</p>
                <div className="flex -space-x-3 mb-8">
                   {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-black/80 border-2 border-white/5 flex items-center justify-center text-[10px] font-black text-white/40 ring-2 ring-[#050505]">{i}</div>
                   ))}
                   <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-[#050505] flex items-center justify-center text-[10px] font-black text-white shadow-lg ring-2 ring-[#050505]">+5</div>
                </div>
                <button className="btn-v10-glass w-full py-4 text-[10px] tracking-[0.3em]">ABRIR RADAR</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  gradient,
  sub,
}: {
  label: string
  value: string
  icon: React.ReactNode
  gradient: string
  sub: string
}) {
  return (
    <div className="glass-modern p-10 rounded-[3rem] border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-500">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
           <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${gradient} text-white shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-700`}>
              {icon}
           </div>
           <div className="px-4 py-1.5 bg-white/[0.03] rounded-full text-[8px] font-black text-gray-500 uppercase tracking-widest border border-white/5">
              Live Feed
           </div>
        </div>
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-3">{label}</h3>
        <p className="text-4xl font-black text-white tracking-tighter italic tabular-nums">{value}</p>
        <div className="mt-8 flex items-center gap-3">
           <div className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{sub}</p>
        </div>
      </div>
      {/* Visual Depth Card */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/[0.01] rounded-full blur-3xl group-hover:bg-orange-500/5 transition-all duration-1000" />
    </div>
  )
}
