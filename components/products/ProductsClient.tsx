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
      {/* Header section v12.0 - INTEL CENTER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 glass-modern p-10 rounded-[3.5rem] border-white/5 relative overflow-hidden shadow-2xl shrink-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/[0.03] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-10">
           <div className="w-20 h-20 rounded-[2.2rem] bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-[0_0_60px_rgba(249,115,22,0.1)] group">
              <Package className="w-10 h-10 text-orange-500 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700" />
           </div>
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                 <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.5em] opacity-80">Registry v12.0</span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                MALLA DE <span className="text-orange-500">ACTIVOS</span>
              </h1>
           </div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            <div className="group flex items-center bg-black/40 rounded-[2rem] border border-white/10 focus-within:border-orange-500/30 transition-all overflow-hidden w-full sm:w-96 shadow-2xl px-2">
              <div className="w-12 h-14 flex items-center justify-center text-gray-500 group-focus-within:text-orange-500 transition-colors pl-2">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder="Identificar Activo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:ring-0 px-4 py-4 text-white text-sm w-full outline-none font-bold placeholder:font-black placeholder:uppercase placeholder:tracking-widest placeholder:text-[9px] placeholder:text-gray-700"
              />
            </div>
           
            <button 
              onClick={openNew}
              className="group relative flex items-center gap-4 px-8 py-4 rounded-[2rem] bg-orange-500/10 border border-orange-500/20 text-orange-500 hover:border-orange-500 hover:bg-orange-500/20 hover:shadow-[0_0_40px_rgba(249,115,22,0.3)] transition-all duration-500 overflow-hidden shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 -translate-x-[100%] group-hover:animate-scan" />
              <div className="flex flex-col items-start pr-4 border-r border-orange-500/20 group-hover:border-orange-500/50 transition-colors">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">INYECTAR</span>
                <span className="text-[8px] font-bold text-orange-500/80 uppercase tracking-widest mt-0.5">Nuevo Nodo</span>
              </div>
              <div className="flex items-center gap-2">
                <Plus className="w-6 h-6 group-hover:scale-125 group-hover:rotate-90 transition-transform duration-500" />
              </div>
            </button>
        </div>
      </div>

      {/* Global Metrics - Ultra-Sleek */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Unidades Activas', value: initialProducts.length, icon: Box, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Nodos Online', value: initialProducts.filter(p => p.active).length, icon: ToggleRight, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Grupos Lógicos', value: categories.length, icon: Layers, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Capital Registrado', value: `Bs. ${initialProducts.reduce((acc, p) => acc + p.price, 0).toLocaleString()}`, icon: Tag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-modern p-6 rounded-[2.5rem] border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 opacity-30`} />
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center border border-white/5 group-hover:rotate-12 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[7px] font-black text-gray-600 uppercase tracking-[0.3em] mb-1">{stat.label}</p>
                <p className={`text-xl font-black ${stat.color} italic tracking-tighter`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Products Grid - BIOMETRIC VIEW v12.0 */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {filteredProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-[4rem] opacity-30">
             <Package className="w-20 h-20 text-gray-700 mb-6 animate-pulse" />
             <p className="text-[12px] font-black uppercase tracking-[0.8em]">Vacío Dimensional</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className={`glass-modern p-6 rounded-[2.5rem] border-white/5 hover:border-orange-500/20 hover:shadow-[0_0_30px_rgba(249,115,22,0.05)] transition-all duration-500 group relative flex flex-col gap-6 ${
                  !product.active ? 'opacity-40 grayscale' : ''
                }`}
              >
                  {/* Subtle Background Glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-orange-500/[0.02] rounded-full blur-[80px] pointer-events-none group-hover:bg-orange-500/[0.05] transition-all" />

                  <div className="flex items-start gap-5 relative z-10">
                     <div className="w-20 h-20 rounded-[1.5rem] bg-black/60 border border-white/10 flex items-center justify-center shadow-2xl shrink-0 overflow-hidden group-hover:scale-[1.03] transition-transform duration-500">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-8 h-8 text-gray-800 opacity-50 group-hover:text-orange-500/50 transition-colors" />
                        )}
                        {!product.active && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                             <span className="text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">Offline</span>
                          </div>
                        )}
                     </div>

                     <div className="flex-1 min-w-0 pt-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                           <span 
                             className="px-2.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border border-white/10 shadow-lg"
                             style={{ backgroundColor: `${product.category?.color}15`, color: product.category?.color }}
                           >
                             {product.category?.name || 'GNR'}
                           </span>
                           <span className="px-2.5 py-0.5 rounded-md text-[7px] font-black text-gray-500 uppercase tracking-widest border border-white/5 bg-white/5">
                             ID-{product.id.slice(0, 4)}
                           </span>
                        </div>
                        <h3 className="text-lg font-black text-white tracking-tight uppercase truncate leading-tight mb-2 group-hover:text-orange-500 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs font-black text-orange-500 italic tracking-tighter">Bs. {product.price.toFixed(2)}</p>
                     </div>
                  </div>
                  
                  {/* Footer & Actions */}
                  <div className="pt-5 border-t border-white/[0.03] flex items-end justify-between relative z-10">
                     <div className="flex-1 pr-4">
                        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest line-clamp-2 leading-relaxed">
                           {product.description || 'Sin datos telemetritos descriptivos disponibles en registro.'}
                        </p>
                     </div>
                     <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => openEdit(product)}
                          className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-orange-500 hover:border-orange-500 transition-all active:scale-90"
                        >
                           <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all active:scale-90"
                        >
                           {deleting === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                     </div>
                  </div>
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
