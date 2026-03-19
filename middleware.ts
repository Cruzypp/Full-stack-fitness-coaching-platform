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

  // ── Proteger /admin/* ──────────────────────────────
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // No hay sesión → manda a login
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user.user_metadata?.role?.toLowerCase() !== 'admin') {
      // Tiene sesión pero no es admin → manda a pricing
      return NextResponse.redirect(new URL('/pricing', request.url))
    }
  }

  // ── Proteger /mis-cargas ───────────────────────────────
  if (request.nextUrl.pathname.startsWith('/mis-cargas')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?redirect=/mis-cargas', request.url))
    }
  }

  // ── Si ya tiene sesión y va a /login → manda a admin ──
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/admin/promos', request.url))
  }

  return supabaseResponse
}

// Solo se ejecuta en estas rutas
export const config = {
  matcher: ['/admin/:path*', '/login', '/mis-cargas/:path*', '/mis-cargas'],
}