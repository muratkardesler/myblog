import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { defaultLocale, locales } from './i18n.config'

// Geçerli dil kontrolü
function getValidLocale(pathname: string) {
  const segments = pathname.split('/')
  const langCode = segments[1]
  return locales.includes(langCode as any) ? langCode : defaultLocale
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // URL path kontrolü
  const pathname = req.nextUrl.pathname

  // Admin sayfalarını koruma
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    // Burada ileride admin rolü kontrolü de ekleyebiliriz
    // const { data: { user } } = await supabase.auth.getUser()
    // if (user?.role !== 'admin') { ... }
  }

  // Dil yönlendirmesi
  if (
    pathname === '/' || 
    (pathname.startsWith('/') && !pathname.startsWith(`/${defaultLocale}/`) && !pathname.startsWith('/admin'))
  ) {
    const locale = getValidLocale(pathname)
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname === '/' ? '' : pathname}`,
        req.url
      )
    )
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
} 