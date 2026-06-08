import { db } from '../db'
import { requestLogs, usageDaily, providerHealth } from '../db/schema'
import { sql, desc, and, gte } from 'drizzle-orm'
import { logger } from '../utils/logger'

export interface UsageStats {
  totalRequests: number
  totalInputTokens: number
  totalOutputTokens: number
  totalTokensSaved: number
  totalCost: number
  totalErrors: number
  totalFallbacks: number
  totalCacheHits: number
  avgLatencyMs: number
  cacheHitRate: number
  errorRate: number
  fallbackRate: number
}

export interface TimeSeriesPoint {
  date: string
  requests: number
  tokens: number
  cost: number
}

class AnalyticsAggregator {
  async getUsageStats(days = 7): Promise<UsageStats> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const [stats] = await db.select({
        totalRequests: sql<number>`coalesce(sum(${usageDaily.totalRequests}), 0)`,
        totalInputTokens: sql<number>`coalesce(sum(${usageDaily.totalInputTokens}), 0)`,
        totalOutputTokens: sql<number>`coalesce(sum(${usageDaily.totalOutputTokens}), 0)`,
        totalTokensSaved: sql<number>`coalesce(sum(${usageDaily.totalTokensSaved}), 0)`,
        totalCost: sql<number>`coalesce(sum(${usageDaily.totalCost}), 0)`,
        totalErrors: sql<number>`coalesce(sum(${usageDaily.totalErrors}), 0)`,
        totalFallbacks: sql<number>`coalesce(sum(${usageDaily.totalFallbacks}), 0)`,
        totalCacheHits: sql<number>`coalesce(sum(${usageDaily.totalCacheHits}), 0)`,
      }).from(usageDaily).where(gte(usageDaily.date, since))

      const total = stats?.totalRequests ?? 0
      const hits = stats?.totalCacheHits ?? 0
      const errors = stats?.totalErrors ?? 0
      const fallbacks = stats?.totalFallbacks ?? 0

      const [latency] = await db.select({
        avg: sql<number>`coalesce(avg(${requestLogs.latencyMs}), 0)`,
      }).from(requestLogs).where(sql`${requestLogs.createdAt} >= ${since}`)

      return {
        totalRequests: total,
        totalInputTokens: stats?.totalInputTokens ?? 0,
        totalOutputTokens: stats?.totalOutputTokens ?? 0,
        totalTokensSaved: stats?.totalTokensSaved ?? 0,
        totalCost: Number(stats?.totalCost ?? 0),
        totalErrors: errors,
        totalFallbacks: fallbacks,
        totalCacheHits: hits,
        avgLatencyMs: Math.round(Number(latency?.avg ?? 0)),
        cacheHitRate: total > 0 ? hits / total : 0,
        errorRate: total > 0 ? errors / total : 0,
        fallbackRate: total > 0 ? fallbacks / total : 0,
      }
    } catch {
      return {
        totalRequests: 0, totalInputTokens: 0, totalOutputTokens: 0,
        totalTokensSaved: 0, totalCost: 0, totalErrors: 0,
        totalFallbacks: 0, totalCacheHits: 0, avgLatencyMs: 0,
        cacheHitRate: 0, errorRate: 0, fallbackRate: 0,
      }
    }
  }

  async getUsageTimeSeries(days = 30): Promise<TimeSeriesPoint[]> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const rows = await db.select({
        date: usageDaily.date,
        requests: sql<number>`coalesce(sum(${usageDaily.totalRequests}), 0)`,
        tokens: sql<number>`coalesce(sum(${usageDaily.totalInputTokens} + ${usageDaily.totalOutputTokens}), 0)`,
        cost: sql<number>`coalesce(sum(${usageDaily.totalCost}), 0)`,
      }).from(usageDaily).where(gte(usageDaily.date, since)).groupBy(usageDaily.date).orderBy(usageDaily.date)

      return rows.map((r) => ({
        date: r.date,
        requests: r.requests,
        tokens: r.tokens,
        cost: Number(r.cost),
      }))
    } catch {
      return []
    }
  }

  async getProviderPerformance() {
    try {
      const health = await db.select().from(providerHealth)
      return health.map((h) => ({
        providerId: h.providerId,
        status: h.status,
        avgLatencyMs: h.avgLatencyMs,
        p95LatencyMs: h.p95LatencyMs,
        errorRate: h.errorRate,
        successRate: h.successRate,
        consecutiveFailures: h.consecutiveFailures,
      }))
    } catch {
      return []
    }
  }

  async getTopModels(limit = 10) {
    try {
      const rows = await db.select({
        model: requestLogs.model,
        count: sql<number>`count(*)`,
        totalTokens: sql<number>`coalesce(sum(${requestLogs.inputTokens} + ${requestLogs.outputTokens}), 0)`,
        totalCost: sql<number>`coalesce(sum(${requestLogs.cost}), 0)`,
        avgLatency: sql<number>`coalesce(avg(${requestLogs.latencyMs}), 0)`,
      }).from(requestLogs)
        .groupBy(requestLogs.model)
        .orderBy(desc(sql`count(*)`))
        .limit(limit)

      return rows.map((r) => ({
        model: r.model,
        requests: r.count,
        tokens: r.totalTokens,
        cost: Number(r.totalCost),
        avgLatency: Math.round(Number(r.avgLatency)),
      }))
    } catch {
      return []
    }
  }

  async recordDailyUsage(data: {
    date: string
    providerId?: string
    model?: string
    requests?: number
    inputTokens?: number
    outputTokens?: number
    tokensSaved?: number
    cost?: number
    errors?: number
    fallbacks?: number
    cacheHits?: number
  }) {
    try {
      await db.insert(usageDaily).values({
        id: crypto.randomUUID(),
        date: data.date,
        providerId: data.providerId || null,
        model: data.model || null,
        totalRequests: data.requests || 0,
        totalInputTokens: data.inputTokens || 0,
        totalOutputTokens: data.outputTokens || 0,
        totalTokensSaved: data.tokensSaved || 0,
        totalCost: data.cost || 0,
        totalErrors: data.errors || 0,
        totalFallbacks: data.fallbacks || 0,
        totalCacheHits: data.cacheHits || 0,
      }).onConflictDoUpdate({
        target: [usageDaily.date, usageDaily.providerId, usageDaily.model],
        set: {
          totalRequests: sql`${usageDaily.totalRequests} + ${data.requests || 0}`,
          totalInputTokens: sql`${usageDaily.totalInputTokens} + ${data.inputTokens || 0}`,
          totalOutputTokens: sql`${usageDaily.totalOutputTokens} + ${data.outputTokens || 0}`,
          totalTokensSaved: sql`${usageDaily.totalTokensSaved} + ${data.tokensSaved || 0}`,
          totalCost: sql`${usageDaily.totalCost} + ${data.cost || 0}`,
          totalErrors: sql`${usageDaily.totalErrors} + ${data.errors || 0}`,
          totalFallbacks: sql`${usageDaily.totalFallbacks} + ${data.fallbacks || 0}`,
          totalCacheHits: sql`${usageDaily.totalCacheHits} + ${data.cacheHits || 0}`,
        },
      })
    } catch (err) {
      logger.warn({ error: (err as Error).message }, 'Failed to record daily usage')
    }
  }
}

export const analytics = new AnalyticsAggregator()
