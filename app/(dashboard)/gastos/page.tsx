import { getExpenses, getExpenseStats } from '@/lib/actions/expenses'
import { createClient } from '@/utils/supabase/server'
import GastosClient from '@/components/expenses/GastosClient'
import { redirect } from 'next/navigation'

/**
 * SISTEMA MOTE Y CHUÑO - GESTIÓN DE GASTOS
 * Senior SSR implementation for expense tracking
 */

export default async function GastosPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get current user profile for permission check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // RBAC: Only admin and gastos can access this page
  if (!profile || (profile.role !== 'admin' && profile.role !== 'gastos')) {
    redirect('/dashboard')
  }

  // Parallel Data Fetching for Senior Performance
  const [expensesData, statsData, usersData] = await Promise.all([
    getExpenses(),
    getExpenseStats(),
    supabase.from('profiles').select('id, full_name').order('full_name')
  ])

  const initialExpenses = expensesData.data || []
  const { stats, totalGeneral } = statsData
  const users = (usersData.data || []).map(u => ({ id: u.id, name: u.full_name || 'Desconocido' }))

  return (
    <div className="flex-1 space-y-10">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center gap-4">
          GESTIÓN <span className="text-orange-500">EGRESOS</span>
        </h1>
        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">
          Consolidado Mensual de Gastos y Caja Chica
        </p>
      </div>

      <GastosClient 
        initialExpenses={initialExpenses}
        stats={stats || []}
        totalGeneral={totalGeneral || 0}
        users={users}
      />
    </div>
  )
}
