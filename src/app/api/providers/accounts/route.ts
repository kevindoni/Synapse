import { db } from '@/lib/db'
import { providerAccounts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const providerId = url.searchParams.get('providerId')
    
    const accounts = providerId
      ? await db.select().from(providerAccounts).where(eq(providerAccounts.providerId, providerId))
      : await db.select().from(providerAccounts)

    return Response.json({
      accounts: accounts.map((a) => ({
        id: a.id,
        providerId: a.providerId,
        label: a.label,
        enabled: a.enabled,
        priority: a.priority,
        hasApiKey: !!(a.authData && a.authData !== '{}'),
        lastUsedAt: a.lastUsedAt,
        createdAt: a.createdAt,
      })),
    })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { providerId, label, apiKey, enabled, priority } = body

    if (!providerId || !apiKey) {
      return Response.json({ error: 'providerId and apiKey are required' }, { status: 400 })
    }

    const id = crypto.randomUUID()
    await db.insert(providerAccounts).values({
      id,
      providerId,
      label: label || null,
      authData: JSON.stringify({ apiKey }),
      enabled: enabled ?? true,
      priority: priority ?? 0,
    })

    return Response.json({ success: true, id })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, label, apiKey, enabled, priority } = body

    if (!id) {
      return Response.json({ error: 'id is required' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }
    if (label !== undefined) updates.label = label
    if (apiKey !== undefined) updates.authData = JSON.stringify({ apiKey })
    if (enabled !== undefined) updates.enabled = enabled
    if (priority !== undefined) updates.priority = priority

    await db.update(providerAccounts).set(updates).where(eq(providerAccounts.id, id))

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

    await db.delete(providerAccounts).where(eq(providerAccounts.id, id))
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
