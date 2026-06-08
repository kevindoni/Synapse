import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000
const MAX_REQUESTS = 100

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return handleApiMiddleware(request)
  }
  return NextResponse.next()
}

function handleApiMiddleware(request: NextRequest) {
  const headers = new Headers()

  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
  headers.set('Access-Control-Max-Age', '86400')

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers })
  }

  headers.set('X-Request-Id', crypto.randomUUID())

  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const key = `${clientIp}:${request.nextUrl.pathname}`
  const now = Date.now()

  const entry = rateLimitMap.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + WINDOW_MS })
  } else {
    entry.count++
    if (entry.count > MAX_REQUESTS) {
      headers.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)))
      return NextResponse.json(
        { error: { type: 'rate_limit_exceeded', message: 'Too many requests' } },
        { status: 429, headers },
      )
    }
  }

  headers.set('X-RateLimit-Limit', String(MAX_REQUESTS))
  headers.set('X-RateLimit-Remaining', String(Math.max(0, MAX_REQUESTS - (entry?.count || 1))))

  const response = NextResponse.next()
  for (const [k, v] of headers.entries()) {
    response.headers.set(k, v)
  }

  return response
}

export const config = {
  matcher: ['/api/:path*'],
}
