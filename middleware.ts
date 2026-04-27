import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ── Proteger /admin/* ────────────────────────────────
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (user.user_metadata?.role?.toLowerCase() !== 'admin') {
      return NextResponse.redirect(new URL('/pricing', request.url))
    }
  }

  // ── Proteger /nutricion/* (excepto signup) ────────────
  if (
    request.nextUrl.pathname.startsWith('/nutricion') &&
    request.nextUrl.pathname !== '/nutricion/signup'
  ) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const role = user.user_metadata?.role?.toLowerCase()
    if (role !== 'admin' && role !== 'nutriologo') {
      return NextResponse.redirect(new URL('/pricing', request.url))
    }
  }

  // ── Proteger /mis-cargas ───────────────────────────────
  if (request.nextUrl.pathname.startsWith('/mis-cargas')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?redirect=/mis-cargas', request.url))
    }
  }

  // ── Si ya tiene sesión y va a /login → redirige según rol ──
  if (user && request.nextUrl.pathname === '/login') {
    const role = user.user_metadata?.role?.toLowerCase()
    const dest = role === 'nutriologo' ? '/nutricion' : '/admin/promos'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  return supabaseResponse
}

// Solo se ejecuta en estas rutas
export const config = {
  matcher: [
    '/admin/:path*',
    '/nutricion',
    '/nutricion/:path*',
    '/login',
    '/mis-cargas',
    '/mis-cargas/:path*',
  ],
}