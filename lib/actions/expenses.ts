'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Expense } from '@/types/database'

/**
 * SENIOR CORE: Expenses Management Server Actions
 */

export async function getExpenses() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }
  return { data: data as Expense[] }
}

export async function createExpense(formData: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('expenses')
    .insert([formData])
    .select()

  if (error) return { error: error.message }
  
  revalidatePath('/gastos')
  return { success: true, data }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/gastos')
  return { success: true }
}

export async function getExpenseStats() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('expenses')
    .select('person_name, amount')

  if (error) return { error: error.message }

  const stats = (data || []).reduce((acc: Record<string, number>, curr) => {
    const person = curr.person_name || 'Otros'
    acc[person] = (acc[person] || 0) + Number(curr.amount)
    return acc
  }, {})

  const totalGeneral = Object.values(stats).reduce((a, b) => a + b, 0)

  return { 
    stats: Object.entries(stats).map(([name, amount]) => ({ name, amount })),
    totalGeneral 
  }
}
