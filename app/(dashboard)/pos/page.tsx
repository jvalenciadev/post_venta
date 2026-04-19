import { getActiveProducts, getCategories } from '@/lib/actions/products'
import POSClient from '@/components/pos/POSClient'

export const dynamic = 'force-dynamic'

export default async function POSPage() {
  const [products, categories] = await Promise.all([
    getActiveProducts(),
    getCategories(),
  ])

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="py-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Punto de Venta</h1>
        <p className="text-gray-400 text-base font-medium opacity-80">Selecciona productos para iniciar una orden maestra</p>
      </div>

      <POSClient products={products} categories={categories ?? []} />
    </div>
  )
}
