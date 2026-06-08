import { db } from '@/lib/db'
import { models } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const allModels = await db.select().from(models)
    return Response.json({ models: allModels })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, providerId, name, displayName, pricingTier, costPer1mInput, costPer1mOutput, contextWindow, capabilities } = body

    if (!id || !providerId || !name) {
      return Response.json({ error: 'id, providerId, name are required' }, { status: 400 })
    }

    await db.insert(models).values({
      id,
      providerId,
      name,
      displayName: displayName || null,
      pricingTier: pricingTier || null,
      costPer1mInput: costPer1mInput ?? null,
      costPer1mOutput: costPer1mOutput ?? null,
      contextWindow: contextWindow ?? null,
      capabilities: capabilities ? JSON.stringify(capabilities) : '[]',
    })

    return Response.json({ success: true, id })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
