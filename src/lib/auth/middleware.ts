import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJwt, validateApiKey } from '../auth'

export async function authenticateRequest(request: NextRequest): Promise<{
  authenticated: boolean
  userId?: string
  role?: string
  authMethod?: 'jwt' | 'api_key' | 'none'
}> {
  if (request.nextUrl.pathname.startsWith('/api/v1/')) {
    return checkGatewayAuth(request)
  }

  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    return { authenticated: true, authMethod: 'none' }
  }

  return { authenticated: true, authMethod: 'none' }
}

async function checkGatewayAuth(request: NextRequest): Promise<{
  authenticated: boolean
  userId?: string
  role?: string
  authMethod?: 'jwt' | 'api_key' | 'none'
}> {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)

    if (token.startsWith('adn_')) {
      const result = await validateApiKey(token)
      if (result.valid) {
        return { authenticated: true, userId: result.id, role: 'api_user', authMethod: 'api_key' }
      }
    }

    const jwtResult = await verifyJwt(token)
    if (jwtResult) {
      return { authenticated: true, userId: jwtResult.sub, role: jwtResult.role, authMethod: 'jwt' }
    }

    return { authenticated: false }
  }

  const apiKeyHeader = request.headers.get('x-api-key')
  if (apiKeyHeader) {
    const result = await validateApiKey(apiKeyHeader)
    if (result.valid) {
      return { authenticated: true, userId: result.id, role: 'api_user', authMethod: 'api_key' }
    }
    return { authenticated: false }
  }

  return { authenticated: true, authMethod: 'none' }
}

export function unauthenticatedResponse() {
  return NextResponse.json(
    { error: { type: 'authentication_error', message: 'Invalid or missing authentication' } },
    { status: 401 },
  )
}
