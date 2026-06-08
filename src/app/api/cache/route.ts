import { semanticCacheStore } from '@/lib/cache'

export async function GET() {
  try {
    const stats = await semanticCacheStore.getStats()
    return Response.json({ stats })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await semanticCacheStore.clear()
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
