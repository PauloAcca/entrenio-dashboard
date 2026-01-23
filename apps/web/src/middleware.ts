import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  const publicRoutes = ['/login', '/gimnasios']
  
  const isPublicRoute = pathname === '/' || publicRoutes.some(route => pathname.startsWith(route))

  if (!token && !isPublicRoute) {
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
      return NextResponse.next()
    }
    
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
