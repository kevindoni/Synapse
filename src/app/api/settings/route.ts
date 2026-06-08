import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const allSettings = await db.select().from(settings)
    const config: Record<string, string> = {}
    for (const s of allSettings) {
      config[s.key] = s.value
    }
    return Response.json({ settings: config })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        await db.insert(settings).values({ key, value }).onConflictDoUpdate({
          target: settings.key,
          set: { value, updatedAt: new Date().toISOString() },
        })
      }
    }
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
