'use client'

import { useState, useTransition, useEffect } from 'react'
import { 
  Wallet, 
  Plus, 
  History, 
  Trash2, 
  Calendar, 
  User, 
  TrendingDown, 
  Search,
  ArrowUpRight,
  Download,
  Upload,
  Loader2,
  Edit2
} from 'lucide-react'
import { createExpense, deleteExpense } from '@/lib/actions/expenses'
import { Expense } from '@/types/database'
import { useSyncStore } from '@/lib/store/syncStore'

interface GastosClientProps {
  initialExpenses: Expense[]
  stats: { name: string; amount: number }[]
  totalGeneral: number
  users: { id: string; name: string }[]
}

export default function GastosClient({ initialExpenses, stats, totalGeneral, users }: GastosClientProps) {
  const [mounted, setMounted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [expenses, setExpenses] = useState(initialExpenses)
  const [formData, setFormData] = useState({
    concept: '',
    amount: '',
    person_name: users[0]?.name || '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.concept || !formData.amount) return

    const isOnline = typeof navigator !== 'undefined' && navigator.onLine

    if (!isOnline) {
      useSyncStore.getState().addAction('expense', {
        concept: formData.concept,
        amount: Number(formData.amount),
        person_name: formData.person_name,
        date: formData.date
      })
      setFormData({ ...formData, concept: '', amount: '' })
      alert('⚡ RESPALDO OFFLINE ACTIVADO ⚡\n\nEl Gasto se guardó en memoria local. Recuerda presionar "Sincronizar" cuando recuperes el internet.')
      return
    }

    startTransition(async () => {
      try {
        const result = await createExpense({
          concept: formData.concept,
          amount: Number(formData.amount),
          person_name: formData.person_name,
          date: formData.date
        } as any)

        if (result.success) {
          setFormData({ ...formData, concept: '', amount: '' })
          window.location.reload() // Dynamic update for stats
        }
      } catch (e: any) {
        alert('Error de Red: Verifica tu conexión a internet.')
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este registro de gasto?')) return
    startTransition(async () => {
      const result = await deleteExpense(id)
      if (result.success) {
        window.location.reload()
      }
    })
  }

  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full animate-v10-in pb-10">
      
      {/* LEFT COLUMN: MANAGEMENT & HISTORY */}
      <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-2">
        
        {/* NEW EXPENSE FORM - CYBER LUXE */}
        <div className="glass-modern p-10 rounded-[3rem] border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex items-center gap-6 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-2xl">
              <Plus className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">NUEVO <span className="text-orange-500">REGISTRO</span></h2>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-1">Control de Egresos y Caja Chica</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] pl-1">Concepto / Motivo</label>
              <div className="group flex items-center bg-white/5 rounded-2xl border border-white/5 focus-within:border-orange-500/30 transition-all overflow-hidden shadow-sm">
                <div className="w-14 h-14 flex items-center justify-center border-r border-white/5 text-gray-700 group-focus-within:text-orange-500 transition-colors">
                  <Search className="w-4 h-4" />
                </div>
                <input 
                  required
                  type="text" 
                  placeholder="Ej. Gasolina, Verduras..."
                  value={formData.concept}
                  onChange={(e) => setFormData({...formData, concept: e.target.value})}
                  className="bg-transparent border-none focus:ring-0 px-6 py-4 text-white w-full text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] pl-1">Monto (BOB)</label>
              <div className="group flex items-center bg-white/5 rounded-2xl border border-white/5 focus-within:border-orange-500/30 transition-all overflow-hidden shadow-sm">
                <div className="w-14 h-14 flex items-center justify-center border-r border-white/5 text-xs font-black text-gray-700 group-focus-within:text-orange-500 transition-colors">
                  Bs.
                </div>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="bg-transparent border-none focus:ring-0 px-6 py-4 text-white w-full text-lg font-black italic"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] pl-1">Persona Responsable</label>
              <div className="group flex items-center bg-white/5 rounded-2xl border border-white/5 focus-within:border-orange-500/30 transition-all overflow-hidden shadow-sm">
                <div className="w-14 h-14 flex items-center justify-center border-r border-white/5 text-gray-700 group-focus-within:text-orange-500 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <select 
                  className="bg-transparent border-none focus:ring-0 px-6 py-4 text-white w-full text-sm appearance-none cursor-pointer"
                  value={formData.person_name}
                  onChange={(e) => setFormData({...formData, person_name: e.target.value})}
                >
                  {users.length > 0 ? users.map(u => (
                    <option key={u.id} value={u.name} className="bg-[#121212]">{u.name}</option>
                  )) : <option value="Tienda">TIENDA</option>}
                  <option value="Tienda" className="bg-[#121212]">TIENDA / CAJA</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] pl-1">Fecha de Registro</label>
              <div className="group flex items-center bg-white/5 rounded-2xl border border-white/5 focus-within:border-orange-500/30 transition-all overflow-hidden shadow-sm">
                <div className="w-14 h-14 flex items-center justify-center border-r border-white/5 text-gray-700 group-focus-within:text-orange-500 transition-colors">
                  <Calendar className="w-4 h-4" />
                </div>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="bg-transparent border-none focus:ring-0 px-6 py-4 text-white w-full text-sm cursor-pointer"
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
               <button 
                type="submit"
                disabled={isPending}
                className="w-full btn-v10-primary py-5 rounded-[2rem] flex items-center justify-center gap-4 text-sm font-black italic uppercase tracking-widest group shadow-2xl shadow-orange-500/10 active:scale-95 transition-all"
               >
                 {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingDown className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                 GUARDAR GASTO EN SISTEMA
               </button>
            </div>
          </form>
        </div>

        {/* HISTORY LIST - SENIOR ADAPTIVE */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-6">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4">
              <History className="w-5 h-5 text-gray-600" /> HISTORIAL DE <span className="text-orange-500">CAJA</span>
            </h3>
            <div className="flex gap-2">
               <button className="p-3 rounded-xl bg-white/5 border border-white/5 text-gray-500 hover:text-white transition-all"><Upload className="w-4 h-4" /></button>
               <button className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-green-500/60 hover:text-green-500 transition-all"><Download className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="space-y-4">
            {expenses.map((exp) => (
              <div key={exp.id} className="glass-modern p-6 rounded-[2.2rem] border-white/5 hover:border-orange-500/20 transition-all group flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-lg shadow-xl shrink-0 group-hover:bg-orange-500/10 transition-all">
                    💸
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">{exp.concept}</h4>
                    <div className="flex items-center gap-3">
                       <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[7px] font-black uppercase">{exp.person_name}</span>
                       <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{new Date(exp.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-lg font-black text-white italic tracking-tighter">Bs. {exp.amount.toFixed(2)}</p>
                    <p className="text-[7px] font-black text-orange-500/30 uppercase tracking-[0.3em]">Monto Egreso</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-600 hover:text-white transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                     <button 
                      onClick={() => handleDelete(exp.id)}
                      className="w-8 h-8 rounded-lg bg-red-500/5 flex items-center justify-center text-red-500/40 hover:text-red-500 transition-all"
                     >
                       <Trash2 className="w-3.5 h-3.5" />
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: TOTALS & ANALYTICS */}
      <div className="w-full xl:w-96 space-y-8 h-fit lg:sticky lg:top-8">
        
        {/* TOTAL GENERAL CARD */}
        <div className="glass-modern p-10 rounded-[3rem] border-white/5 relative overflow-hidden bg-gradient-to-br from-[#121212] to-[#0a0a0a]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/[0.05] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex items-center gap-4 mb-6 text-gray-500">
             <ArrowUpRight className="w-5 h-5 text-orange-500" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Total Consumo Mensual</span>
          </div>
          
          <h2 className="text-6xl font-black text-white italic tracking-tighter">
            <span className="text-2xl not-italic mr-2">Bs</span>
            {totalGeneral.toFixed(2)}
          </h2>
          
          <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-gray-600">DISTRIBUCIÓN POR NODO</span>
                <span className="text-orange-500/50">ANÁLISIS</span>
             </div>

             <div className="space-y-6">
                {stats.length > 0 ? stats.map((s, idx) => {
                  const percent = totalGeneral > 0 ? (s.amount / totalGeneral) * 100 : 0
                  return (
                    <div key={idx} className="space-y-2">
                       <div className="flex items-center justify-between">
                         <p className="text-[9px] font-black text-white uppercase tracking-[0.2em]">{s.name}</p>
                         <p className="text-[10px] font-black text-orange-500">Bs. {s.amount.toFixed(2)}</p>
                       </div>
                       <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-[0_0_10px_rgba(249,115,22,0.3)] transition-all duration-1000" 
                            style={{ width: `${mounted ? percent : 0}%` }}
                          />
                       </div>
                    </div>
                  )
                }) : (
                  <p className="text-[10px] font-bold text-gray-700 uppercase italic text-center py-10">Sin registros asignados</p>
                )}
             </div>
          </div>
        </div>

        {/* STATUS CARD */}
        <div className="glass-modern p-8 rounded-[2.5rem] border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest italic">SISTEMA ONLINE</span>
           </div>
           <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">UPTIME: 99.9%</span>
        </div>

      </div>

    </div>
  )
}
