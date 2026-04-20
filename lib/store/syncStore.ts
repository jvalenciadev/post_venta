import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface OfflineAction {
  id: string
  type: 'order' | 'expense'
  payload: any
  createdAt: number
}

interface SyncStore {
  actions: OfflineAction[]
  addAction: (type: 'order' | 'expense', payload: any) => void
  removeAction: (id: string) => void
  clearActions: () => void
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set) => ({
      actions: [],
      addAction: (type, payload) => set((state) => ({
        actions: [...state.actions, { id: crypto.randomUUID(), type, payload, createdAt: Date.now() }]
      })),
      removeAction: (id) => set((state) => ({
        actions: state.actions.filter(a => a.id !== id)
      })),
      clearActions: () => set({ actions: [] })
    }),
    {
      name: 'offline-sync-storage',
    }
  )
)
