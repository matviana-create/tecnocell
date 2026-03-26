import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'tecnocell-one.vercel.app'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  // Não intercepta rotas do admin, API ou arquivos estáticos
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Se for domínio customizado (não é o root domain), injeta o hostname no header
  if (hostname !== ROOT_DOMAIN && !hostname.includes('localhost')) {
    const response = NextResponse.next()
    response.headers.set('x-hostname', hostname)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
