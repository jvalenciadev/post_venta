'use client'

import { useUIStore } from '@/lib/store/uiStore'
import Sidebar from '@/components/ui/Sidebar'
import Header from '@/components/ui/Header'
import BottomNav from '@/components/ui/BottomNav'
import type { Profile } from '@/types/database'

export default function LayoutContent({
  children,
  profile
}: {
  children: React.ReactNode
  profile: Profile | null
}) {
  const { isSidebarCollapsed } = useUIStore()

  return (
    <div className="flex h-screen bg-[#050505] text-white selection:bg-orange-500/30 overflow-hidden">
      <Sidebar profile={profile} />
      
      <div 
        className={`flex-1 flex flex-col h-screen transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isSidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-72'
        } ml-0 overflow-hidden`}
      >
        <Header />
        <main className="flex-1 p-2 md:p-4 relative overflow-hidden flex flex-col">
           {/* Sophisticated Background Glows v10 */}
           <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-orange-600/[0.03] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
           <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-indigo-600/[0.03] rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />
           <div className="fixed top-1/2 left-1/2 w-[600px] h-[600px] bg-purple-600/[0.02] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />
           
           <div className="relative z-10 flex-1 min-h-0">
              {children}
           </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
