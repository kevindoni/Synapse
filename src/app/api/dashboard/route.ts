import { db } from '@/lib/db'
import { requestLogs, providers, providerHealth, usageDaily } from '@/lib/db/schema'
import { desc, sql } from 'drizzle-orm'

export async function GET() {
  try {
    const [totalRequests] = await db.select({ count: sql<number>`count(*)` }).from(requestLogs)
    const [todayUsage] = await db.select({
      totalTokens: sql<number>`coalesce(sum(${usageDaily.totalInputTokens} + ${usageDaily.totalOutputTokens}), 0)`,
      totalCost: sql<number>`coalesce(sum(${usageDaily.totalCost}), 0)`,
    }).from(usageDaily).where(sql`${usageDaily.date} = date('now')`)

    const recentRequests = await db.select().from(requestLogs).orderBy(desc(requestLogs.createdAt)).limit(20)
    const allProviders = await db.select().from(providers)
    const allHealth = await db.select().from(providerHealth)

    const [cacheHits] = await db.select({ count: sql<number>`coalesce(sum(${requestLogs.cached}), 0)` }).from(requestLogs)

    return Response.json({
      stats: {
        totalRequests: totalRequests?.count ?? 0,
        todayTokens: todayUsage?.totalTokens ?? 0,
        todayCost: Number(todayUsage?.totalCost ?? 0),
        cacheHits: cacheHits?.count ?? 0,
      },
      recentRequests,
      providers: allProviders.map((p) => ({
        ...p,
        health: allHealth.find((h) => h.providerId === p.id) || null,
      })),
    })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
