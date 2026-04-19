import { getProducts, getCategories } from '@/lib/actions/products'
import ProductsClient from '@/components/products/ProductsClient'

export const dynamic = 'force-dynamic'

export default async function ProductosPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ])

  return <ProductsClient products={products} categories={categories ?? []} />
}
