'use client'

import { useState, useEffect, useTransition } from 'react'
import { deleteProduct } from '@/lib/actions/products'
import ProductForm from '@/components/products/ProductForm'
import type { Product, Category } from '@/types/database'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Package, 
  ToggleLeft, 
  ToggleRight, 
  Search, 
  Filter, 
  Layers, 
  Tag, 
  Box, 
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProductsClient({
  products: initialProducts,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const filteredProducts = initialProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function openNew() {
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(product: Product) {
    setEditing(product)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este nodo de inventario? Esta acción es irreversible.')) return
    setDeleting(id)
    const result = await deleteProduct(id)
    if (result?.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
    setDeleting(null)
  }

  return (
    <div className="h-full flex flex-col gap-8 animate-v10-in pb-10">
      {/* Header section v11.9 - SLIM REGISTRY */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 glass-modern p-6 lg:px-10 rounded-[2.5rem] border-white/5 relative overflow-hidden shadow-xl text-center md:text-left">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/[0.02] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex items-center gap-6 justify-center md:justify-start">
           <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-xl shrink-0">
              <Package className="w-7 h-7" />
           </div>
           <div>
              <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                 <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                 <span className="text-[8px] font-black text-orange-500 uppercase tracking-[0.4em] opacity-80">Registry v11.9</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">
                PRODUCTOS <span className="text-orange-500">& ACTIVOS</span>
              </h1>
           </div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
           {/* Search Dynamic Input - Optimized pl-14 */}
            <div className="group flex items-center bg-black/40 rounded-2xl border border-white/10 focus-within:border-orange-500/30 transition-all overflow-hidden w-full sm:w-80 shadow-2xl">
              <div className="w-12 h-12 flex items-center justify-center border-r border-white/5 text-gray-600 group-focus-within:text-orange-500 transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Filtrar base de datos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:ring-0 px-5 py-3 text-white text-xs w-full"
              />
            </div>
           
           <button 
             onClick={openNew}
             className="btn-v10-primary flex items-center gap-3 py-3.5 px-6 shrink-0 active:scale-95 transition-all text-[9px] font-black tracking-widest uppercase italic"
           >
             <Plus className="w-4 h-4" />
             Inyectar Nodo
           </button>
        </div>
      </div>

      {/* Registry Minimal Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
        {[
          { label: 'Unidades', value: initialProducts.length, icon: Box, color: 'text-white' },
          { label: 'Online', value: initialProducts.filter(p => p.active).length, icon: ToggleRight, color: 'text-green-500' },
          { label: 'Grupos', value: categories.length, icon: Layers, color: 'text-orange-500' },
          { label: 'Valorización', value: `Bs. ${initialProducts.reduce((acc, p) => acc + p.price, 0).toLocaleString()}`, icon: Tag, color: 'text-blue-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-modern px-5 py-3 rounded-2xl border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
            <div>
              <p className="text-[6px] font-black text-gray-700 uppercase tracking-[0.2em] mb-0.5">{stat.label}</p>
              <p className={`text-sm font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
            </div>
            <stat.icon className={`w-4 h-4 ${stat.color} opacity-10 group-hover:opacity-40 transition-opacity`} />
          </div>
        ))}
      </div>

      {/* Products Grid - ULTRA DENSITY v11.9 */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {filteredProducts.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-white/5 rounded-[2.5rem] mt-4">
             <Box className="w-12 h-12 text-gray-700 mb-2" />
             <p className="text-[8px] font-black uppercase tracking-[0.4em]">Registro Vacío</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-10">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className={`glass-modern p-3 rounded-[1.8rem] border-white/5 hover:border-orange-500/30 transition-all group relative overflow-hidden flex flex-col gap-3 ${
                  !product.active ? 'opacity-40' : ''
                }`}
              >
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-2xl bg-black border border-white/5 flex items-center justify-center shadow-lg relative shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-gray-800 opacity-30" />
                        )}
                        {!product.active && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                             <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          </div>
                        )}
                     </div>

                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <span 
                             className="px-2 py-0.5 rounded-md text-[6px] font-black uppercase tracking-widest border border-white/10"
                             style={{ backgroundColor: `${product.category?.color}10`, color: product.category?.color }}
                           >
                             {product.category?.name || 'GNR'}
                           </span>
                           <span className="text-[6px] font-black text-gray-800 uppercase tracking-tighter">ID-{product.id.slice(0, 4)}</span>
                        </div>
                        <h3 className="text-sm font-black text-white tracking-tight uppercase truncate leading-none mb-1 group-hover:text-orange-500 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-[10px] font-black text-orange-500 italic tracking-tighter">Bs. {product.price.toFixed(2)}</p>
                     </div>

                     <div className="flex flex-col gap-1 shrink-0">
                        <button 
                          onClick={() => openEdit(product)}
                          className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-600 hover:text-white hover:bg-orange-500 transition-all"
                        >
                           <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        >
                           {deleting === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                     </div>
                  </div>
                  
                  {/* Slim Footer */}
                  <div className="pt-2 border-t border-white/[0.03] flex items-center justify-between">
                     <p className="text-[7px] text-gray-700 font-black uppercase tracking-widest truncate max-w-[70%]">
                        {product.description || 'Sin parámetros descriptivos'}
                     </p>
                     <div className={`w-1.5 h-1.5 rounded-full ${product.active ? 'bg-green-500' : 'bg-gray-800 shadow-inner'}`} />
                  </div>
                  
                  {/* Dynamic Scan Line Hover Effect */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-orange-500/20 opacity-0 group-hover:opacity-100 group-hover:animate-[scan_3s_infinite_linear] pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => router.refresh()}
        />
      )}
    </div>
  )
}
