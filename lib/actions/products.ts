'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type { Product } from '@/types/database'

export async function getProducts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('name')

  if (error) throw error
  return data as Product[]
}

export async function getActiveProducts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('name')

  if (error) throw error
  return data as Product[]
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  let image_url: string | null = null
  const imageFile = formData.get('image') as File

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, imageFile)

    if (uploadError) return { error: `Error subiendo imagen: ${uploadError.message}` }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)
    
    image_url = publicUrl
  }

  const product = {
    name: formData.get('name') as string,
    description: formData.get('description') as string || null,
    price: parseFloat(formData.get('price') as string),
    category_id: formData.get('category_id') as string || null,
    active: formData.get('active') === 'true',
    image_url,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase.from('products').insert(product)

  if (error) return { error: error.message }

  revalidatePath('/productos')
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()

  let image_url = formData.get('current_image_url') as string | null
  const imageFile = formData.get('image') as File

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, imageFile)

    if (uploadError) return { error: `Error subiendo imagen: ${uploadError.message}` }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)
    
    image_url = publicUrl
  }

  const product = {
    name: formData.get('name') as string,
    description: formData.get('description') as string || null,
    price: parseFloat(formData.get('price') as string),
    category_id: formData.get('category_id') as string || null,
    active: formData.get('active') === 'true',
    image_url,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/productos')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/productos')
  return { success: true }
}

export async function getCategories() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function createCategory(name: string, color: string, description?: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .insert({ 
      name, 
      color, 
      description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

  if (error) return { error: error.message }

  revalidatePath('/productos')
  return { success: true }
}
