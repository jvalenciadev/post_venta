'use client'

import { useState } from 'react'
import { createProduct, updateProduct, createCategory } from '@/lib/actions/products'
import type { Product, Category } from '@/types/database'
import {
  X,
  Save,
  Plus,
  Package,
  Upload,
  Tag,
  Hash,
  Layers,
  Sparkles,
  Loader2,
  Trash2,
  Image as ImageIcon
} from 'lucide-react'

export default function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product?: Product | null
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCatForm, setShowCatForm] = useState(false)
  const [catName, setCatName] = useState('')
  const [catDescription, setCatDescription] = useState('')
  const [catColor, setCatColor] = useState('#f97316')
  const [catLoading, setCatLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = product
      ? await updateProduct(product.id, formData)
      : await createProduct(formData)

    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      onSaved()
      onClose()
    }
  }

  async function handleCreateCategory() {
    if (!catName.trim()) return
    setCatLoading(true)
    const result = await createCategory(catName, catColor, catDescription)
    setCatLoading(false)
    if (!result?.error) {
      setShowCatForm(false)
      setCatName('')
      setCatDescription('')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Side Panel Container - V11.9 ULTRA-COMPACT */}
      <div className="relative w-full max-w-md h-full bg-[#0a0a0a]/95 border-l border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-500">

        {/* Subtle Decorative Mesh */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-orange-500/[0.03] rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />

        {/* Slim Header */}
        <div className="relative z-10 p-6 flex items-center justify-between border-b border-white/[0.03] bg-black/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">
                {product ? 'Editar' : 'Nuevo'} <span className="text-orange-500">Nodo</span>
              </h3>
              <p className="text-[7px] font-black text-gray-500 uppercase tracking-[0.3em] mt-1">
                Registry Update Entry
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dense Form Body */}
        <form id="product-form" onSubmit={handleSubmit} className="relative z-10 flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          {/* Image Upload Area - Compact */}
          <div className="space-y-2">
            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest pl-1">Perfil Visual</label>
            <div className="relative group h-28 flex items-center justify-center border border-dashed border-white/10 rounded-2xl hover:border-orange-500/50 hover:bg-orange-500/5 transition-all cursor-pointer overflow-hidden">
              {product?.image_url && (
                <div className="absolute inset-0 opacity-20 filter blur-sm">
                  <img src={product.image_url} alt="Current" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <ImageIcon className="w-5 h-5 text-gray-600 group-hover:text-orange-500" />
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Cargar Imagen</p>
              </div>
              <input type="file" name="image" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <input type="hidden" name="current_image_url" value={product?.image_url || ''} />
          </div>

          <div className="space-y-4">
            {/* Product Name */}
            <div className="space-y-2">
              <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest pl-1">Identificación</label>
              <div className="group flex items-center bg-white/5 rounded-2xl border border-white/10 focus-within:border-orange-500/30 transition-all overflow-hidden">
                <div className="w-12 h-12 flex items-center justify-center border-r border-white/5 text-gray-700 group-focus-within:text-orange-500 transition-colors">
                  <Tag className="w-4 h-4" />
                </div>
                <input
                  name="name"
                  required
                  defaultValue={product?.name}
                  placeholder="NOMBRE DEL ACTIVO"
                  className="bg-transparent border-none focus:ring-0 px-5 py-3 text-white text-xs w-full"
                />
              </div>
            </div>

            {/* Product Price */}
            <div className="space-y-2">
              <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest pl-1">Valoración (Bs.)</label>
              <div className="group flex items-center bg-white/5 rounded-2xl border border-white/10 focus-within:border-orange-500/30 transition-all overflow-hidden">
                <div className="w-14 h-12 flex items-center justify-center border-r border-white/5 text-[10px] font-black text-gray-700 group-focus-within:text-orange-500 transition-colors">
                  Bs.
                </div>
                <input
                  name="price"
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  defaultValue={product?.price}
                  placeholder="0.00"
                  className="bg-transparent border-none focus:ring-0 px-5 py-3 text-white text-sm font-black italic w-full"
                />
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Categoría</label>
                <button
                  type="button"
                  onClick={() => setShowCatForm(!showCatForm)}
                  className="text-[7px] font-black text-orange-500 uppercase flex items-center gap-1"
                >
                  <Plus className="w-2.5 h-2.5" /> Nueva
                </button>
              </div>

              {showCatForm && (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3 animate-in fade-in transition-all">
                  <input
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="Nombre..."
                    className="input-v10 text-[10px] py-2"
                  />
                  <input
                    value={catDescription}
                    onChange={(e) => setCatDescription(e.target.value)}
                    placeholder="Descripción (opcional)..."
                    className="input-v10 text-[10px] py-2"
                  />
                  <div className="flex items-center gap-3">
                    <input type="color" value={catColor} onChange={(e) => setCatColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0" />
                    <button type="button" onClick={handleCreateCategory} disabled={catLoading} className="flex-1 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[8px] font-black uppercase">
                      {catLoading ? '...' : 'Inyectar'}
                    </button>
                  </div>
                </div>
              )}

              <select name="category_id" defaultValue={product?.category_id ?? ''} className="input-v10 py-3 text-xs appearance-none">
                <option value="" className="bg-[#0a0a0a]">GENERAL SELECTION</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#0a0a0a] uppercase">{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Status Toggle */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Estado Activo</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="active" value="true" defaultChecked={product?.active ?? true} className="sr-only peer" />
                <div className="w-10 h-5 bg-white/5 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-700 after:rounded-full after:h-4 after:w-4 after:transition-all" />
              </label>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest pl-1">Descripción Técnica</label>
              <textarea
                name="description"
                defaultValue={product?.description ?? ''}
                placeholder="Entrada de metadatos..."
                rows={3}
                className="input-v10 py-3 text-xs resize-none h-24"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-[8px] font-black text-red-500 uppercase tracking-widest">{error}</p>
            </div>
          )}
        </form>

        {/* Slim Footer */}
        <div className="relative z-10 p-6 border-t border-white/[0.03] bg-black/40 flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 py-4 rounded-xl bg-white/5 text-gray-500 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all">
            Cancelar
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={loading}
            className="flex-1 py-4 rounded-xl bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Sincronizar
          </button>
        </div>
      </div>
    </div>
  )
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}
