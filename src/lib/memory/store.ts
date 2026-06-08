import { db } from '../db'
import { episodes, knowledge, proceduralRules } from '../db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import type { MemorySearchResult, MemoryType } from './types'
import { logger } from '../utils/logger'
import { v4 as uuid } from 'uuid'

export interface EpisodeInput {
  eventType: string
  model?: string
  provider?: string
  taskType?: string
  inputTokens?: number
  outputTokens?: number
  tokensSaved?: number
  latencyMs?: number
  cost?: number
  qualityScore?: number
  outcome?: string
  metadata?: Record<string, unknown>
}

export interface KnowledgeInput {
  category: string
  subject: string
  key: string
  value: string
  confidence?: number
  source?: string
}

export interface RuleInput {
  category: string
  condition: string
  action: string
  confidence?: number
  priority?: number
  status?: string
}

class MemoryStore {
  async storeEpisode(ep: EpisodeInput): Promise<string> {
    const id = uuid()
    try {
      await db.insert(episodes).values({
        id,
        timestamp: new Date().toISOString(),
        eventType: ep.eventType,
        model: ep.model || null,
        provider: ep.provider || null,
        taskType: ep.taskType || null,
        inputTokens: ep.inputTokens ?? null,
        outputTokens: ep.outputTokens ?? null,
        tokensSaved: ep.tokensSaved ?? null,
        latencyMs: ep.latencyMs ?? null,
        cost: ep.cost ?? null,
        qualityScore: ep.qualityScore ?? null,
        outcome: ep.outcome || null,
        metadata: ep.metadata ? JSON.stringify(ep.metadata) : '{}',
      })
    } catch (err) {
      logger.warn({ error: (err as Error).message }, 'Failed to store episode')
    }
    return id
  }

  async getRecentEpisodes(limit = 50) {
    try {
      return await db.select().from(episodes).orderBy(desc(episodes.createdAt)).limit(limit)
    } catch {
      return []
    }
  }

  async storeKnowledge(k: KnowledgeInput): Promise<string> {
    const id = uuid()
    try {
      const existing = await db.select().from(knowledge)
        .where(sql`${knowledge.category} = ${k.category} AND ${knowledge.subject} = ${k.subject} AND ${knowledge.key} = ${k.key}`)
        .limit(1)

      if (existing.length > 0) {
        await db.update(knowledge).set({
          value: k.value,
          confidence: k.confidence ?? 0,
          source: k.source || 'distilled',
          lastUpdated: new Date().toISOString(),
          sampleCount: sql`${knowledge.sampleCount} + 1`,
        }).where(eq(knowledge.id, existing[0].id))
        return existing[0].id
      }

      await db.insert(knowledge).values({
        id,
        category: k.category,
        subject: k.subject,
        key: k.key,
        value: k.value,
        confidence: k.confidence ?? 0,
        source: k.source || 'distilled',
      })
    } catch (err) {
      logger.warn({ error: (err as Error).message }, 'Failed to store knowledge')
    }
    return id
  }

  async getKnowledge(category: string, subject: string, key: string) {
    try {
      const rows = await db.select().from(knowledge)
        .where(sql`${knowledge.category} = ${category} AND ${knowledge.subject} = ${subject} AND ${knowledge.key} = ${key}`)
        .limit(1)
      return rows[0] || null
    } catch {
      return null
    }
  }

  async searchKnowledge(query: string, limit = 10) {
    try {
      return await db.select().from(knowledge)
        .where(sql`${knowledge.value} LIKE ${`%${query}%`} OR ${knowledge.key} LIKE ${`%${query}%`}`)
        .orderBy(desc(knowledge.confidence))
        .limit(limit)
    } catch {
      return []
    }
  }

  async storeRule(rule: RuleInput): Promise<string> {
    const id = uuid()
    try {
      await db.insert(proceduralRules).values({
        id,
        category: rule.category,
        condition: rule.condition,
        action: rule.action,
        confidence: rule.confidence ?? 0,
        priority: rule.priority ?? 0,
        status: rule.status || 'auto_generated',
      })
    } catch (err) {
      logger.warn({ error: (err as Error).message }, 'Failed to store rule')
    }
    return id
  }

  async getApplicableRules(context: string) {
    try {
      const rows = await db.select().from(proceduralRules)
        .where(sql`${proceduralRules.condition} LIKE ${`%${context}%`}`)
        .orderBy(desc(proceduralRules.priority))
        .limit(5)

      for (const row of rows) {
        await db.update(proceduralRules).set({
          applyCount: sql`${proceduralRules.applyCount} + 1`,
          lastAppliedAt: new Date().toISOString(),
        }).where(eq(proceduralRules.id, row.id))
      }

      return rows
    } catch {
      return []
    }
  }

  async search(query: string, types?: MemoryType[], limit = 20): Promise<MemorySearchResult[]> {
    const results: MemorySearchResult[] = []
    const searchTypes = types || ['episodic', 'semantic', 'procedural']

    if (searchTypes.includes('semantic')) {
      const items = await this.searchKnowledge(query, limit)
      results.push(...items.map((k) => ({
        id: k.id,
        type: 'semantic' as MemoryType,
        content: `${k.key}: ${k.value}`,
        relevance: k.confidence ?? 0,
        metadata: { category: k.category, source: k.source },
      })))
    }

    if (searchTypes.includes('procedural')) {
      const rules = await this.getApplicableRules(query)
      results.push(...rules.map((r) => ({
        id: r.id,
        type: 'procedural' as MemoryType,
        content: `${r.category}: ${r.condition} → ${r.action}`,
        relevance: r.confidence ?? 0,
        metadata: { action: r.action, priority: r.priority },
      })))
    }

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, limit)
  }

  async getStats() {
    try {
      const [epCount] = await db.select({ count: sql<number>`count(*)` }).from(episodes)
      const [knCount] = await db.select({ count: sql<number>`count(*)` }).from(knowledge)
      const [ruCount] = await db.select({ count: sql<number>`count(*)` }).from(proceduralRules)

      return {
        episodes: epCount?.count ?? 0,
        knowledge: knCount?.count ?? 0,
        rules: ruCount?.count ?? 0,
        totalSize: 'N/A',
      }
    } catch {
      return { episodes: 0, knowledge: 0, rules: 0, totalSize: 'N/A' }
    }
  }
}

export const memoryStore = new MemoryStore()
