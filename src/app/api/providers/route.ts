import { db } from '@/lib/db'
import { providers, providerAccounts, providerHealth } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const allProviders = await db.select().from(providers)
    const allAccounts = await db.select().from(providerAccounts)
    const allHealth = await db.select().from(providerHealth)

    const result = allProviders.map((p) => ({
      ...p,
      accounts: allAccounts.filter((a) => a.providerId === p.id),
      health: allHealth.find((h) => h.providerId === p.id) || null,
    }))

    return Response.json({ providers: result })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, name, prefix, type, config, enabled, priority } = body

    if (!id || !name || !prefix || !type) {
      return Response.json({ error: 'id, name, prefix, type are required' }, { status: 400 })
    }

    await db.insert(providers).values({
      id,
      name,
      prefix,
      type,
      config: config || '{}',
      enabled: enabled ?? true,
      priority: priority ?? 0,
    })

    return Response.json({ success: true, id })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
