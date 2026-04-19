import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public routes
  const publicRoutes = ['/login', '/vista-clientes', '/forgot-password', '/reset-password']
  if (publicRoutes.includes(pathname)) {
    if (user && pathname === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Protected routes
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Fetch role for RBAC
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  const role = profile?.role
  // Handle singular /usuario redirect to plural /usuarios
  if (pathname === '/usuario') {
    const url = request.nextUrl.clone()
    url.pathname = '/usuarios'
    return NextResponse.redirect(url)
  }

  // Define route permissions
  const rolePermissions: Record<string, string[]> = {
    admin: ['/dashboard', '/pos', '/productos', '/reportes', '/cocina', '/usuarios', '/gastos'],
    cajero: ['/pos'],
    cocinero: ['/cocina'],
    mesero: ['/pos'],
    reportes: ['/reportes', '/dashboard'],
    gastos: ['/dashboard', '/gastos']
  }

  // Check if user has permission for the current path
  const allowedPaths = rolePermissions[role as keyof typeof rolePermissions] || []
  const isAuthorized = allowedPaths.some(p => pathname === p || pathname.startsWith(p + '/'))

  // Always allow / (root) to redirect to their default home
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    if (role === 'cajero' || role === 'mesero') url.pathname = '/pos'
    else if (role === 'cocinero') url.pathname = '/cocina'
    else if (role === 'reportes') url.pathname = '/reportes'
    else url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  if (!isAuthorized && !pathname.startsWith('/api/') && pathname !== '/login' && pathname !== '/vista-clientes') {
    const url = request.nextUrl.clone()
    // Automatic redirection to their "home"
    if (role === 'cajero' || role === 'mesero') url.pathname = '/pos'
    else if (role === 'cocinero') url.pathname = '/cocina'
    else if (role === 'reportes') url.pathname = '/reportes'
    else url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
