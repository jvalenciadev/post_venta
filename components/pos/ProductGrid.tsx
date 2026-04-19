import Image from 'next/image'
import { useState, useMemo } from 'react'
import { useCartStore } from '@/lib/store/cartStore'
import type { Product, Category } from '@/types/database'
import { Search, Plus, Filter, LayoutGrid, List, SlidersHorizontal, X, Utensils } from 'lucide-react'

export default function ProductGrid({
  products,
  categories,
  externalActiveCategory,
}: {
  products: Product[]
  categories: Category[]
  externalActiveCategory?: string | null
}) {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const addItem = useCartStore((s) => s.addItem)

  const filtered = useMemo(() => {
    return (products || []).filter((p) => {
      const name = p?.name || ''
      const matchSearch = name.toLowerCase().includes(search.toLowerCase())
      const matchCat = !externalActiveCategory || p.category_id === externalActiveCategory
      return matchSearch && matchCat
    })
  }, [products, search, externalActiveCategory])

  return (
    <div className="flex flex-col h-full gap-4 md:gap-6 p-4">
      {/* Search & Intelligence Controls - v10 */}
      <div className="flex items-center justify-between gap-4">
        <div className="group flex items-center bg-white/5 rounded-2xl border border-white/5 focus-within:border-orange-500/30 transition-all overflow-hidden flex-1 shadow-sm">
          <div className="w-14 h-14 flex items-center justify-center border-r border-white/5 text-gray-700 group-focus-within:text-orange-500 transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Buscar producto master... (Alt+S)"
            className="bg-transparent border-none focus:ring-0 px-6 py-4 text-white text-[11px] w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="hidden md:flex items-center gap-2 glass-modern p-1.5 rounded-2xl border-white/5">
           <button 
             onClick={() => setViewMode('grid')}
             className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
           >
             <LayoutGrid className="w-5 h-5" />
           </button>
           <button 
             onClick={() => setViewMode('list')}
             className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
           >
             <List className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Dynamic Product Landscape */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar no-scrollbar lg:custom-scrollbar">
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6 pb-20" 
          : "flex flex-col gap-3 pb-20"
        }>
          {filtered.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center glass-modern rounded-[3rem] opacity-40">
               <Utensils className="w-12 h-12 mb-4" />
               <p className="font-black uppercase tracking-widest text-xs">Sin coincidencias</p>
            </div>
          ) : (
            filtered.map((product) => (
              <button
                key={product.id}
                onClick={() => addItem(product)}
                className={`group relative glass-modern overflow-hidden transition-all duration-500 hover:scale-[1.03] active:scale-95 shadow-xl ${
                  viewMode === 'grid'
                    ? 'rounded-[2.5rem] p-5 flex flex-col gap-4 text-left border-white/5 hover:border-orange-500/40'
                    : 'rounded-3xl p-4 flex items-center justify-between gap-6 border-white/5 hover:border-orange-500/40'
                }`}
              >
                {/* Product Icon / Emoji */}
                <div className={`${
                  viewMode === 'grid' 
                    ? 'w-16 h-16 rounded-3xl' 
                    : 'w-12 h-12 rounded-2xl'
                } bg-white/[0.03] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500 shadow-inner border border-white/5`}>
                  <Utensils className="w-6 h-6 text-gray-600 group-hover:text-orange-500 transition-colors" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm lg:text-base font-black text-white uppercase tracking-tight truncate group-hover:text-orange-500 transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest line-clamp-1 opacity-60">
                    {product.description || 'Premium selection'}
                  </p>
                  
                  {viewMode === 'grid' && (
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-black text-white tabular-nums tracking-tighter">
                        Bs. {product.price.toFixed(2)}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-lg">
                        <Plus className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                </div>

                {viewMode === 'list' && (
                  <div className="flex items-center gap-6">
                    <span className="text-xl font-black text-white tabular-nums tracking-tighter">
                      Bs. {product.price.toFixed(2)}
                    </span>
                    <div className="p-3 rounded-2xl bg-orange-500 text-white shadow-lg">
                      <Plus className="w-5 h-5" />
                    </div>
                  </div>
                )}
                
                {/* Visual Glow on Hover */}
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
