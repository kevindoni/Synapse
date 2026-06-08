import { memoryStore } from '@/lib/memory'

export async function GET() {
  try {
    const stats = await memoryStore.getStats()
    return Response.json({ stats })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
