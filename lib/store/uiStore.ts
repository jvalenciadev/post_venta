import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  modoDirecto: boolean
  toggleModoDirecto: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed: boolean) => set({ isSidebarCollapsed: collapsed }),
      modoDirecto: true,
      toggleModoDirecto: () => set((state) => ({ modoDirecto: !state.modoDirecto })),
    }),
    {
      name: 'pos-ui-storage',
    }
  )
)
