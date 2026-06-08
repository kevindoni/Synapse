import { db } from '../db'
import { episodes, knowledge, proceduralRules, distillationLog } from '../db/schema'
import { desc, sql } from 'drizzle-orm'
import { logger } from '../utils/logger'
import { v4 as uuid } from 'uuid'

interface Pattern {
  type: 'time_based' | 'model_preference' | 'cost_optimization' | 'quality_signal' | 'language_routing'
  description: string
  confidence: number
  evidence: number
  data: Record<string, unknown>
}

interface DistillationResult {
  id: string
  patternsExtracted: number
  rulesGenerated: number
  knowledgeUpdated: number
  episodesProcessed: number
  durationMs: number
}

class ExperienceDistiller {
  private intervalHandle: ReturnType<typeof setInterval> | null = null

  start(intervalMs = 6 * 60 * 60 * 1000) {
    if (this.intervalHandle) return

    logger.info({ intervalHours: intervalMs / 3600000 }, 'Experience Distiller started')

    this.intervalHandle = setInterval(async () => {
      try {
        await this.run()
      } catch (err) {
        logger.error({ error: (err as Error).message }, 'Distillation run failed')
      }
    }, intervalMs)

    setTimeout(() => this.run(), 5000)
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle)
      this.intervalHandle = null
      logger.info('Experience Distiller stopped')
    }
  }

  async run(): Promise<DistillationResult> {
    const start = Date.now()
    const runId = uuid()
    logger.info({ runId }, 'Starting distillation run')

    let episodesProcessed = 0
    let patternsExtracted = 0
    let rulesGenerated = 0
    let knowledgeUpdated = 0

    const recentEpisodes = await this.getRecentEpisodes()
    episodesProcessed = recentEpisodes.length

    if (episodesProcessed === 0) {
      logger.info('No episodes to distill')
      return this.saveRun(runId, 0, 0, 0, 0, Date.now() - start)
    }

    const patterns = this.extractPatterns(recentEpisodes)
    patternsExtracted = patterns.length

    const rules = this.generateRules(patterns)
    rulesGenerated = rules.length

    for (const rule of rules) {
      try {
        await db.insert(proceduralRules).values({
          id: uuid(),
          category: rule.category,
          condition: rule.condition,
          action: rule.action,
          confidence: rule.confidence,
          priority: rule.priority,
          status: 'auto_generated',
        })
      } catch {
        // ignore duplicate
      }
    }

    const facts = this.extractKnowledge(recentEpisodes)
    knowledgeUpdated = facts.length

    for (const fact of facts) {
      try {
        const existing = await db.select().from(knowledge)
          .where(sql`${knowledge.category} = ${fact.category} AND ${knowledge.subject} = ${fact.subject} AND ${knowledge.key} = ${fact.key}`)
          .limit(1)

        if (existing.length > 0) {
          await db.update(knowledge).set({
            value: fact.value,
            confidence: fact.confidence,
            lastUpdated: new Date().toISOString(),
            sampleCount: sql`${knowledge.sampleCount} + 1`,
          }).where(eq(knowledge.id, existing[0].id))
        } else {
          await db.insert(knowledge).values({
            id: uuid(),
            category: fact.category,
            subject: fact.subject,
            key: fact.key,
            value: fact.value,
            confidence: fact.confidence,
            source: 'distiller',
          })
        }
      } catch {
        // ignore
      }
    }

    const durationMs = Date.now() - start
    logger.info({ runId, patternsExtracted, rulesGenerated, knowledgeUpdated, episodesProcessed, durationMs }, 'Distillation complete')

    return this.saveRun(runId, patternsExtracted, rulesGenerated, knowledgeUpdated, episodesProcessed, durationMs)
  }

  private async getRecentEpisodes() {
    try {
      const cutoff = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      return await db.select().from(episodes)
        .where(sql`${episodes.createdAt} > ${cutoff}`)
        .orderBy(desc(episodes.createdAt))
        .limit(1000)
    } catch {
      return []
    }
  }

  private extractPatterns(episodes: Array<Record<string, unknown>>): Pattern[] {
    const patterns: Pattern[] = []

    const byModel = new Map<string, number>()
    const byProvider = new Map<string, { count: number; totalLatency: number; totalQuality: number }>()

    for (const ep of episodes) {
      const model = String(ep.model || 'unknown')
      byModel.set(model, (byModel.get(model) || 0) + 1)

      const provider = String(ep.provider || 'unknown')
      const existing = byProvider.get(provider) || { count: 0, totalLatency: 0, totalQuality: 0 }
      existing.count++
      existing.totalLatency += Number(ep.latencyMs || 0)
      existing.totalQuality += Number(ep.qualityScore || 0)
      byProvider.set(provider, existing)
    }

    const total = episodes.length
    for (const [model, count] of byModel) {
      const ratio = count / total
      if (ratio > 0.4) {
        patterns.push({
          type: 'model_preference',
          description: `${model} is used ${Math.round(ratio * 100)}% of the time`,
          confidence: Math.min(ratio, 0.95),
          evidence: count,
          data: { model, ratio, count },
        })
      }
    }

    for (const [provider, stats] of byProvider) {
      if (stats.count < 5) continue
      const avgLatency = stats.totalLatency / stats.count
      const avgQuality = stats.totalQuality / stats.count

      if (avgLatency < 500 && avgQuality > 4) {
        patterns.push({
          type: 'quality_signal',
          description: `${provider} performs well: avg ${Math.round(avgLatency)}ms latency, ${avgQuality.toFixed(1)} quality`,
          confidence: 0.85,
          evidence: stats.count,
          data: { provider, avgLatency, avgQuality },
        })
      }
    }

    return patterns
  }

  private generateRules(patterns: Pattern[]): Array<{
    category: string
    condition: string
    action: string
    priority: number
    confidence: number
  }> {
    const rules: Array<{
      category: string
      condition: string
      action: string
      priority: number
      confidence: number
    }> = []

    for (const p of patterns) {
      switch (p.type) {
        case 'model_preference': {
          const model = (p.data as { model: string }).model
          rules.push({
            category: 'routing',
            condition: `model:${model}`,
            action: 'increase_priority',
            priority: 8,
            confidence: p.confidence,
          })
          break
        }
        case 'quality_signal': {
          const provider = (p.data as { provider: string }).provider
          rules.push({
            category: 'routing',
            condition: `provider:${provider}`,
            action: 'prefer_for_quality',
            priority: 7,
            confidence: p.confidence,
          })
          break
        }
        case 'cost_optimization': {
          rules.push({
            category: 'cost',
            condition: 'high_usage_period',
            action: 'prefer_low_cost_provider',
            priority: 5,
            confidence: p.confidence * 0.8,
          })
          break
        }
      }
    }

    return rules
  }

  private extractKnowledge(episodes: Array<Record<string, unknown>>): Array<{
    category: string
    subject: string
    key: string
    value: string
    confidence: number
  }> {
    const facts: Array<{
      category: string
      subject: string
      key: string
      value: string
      confidence: number
    }> = []

    const modelStats = new Map<string, { count: number; avgLatency: number; avgCost: number }>()

    for (const ep of episodes) {
      const model = String(ep.model || 'unknown')
      const existing = modelStats.get(model) || { count: 0, avgLatency: 0, avgCost: 0 }
      existing.count++
      existing.avgLatency = (existing.avgLatency * (existing.count - 1) + Number(ep.latencyMs || 0)) / existing.count
      existing.avgCost = (existing.avgCost * (existing.count - 1) + Number(ep.cost || 0)) / existing.count
      modelStats.set(model, existing)
    }

    for (const [model, stats] of modelStats) {
      if (stats.count >= 5) {
        facts.push({
          category: 'performance',
          subject: model,
          key: 'avg_latency',
          value: `${Math.round(stats.avgLatency)}ms over ${stats.count} requests`,
          confidence: Math.min(stats.count / 100, 0.9),
        })
        facts.push({
          category: 'cost',
          subject: model,
          key: 'avg_cost',
          value: `$${stats.avgCost.toFixed(4)} per request over ${stats.count} requests`,
          confidence: Math.min(stats.count / 100, 0.9),
        })
      }
    }

    return facts
  }

  private async saveRun(
    runId: string,
    patternsExtracted: number,
    rulesGenerated: number,
    knowledgeUpdated: number,
    episodesProcessed: number,
    durationMs: number,
  ): Promise<DistillationResult> {
    try {
      await db.insert(distillationLog).values({
        id: runId,
        startedAt: new Date(Date.now() - durationMs).toISOString(),
        completedAt: new Date().toISOString(),
        episodesProcessed,
        patternsFound: patternsExtracted,
        rulesGenerated,
        knowledgeEntriesAdded: knowledgeUpdated,
        status: 'completed',
      })
    } catch {
      // table might not exist
    }

    return {
      id: runId,
      patternsExtracted,
      rulesGenerated,
      knowledgeUpdated,
      episodesProcessed,
      durationMs,
    }
  }
}

import { eq } from 'drizzle-orm'

export const experienceDistiller = new ExperienceDistiller()
