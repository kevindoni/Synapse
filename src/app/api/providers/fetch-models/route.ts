import { registry } from '@/lib/providers/registry'
import { db } from '@/lib/db'
import { models } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    const { providerId } = await request.json()
    if (!providerId) {
      return Response.json({ error: 'providerId is required' }, { status: 400 })
    }

    const adapters = registry.list()
    const adapter = adapters.find((a) => a.info.id === providerId)
    if (!adapter) {
      return Response.json({ error: `Provider not found: ${providerId}` }, { status: 404 })
    }

    const fetchedModels = await adapter.fetchModels()

    let upserted = 0
    for (const m of fetchedModels) {
      const modelId = m.id.includes('/') ? m.id : `${adapter.info.prefix}${m.id}`
      try {
        await db.insert(models).values({
          id: modelId,
          providerId: adapter.info.id,
          name: m.name,
          displayName: m.displayName || null,
          pricingTier: m.pricingTier || null,
          costPer1mInput: m.costPer1mInput ?? null,
          costPer1mOutput: m.costPer1mOutput ?? null,
          contextWindow: m.contextWindow ?? null,
          capabilities: m.capabilities ? JSON.stringify(m.capabilities) : '[]',
          available: m.available,
        }).onConflictDoUpdate({
          target: models.id,
          set: {
            displayName: m.displayName || null,
            available: m.available,
            lastCheckedAt: new Date().toISOString(),
          },
        })
        upserted++
      } catch {}
    }

    return Response.json({ success: true, fetched: fetchedModels.length, upserted })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
