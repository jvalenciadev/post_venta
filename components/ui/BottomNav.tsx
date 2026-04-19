'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ChefHat, 
  Package, 
  BarChart3,
  Users
} from 'lucide-react'
import { useUIStore } from '@/lib/store/uiStore'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/pos', label: 'POS', icon: ShoppingCart },
  { href: '/cocina', label: 'Cocina', icon: ChefHat },
  { href: '/productos', label: 'Productos', icon: Package },
  { href: '/usuarios', label: 'Users', icon: Users },
  { href: '/reportes', label: 'Reportes', icon: BarChart3 },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] safe-bottom">
      <div className="mx-4 mb-4 glass-modern rounded-[2rem] p-2 flex items-center justify-around shadow-2xl border-white/20">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 relative ${
                active ? 'text-orange-500 scale-110' : 'text-gray-500'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'fill-orange-500/20' : ''}`} />
              <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
              {active && (
                <div className="absolute -top-1 w-1 h-1 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,1)]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
