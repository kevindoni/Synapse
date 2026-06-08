import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { signJwt, verifyJwt, generateApiKey, listApiKeys, revokeApiKey } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    const expected = process.env.SYNAPSE_PASSWORD || 'changeme'

    if (password !== expected) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const token = await signJwt({
      sub: 'admin',
      role: 'admin',
      name: 'Admin',
    })

    return NextResponse.json({ token, user: { id: 'admin', role: 'admin', name: 'Admin' } })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyJwt(authHeader.slice(7))
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    return NextResponse.json({ user: { id: payload.sub, role: payload.role, name: payload.name } })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
