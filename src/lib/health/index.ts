import { db } from '../db'
import { providerHealth, providers } from '../db/schema'
import { eq } from 'drizzle-orm'
import { registry } from '../providers/registry'
import { logger } from '../utils/logger'
import { v4 as uuid } from 'uuid'

interface HealthCheckResult {
  providerId: string
  status: 'healthy' | 'degraded' | 'down' | 'disabled'
  latencyMs: number
  timestamp: string
}

class HealthChecker {
  private intervalHandle: ReturnType<typeof setInterval> | null = null

  start(intervalMs = 5 * 60 * 1000) {
    if (this.intervalHandle) return

    logger.info({ intervalMinutes: intervalMs / 60000 }, 'Health checker started')

    this.intervalHandle = setInterval(async () => {
      try {
        await this.checkAll()
      } catch (err) {
        logger.error({ error: (err as Error).message }, 'Health check failed')
      }
    }, intervalMs)

    setTimeout(() => this.checkAll(), 10000)
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle)
      this.intervalHandle = null
      logger.info('Health checker stopped')
    }
  }

  async checkAll(): Promise<HealthCheckResult[]> {
    const adapters = registry.list()
    const results: HealthCheckResult[] = []

    for (const adapter of adapters) {
      try {
        const result = await adapter.healthCheck()
        await this.recordResult(adapter.info.id, result.status, result.latencyMs)
        results.push({
          providerId: adapter.info.id,
          status: result.status,
          latencyMs: result.latencyMs,
          timestamp: new Date().toISOString(),
        })
      } catch (err) {
        await this.recordResult(adapter.info.id, 'down', 0)
        results.push({
          providerId: adapter.info.id,
          status: 'down',
          latencyMs: 0,
          timestamp: new Date().toISOString(),
        })
        logger.warn({ provider: adapter.info.id, error: (err as Error).message }, 'Health check failed')
      }
    }

    return results
  }

  async checkProvider(providerId: string): Promise<HealthCheckResult | null> {
    const adapters = registry.list()
    const adapter = adapters.find((a) => a.info.id === providerId)
    if (!adapter) return null

    try {
      const result = await adapter.healthCheck()
      await this.recordResult(providerId, result.status, result.latencyMs)
      return {
        providerId,
        status: result.status,
        latencyMs: result.latencyMs,
        timestamp: new Date().toISOString(),
      }
    } catch {
      await this.recordResult(providerId, 'down', 0)
      return { providerId, status: 'down', latencyMs: 0, timestamp: new Date().toISOString() }
    }
  }

  private async recordResult(providerId: string, status: 'healthy' | 'degraded' | 'down' | 'disabled', latencyMs: number) {
    try {
      const existing = await db.select().from(providerHealth)
        .where(eq(providerHealth.providerId, providerId)).limit(1)

      const now = new Date().toISOString()

      if (existing.length > 0) {
        const row = existing[0]
        const consecutiveFailures = status === 'down'
          ? (row.consecutiveFailures || 0) + 1
          : 0

        const totalChecks = (row.successRate || 0) * 100 + 1
        const newSuccessRate = status === 'healthy'
          ? ((row.successRate || 0) * 100 + 1) / totalChecks
          : (row.successRate || 0) * 100 / totalChecks

        const totalLatencyChecks = 100
        const newAvgLatency = Math.round(
          ((row.avgLatencyMs || 0) * (totalLatencyChecks - 1) + latencyMs) / totalLatencyChecks
        )

        await db.update(providerHealth).set({
          status: status as 'healthy' | 'degraded' | 'down' | 'disabled',
          avgLatencyMs: newAvgLatency,
          errorRate: 1 - newSuccessRate,
          successRate: newSuccessRate,
          consecutiveFailures,
          lastCheckAt: now,
          ...(status === 'healthy' ? { lastSuccessAt: now } : {}),
          updatedAt: now,
        }).where(eq(providerHealth.id, row.id))
      } else {
        await db.insert(providerHealth).values({
          id: uuid(),
          providerId,
          status: status as 'healthy' | 'degraded' | 'down' | 'disabled',
          avgLatencyMs: latencyMs,
          p95LatencyMs: latencyMs,
          errorRate: status === 'healthy' ? 0 : 1,
          successRate: status === 'healthy' ? 1 : 0,
          consecutiveFailures: status === 'down' ? 1 : 0,
          lastCheckAt: now,
          lastSuccessAt: status === 'healthy' ? now : null,
          updatedAt: now,
        })
      }
    } catch (err) {
      logger.warn({ error: (err as Error).message }, 'Failed to record health result')
    }
  }

  async getProviderHealth(providerId?: string) {
    try {
      if (providerId) {
        const rows = await db.select().from(providerHealth)
          .where(eq(providerHealth.providerId, providerId)).limit(1)
        return rows[0] || null
      }
      return await db.select().from(providerHealth)
    } catch {
      return []
    }
  }
}

export const healthChecker = new HealthChecker()
