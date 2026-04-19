'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * SENIOR CORE: User Management Server Actions
 * Handles all profile-related CRUD operations with revalidation
 */

export async function createUserProfile(formData: {
  full_name: string;
  email: string;
  role: 'admin' | 'cajero' | 'cocinero' | 'mesero' | 'reportes' | 'gastos';
  password?: string;
}) {
  const adminClient = await createAdminClient()

  // 1. Crear el usuario en auth.users si hay password
  let authId: string | undefined = undefined
  if (formData.password) {
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: { full_name: formData.full_name, role: formData.role }
    })
    
    if (authError) return { error: `Error Auth: ${authError.message}` }
    authId = authUser.user.id
  }

  // 2. Sincronizar con la tabla profiles
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      id: authId, // Si se creó en auth, usamos el mismo ID
      full_name: formData.full_name,
      email: formData.email,
      role: formData.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()

  if (error) return { error: error.message }
  
  revalidatePath('/usuarios')
  return { success: true, data }
}

export async function adminUpdatePassword(userId: string, newPassword: string) {
  const adminClient = await createAdminClient()
  
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    password: newPassword
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateUserRole(userId: string, newRole: 'admin' | 'cajero' | 'cocinero' | 'mesero' | 'reportes' | 'gastos') {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/usuarios')
  return { success: true }
}

export async function deleteUserProfile(userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/usuarios')
  return { success: true }
}

export async function resetUserPassword(userId: string) {
  const supabase = await createClient()
  
  // High-level: Trigger a password reset email from the server
  // This is the most secure way for an admin to handle password resets.
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()

  if (!profile?.email) return { error: 'Email de usuario no encontrado' }

  const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  })

  if (error) return { error: error.message }
  return { success: true }
}
