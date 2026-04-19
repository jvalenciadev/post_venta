'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import { useUIStore } from '@/lib/store/uiStore'
import {
  ChefHat,
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  LogOut,
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Users,
  Wallet
} from 'lucide-react'
import type { Profile } from '@/types/database'

const navItems = [
  { href: '/dashboard', label: 'Panel Control', icon: LayoutDashboard, roles: ['admin'] },
  { href: '/pos', label: 'POS / Ventas', icon: ShoppingCart, roles: ['admin', 'cajero'] },
  { href: '/cocina', label: 'Cocina', icon: ChefHat, roles: ['admin', 'cocinero'] },
  { href: '/productos', label: 'Productos', icon: Package, roles: ['admin'] },
  { href: '/usuarios', label: 'Usuarios', icon: Users, roles: ['admin'] },
  { href: '/reportes', label: 'Reportes', icon: BarChart3, roles: ['admin'] },
  { href: '/gastos', label: 'Gastos', icon: Wallet, roles: ['admin', 'gastos'] },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const { isSidebarCollapsed, toggleSidebar } = useUIStore()

  const filteredNavItems = navItems.filter(item => 
    !profile || item.roles.includes(profile.role)
  )

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-[#0a0a0a]/80 backdrop-blur-3xl border-r border-white/5 hidden lg:flex flex-col z-50 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[20px_0_50px_rgba(0,0,0,0.5)] ${
        isSidebarCollapsed ? 'w-[80px]' : 'w-72'
      }`}
    >
      {/* Logo Section v10 */}
      <div className={`flex items-center gap-4 p-8 border-b border-white/[0.03] transition-all ${isSidebarCollapsed ? 'justify-center p-6' : ''}`}>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-[0_0_25px_rgba(249,115,22,0.3)] shrink-0 group">
          <ChefHat className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
        </div>
        {!isSidebarCollapsed && (
          <div className="animate-v10-in">
            <span className="block font-black text-white text-[10px] uppercase tracking-[0.4em] leading-none opacity-50 mb-1">Sistema Elite</span>
            <span className="font-black text-white text-xl tracking-tighter uppercase italic">POS <span className="text-orange-500">Master</span></span>
          </div>
        )}
      </div>

      {/* Navigation Hub v10 */}
      <nav className="flex-1 p-4 space-y-3 mt-6">
        {filteredNavItems.map(({ href, label, icon: Icon }) => {
          const active = pathname ? (pathname === href || pathname.startsWith(href + '/')) : false
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-4 rounded-[1.5rem] transition-all duration-500 relative ${
                isSidebarCollapsed ? 'p-3.5 justify-center' : 'px-5 py-4'
              } ${
                active
                  ? 'bg-orange-500/10 text-orange-500 shadow-[0_10px_30px_rgba(249,115,22,0.1)]'
                  : 'text-gray-500 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-all duration-500 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'group-hover:text-gray-300'}`} />
              {!isSidebarCollapsed && (
                <span className={`text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                  {label}
                </span>
              )}
              {active && (
                <div className="absolute left-0 w-1.5 h-6 bg-orange-500 rounded-r-full shadow-[5px_0_15px_rgba(249,115,22,1)]" />
              )}
            </Link>
          )
        })}

        <div className="h-px bg-white/[0.03] mx-4 my-6" />

        {/* Collapse Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center gap-4 rounded-[1.5rem] p-4 text-gray-700 hover:text-orange-500 transition-all hover:bg-white/[0.02] ${
            isSidebarCollapsed ? 'justify-center' : 'px-5'
          }`}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!isSidebarCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Contraer Consola</span>}
        </button>
      </nav>

      {/* Interaction Footing v10 */}
      <div className="p-6 border-t border-white/[0.03] space-y-4">
        {/* Fullscreen Tool */}
        <button
          onClick={toggleFullscreen}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] text-gray-600 hover:text-blue-400 hover:bg-blue-500/5 transition-all border border-white/[0.05] ${
            isSidebarCollapsed ? 'justify-center' : 'px-5'
          }`}
        >
          <Maximize2 className="w-4 h-4" />
          {!isSidebarCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Modo Inmersivo</span>}
        </button>

        {/* User Experience Card */}
        <div className={`flex items-center gap-4 rounded-[1.8rem] transition-all p-3 bg-white/[0.02] border border-white/[0.05] ${isSidebarCollapsed ? 'justify-center' : 'pr-4'}`}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shrink-0 shadow-xl">
            <UtensilsCrossed className="w-5 h-5 text-orange-500/80" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-white truncate uppercase tracking-tighter">
                {profile?.full_name?.split(' ')[0] ?? 'Operador'}
              </p>
              <p className="text-[8px] font-black text-orange-500/50 uppercase tracking-widest leading-none mt-1">{profile?.role}</p>
            </div>
          )}
        </div>

        <form action={logout}>
          <button
            type="submit"
            className={`w-full flex items-center gap-4 p-4 text-[10px] font-black uppercase tracking-widest text-gray-700 hover:text-red-500 hover:bg-red-500/5 transition-all ${
              isSidebarCollapsed ? 'justify-center' : 'px-6'
            }`}
          >
            <LogOut className="w-4 h-4" />
            {!isSidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </form>
      </div>
    </aside>
  )
}
