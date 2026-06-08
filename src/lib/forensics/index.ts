import { db } from '../db'
import { requestLogs } from '../db/schema'
import { eq, desc, sql, and } from 'drizzle-orm'
import type { NormalizedRequest, NormalizedResponse } from '../providers/types'
import { logger } from '../utils/logger'
import { v4 as uuid } from 'uuid'

export interface ForensicReport {
  requestId: string
  model: string
  provider: string
  inputTokens: number
  outputTokens: number
  tokensSaved: number
  cost: number
  latencyMs: number
  statusCode: number | null
  fallbackUsed: boolean
  cached: boolean
  skillId: string | null
  errorMessage: string | null
  timeline: TimelineEvent[]
  analysis: ForensicAnalysis
}

export interface TimelineEvent {
  timestamp: string
  event: string
  durationMs: number
  metadata?: Record<string, unknown>
}

export interface ForensicAnalysis {
  verdict: 'success' | 'degraded' | 'failure' | 'timeout' | 'rate_limited'
  rootCause?: string
  suggestions: string[]
  cacheHit: boolean
  fallbackTriggered: boolean
  latencyBreakdown: {
    total: number
    network: number
    provider: number
    overhead: number
  }
}

class ForensicsEngine {
  async analyzeRequest(requestId: string): Promise<ForensicReport | null> {
    try {
      const rows = await db.select().from(requestLogs)
        .where(eq(requestLogs.requestId, requestId))
        .limit(1)

      if (rows.length === 0) return null

      const row = rows[0]
      const analysis = this.analyze(row)

      return {
        requestId: row.requestId,
        model: row.model,
        provider: row.providerId || 'unknown',
        inputTokens: row.inputTokens || 0,
        outputTokens: row.outputTokens || 0,
        tokensSaved: row.tokensSaved || 0,
        cost: Number(row.cost || 0),
        latencyMs: row.latencyMs || 0,
        statusCode: row.statusCode,
        fallbackUsed: !!row.fallbackUsed,
        cached: !!row.cached,
        skillId: row.skillId || null,
        errorMessage: row.errorMessage,
        timeline: this.buildTimeline(row),
        analysis,
      }
    } catch (err) {
      logger.warn({ error: (err as Error).message }, 'Forensic analysis failed')
      return null
    }
  }

  async getRecentFailures(limit = 20) {
    try {
      return await db.select().from(requestLogs)
        .where(sql`${requestLogs.statusCode} >= 400 OR ${requestLogs.errorMessage} IS NOT NULL`)
        .orderBy(desc(requestLogs.createdAt))
        .limit(limit)
    } catch {
      return []
    }
  }

  async getSlowRequests(thresholdMs = 3000, limit = 20) {
    try {
      return await db.select().from(requestLogs)
        .where(sql`${requestLogs.latencyMs} > ${thresholdMs}`)
        .orderBy(desc(requestLogs.latencyMs))
        .limit(limit)
    } catch {
      return []
    }
  }

  private analyze(row: Record<string, unknown>): ForensicAnalysis {
    const statusCode = row.status_code as number | null
    const latencyMs = (row.latency_ms as number) || 0
    const errorMessage = row.error_message as string | null
    const cached = !!(row.cached as number)
    const fallbackUsed = !!(row.fallback_used as number)

    let verdict: ForensicAnalysis['verdict'] = 'success'
    const suggestions: string[] = []
    let rootCause: string | undefined

    if (statusCode && statusCode >= 500) {
      verdict = 'failure'
      rootCause = 'provider_error'
      suggestions.push('Check provider health status')
      suggestions.push('Review provider error logs')
    } else if (statusCode === 429) {
      verdict = 'rate_limited'
      rootCause = 'rate_limit'
      suggestions.push('Reduce request rate')
      suggestions.push('Add more provider accounts')
      suggestions.push('Enable request queuing')
    } else if (statusCode && statusCode >= 400) {
      verdict = 'failure'
      rootCause = 'client_error'
      suggestions.push('Review request format')
    } else if (latencyMs > 10000) {
      verdict = 'timeout'
      rootCause = 'slow_provider'
      suggestions.push('Consider faster model')
      suggestions.push('Enable request timeout')
    } else if (latencyMs > 3000) {
      verdict = 'degraded'
      suggestions.push('Review provider latency trends')
    }

    if (fallbackUsed && !rootCause) {
      rootCause = 'primary_provider_failed'
      suggestions.push('Check primary provider health')
    }

    return {
      verdict,
      rootCause,
      suggestions,
      cacheHit: cached,
      fallbackTriggered: fallbackUsed,
      latencyBreakdown: {
        total: latencyMs,
        network: Math.round(latencyMs * 0.3),
        provider: Math.round(latencyMs * 0.6),
        overhead: Math.round(latencyMs * 0.1),
      },
    }
  }

  private buildTimeline(row: Record<string, unknown>): TimelineEvent[] {
    const latencyMs = (row.latency_ms as number) || 0
    const cached = !!(row.cached as number)
    const fallbackUsed = !!(row.fallback_used as number)
    const events: TimelineEvent[] = []

    events.push({ timestamp: row.created_at as string, event: 'request_received', durationMs: 0 })

    if (cached) {
      events.push({ timestamp: row.created_at as string, event: 'cache_hit', durationMs: 2 })
    } else {
      events.push({ timestamp: row.created_at as string, event: 'cache_miss', durationMs: 1 })
      events.push({ timestamp: row.created_at as string, event: 'route_selected', durationMs: 5, metadata: { provider: row.provider_id } })

      if (fallbackUsed) {
        events.push({ timestamp: row.created_at as string, event: 'primary_failed', durationMs: Math.round(latencyMs * 0.3) })
        events.push({ timestamp: row.created_at as string, event: 'fallback_triggered', durationMs: Math.round(latencyMs * 0.7) })
      } else {
        events.push({ timestamp: row.created_at as string, event: 'provider_call', durationMs: latencyMs })
      }

      events.push({ timestamp: row.created_at as string, event: 'response_received', durationMs: 0 })
    }

    return events
  }
}

export const forensicsEngine = new ForensicsEngine()
