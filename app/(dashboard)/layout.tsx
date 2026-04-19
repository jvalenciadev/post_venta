import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LayoutContent from '@/components/ui/LayoutContent'
import type { Profile } from '@/types/database'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <LayoutContent profile={profile as Profile | null}>
      {children}
    </LayoutContent>
  )
}
