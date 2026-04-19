import { createClient } from '@/utils/supabase/server'
import UserManager from '@/components/admin/UserManager'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * SENIOR PORTAL: Usuarios (Server Component)
 * Instant data hydration via SSR for zero-latency management experience.
 */

export const dynamic = 'force-dynamic' // Ensure we get fresh data always

export default async function UsuariosPage() {
  const supabase = await createClient()
  
  // High-performance direct fetch
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name')

  return (
    <Suspense fallback={<UserLoadingState />}>
      <UserManager initialProfiles={profiles || []} />
    </Suspense>
  )
}

function UserLoadingState() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 animate-pulse opacity-50">
      <div className="w-20 h-20 rounded-[2.5rem] bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Syncing Central Nodes</h2>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">Initializing Core Personnel Feed...</p>
      </div>
    </div>
  )
}
