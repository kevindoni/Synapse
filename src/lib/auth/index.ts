import { SignJWT, jwtVerify } from 'jose'
import { db } from '../db'
import { apiKeys } from '../db/schema'
import { eq } from 'drizzle-orm'
import { createHash, randomBytes } from 'crypto'

const JWT_ALG = 'HS256'

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'synapse-default-secret-change-me-in-production'
  return new TextEncoder().encode(secret)
}

export async function signJwt(payload: {
  sub: string
  role: string
  name?: string
}): Promise<string> {
  return new SignJWT({ role: payload.role, name: payload.name })
    .setProtectedHeader({ alg: JWT_ALG })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('7d')
    .setIssuer('synapse')
    .sign(getSecret())
}

export async function verifyJwt(token: string): Promise<{
  sub: string
  role: string
  name?: string
} | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { issuer: 'synapse' })
    return {
      sub: payload.sub as string,
      role: (payload as Record<string, unknown>).role as string,
      name: (payload as Record<string, unknown>).name as string | undefined,
    }
  } catch {
    return null
  }
}

export async function hashApiKey(key: string): Promise<string> {
  return createHash('sha256').update(key).digest('hex')
}

export async function generateApiKey(name: string): Promise<{ id: string; key: string }> {
  const rawKey = `adn_${randomBytes(32).toString('hex')}`
  const keyHash = await hashApiKey(rawKey)
  const id = crypto.randomUUID()

  await db.insert(apiKeys).values({
    id,
    name,
    keyHash,
    permissions: '{}',
  })

  return { id, key: rawKey }
}

export async function validateApiKey(key: string): Promise<{
  valid: boolean
  id?: string
  name?: string
}> {
  if (!key) return { valid: false }

  const keyHash = await hashApiKey(key)

  try {
    const rows = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, keyHash)).limit(1)
    if (rows.length === 0) return { valid: false }

    await db.update(apiKeys).set({
      lastUsedAt: new Date().toISOString(),
    }).where(eq(apiKeys.id, rows[0].id))

    return { valid: true, id: rows[0].id, name: rows[0].name }
  } catch {
    return { valid: false }
  }
}

export async function listApiKeys() {
  try {
    const allKeys = await db.select().from(apiKeys)
    return allKeys.map((k) => ({
      id: k.id,
      name: k.name,
      keyPrefix: `adn_****${k.keyHash.slice(-4)}`,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
      requestCount: 0,
    }))
  } catch {
    return []
  }
}

export async function revokeApiKey(id: string) {
  await db.delete(apiKeys).where(eq(apiKeys.id, id))
}
