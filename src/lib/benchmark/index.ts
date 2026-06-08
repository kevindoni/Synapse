import { db } from '../db'
import { modelBenchmarks } from '../db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { logger } from '../utils/logger'
import { v4 as uuid } from 'uuid'
import type { NormalizedRequest, NormalizedResponse } from '../providers/types'

export interface BenchmarkResult {
  id: string
  model: string
  taskType: string
  latencyMs: number | null
  tokensUsed: number | null
  qualityScore: number | null
  cost: number | null
  providerId: string | null
  isShadow: boolean
}

export interface ModelComparison {
  model: string
  avgLatencyMs: number
  avgQualityScore: number
  avgCost: number
  totalBenchmarks: number
  valueScore: number
}

class BenchmarkEngine {
  async runBenchmark(params: {
    model: string
    taskType: string
    providerId?: string
    isShadow?: boolean
  }, request: NormalizedRequest, response: NormalizedResponse): Promise<BenchmarkResult> {
    const latencyMs = response.latencyMs
    const tokensUsed = response.usage.totalTokens
    const cost = 0
    const qualityScore = this.calculateQualityScore(request, response)

    const result: BenchmarkResult = {
      id: uuid(),
      model: params.model,
      taskType: params.taskType,
      latencyMs,
      tokensUsed,
      qualityScore,
      cost,
      providerId: params.providerId || null,
      isShadow: params.isShadow ?? false,
    }

    try {
      await db.insert(modelBenchmarks).values({
        id: result.id,
        model: result.model,
        taskType: result.taskType,
        latencyMs: result.latencyMs ?? null,
        tokensUsed: result.tokensUsed ?? null,
        qualityScore: result.qualityScore ?? null,
        cost: result.cost ?? null,
        providerId: result.providerId,
        isShadow: result.isShadow,
      })
    } catch (err) {
      logger.warn({ error: (err as Error).message }, 'Failed to save benchmark')
    }

    return result
  }

  private calculateQualityScore(request: NormalizedRequest, response: NormalizedResponse): number {
    let score = 0.5
    const content = response.choices[0]?.message?.content || ''

    if (content.length > 50) score += 0.1
    if (content.length > 200) score += 0.1
    if (!content.includes('I cannot') && !content.includes('I\'m unable')) score += 0.1
    if (content.includes('```')) score += 0.05
    if (response.usage.totalTokens < request.messages.reduce((s, m) => s + m.content.length, 0) / 2) score += 0.05

    if (response.latencyMs < 1000) score += 0.05
    if (response.latencyMs < 500) score += 0.05

    return Math.min(score, 1.0)
  }

  async compareModels(taskType?: string): Promise<ModelComparison[]> {
    try {
      const filter = taskType
        ? sql`${modelBenchmarks.taskType} = ${taskType}`
        : sql`1=1`

      const rows = await db.select({
        model: modelBenchmarks.model,
        avgLatency: sql<number>`coalesce(avg(${modelBenchmarks.latencyMs}), 0)`,
        avgQuality: sql<number>`coalesce(avg(${modelBenchmarks.qualityScore}), 0)`,
        avgCost: sql<number>`coalesce(avg(${modelBenchmarks.cost}), 0)`,
        count: sql<number>`count(*)`,
      }).from(modelBenchmarks).where(filter).groupBy(modelBenchmarks.model)

      return rows.map((r) => ({
        model: r.model,
        avgLatencyMs: Math.round(Number(r.avgLatency)),
        avgQualityScore: Number(Number(r.avgQuality).toFixed(2)),
        avgCost: Number(Number(r.avgCost).toFixed(4)),
        totalBenchmarks: r.count,
        valueScore: r.count > 0 ? Number(r.avgQuality) / (Number(r.avgCost) + 0.001) : 0,
      })).sort((a, b) => b.avgQualityScore - a.avgQualityScore)
    } catch {
      return []
    }
  }

  async getRecentBenchmarks(limit = 50): Promise<BenchmarkResult[]> {
    try {
      const rows = await db.select().from(modelBenchmarks)
        .orderBy(desc(modelBenchmarks.createdAt))
        .limit(limit)
      return rows.map((r) => ({
        id: r.id,
        model: r.model,
        taskType: r.taskType,
        latencyMs: r.latencyMs,
        tokensUsed: r.tokensUsed,
        qualityScore: r.qualityScore ? Number(r.qualityScore) : null,
        cost: r.cost ? Number(r.cost) : null,
        providerId: r.providerId,
        isShadow: !!r.isShadow,
      }))
    } catch {
      return []
    }
  }
}

export const benchmarkEngine = new BenchmarkEngine()
