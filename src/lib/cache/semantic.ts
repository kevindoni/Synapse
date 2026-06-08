import { db } from '../db'
import { semanticCache as semanticCacheTable } from '../db/schema'
import { eq, desc, sql, and, gt } from 'drizzle-orm'
import { logger } from '../utils/logger'
import { v4 as uuid } from 'uuid'

interface CacheEntry {
  id: string
  promptHash: string
  promptText: string
  responseText: string
  model: string
  inputTokens: number | null
  outputTokens: number | null
  similarityThreshold: number
  hits: number
  qualityScore: number | null
  expiresAt: string
  createdAt: string
}

class SemanticCache {
  private memoryCache = new Map<string, { entry: CacheEntry; expiresAt: number }>()
  private maxMemoryEntries = 500

  async get(promptHash: string): Promise<CacheEntry | null> {
    const memEntry = this.memoryCache.get(promptHash)
    if (memEntry) {
      if (Date.now() > memEntry.expiresAt) {
        this.memoryCache.delete(promptHash)
      } else {
        memEntry.entry.hits++
        return memEntry.entry
      }
    }

    try {
      const rows = await db.select().from(semanticCacheTable)
        .where(and(eq(semanticCacheTable.promptHash, promptHash), gt(semanticCacheTable.expiresAt, new Date().toISOString())))
        .limit(1)

      if (rows.length === 0) return null

      const row = rows[0]
      await db.update(semanticCacheTable).set({
        hits: sql`${semanticCacheTable.hits} + 1`,
      }).where(eq(semanticCacheTable.id, row.id))

      const entry: CacheEntry = {
        id: row.id,
        promptHash: row.promptHash,
        promptText: row.promptText,
        responseText: row.responseText,
        model: row.model,
        inputTokens: row.inputTokens ?? null,
        outputTokens: row.outputTokens ?? null,
        similarityThreshold: row.similarityThreshold ?? 0.95,
        hits: row.hits ?? 0,
        qualityScore: row.qualityScore ?? null,
        expiresAt: row.expiresAt,
        createdAt: row.createdAt,
      }

      this.setMemoryCache(promptHash, entry)
      return entry
    } catch {
      return null
    }
  }

  async set(params: {
    promptHash: string
    promptText: string
    responseText: string
    model: string
    inputTokens?: number
    outputTokens?: number
    similarityThreshold?: number
    qualityScore?: number
    ttlHours?: number
  }): Promise<void> {
    const id = uuid()
    const ttlMs = (params.ttlHours || 24) * 60 * 60 * 1000
    const expiresAt = new Date(Date.now() + ttlMs).toISOString()

    const entry: CacheEntry = {
      id,
      promptHash: params.promptHash,
      promptText: params.promptText,
      responseText: params.responseText,
      model: params.model,
      inputTokens: params.inputTokens ?? null,
      outputTokens: params.outputTokens ?? null,
      similarityThreshold: params.similarityThreshold ?? 0.95,
      hits: 0,
      qualityScore: params.qualityScore ?? null,
      expiresAt,
      createdAt: new Date().toISOString(),
    }

    this.setMemoryCache(params.promptHash, entry)

    try {
      await db.insert(semanticCacheTable).values({
        id,
        embedding: Buffer.alloc(0),
        promptHash: params.promptHash,
        promptText: params.promptText,
        responseText: params.responseText,
        model: params.model,
        inputTokens: params.inputTokens ?? null,
        outputTokens: params.outputTokens ?? null,
        similarityThreshold: params.similarityThreshold ?? 0.95,
        hits: 0,
        qualityScore: params.qualityScore ?? null,
        expiresAt,
      })
    } catch (err) {
      logger.warn({ error: (err as Error).message }, 'Failed to cache response')
    }
  }

  async invalidate(promptHash: string): Promise<void> {
    this.memoryCache.delete(promptHash)
    try {
      await db.delete(semanticCacheTable).where(eq(semanticCacheTable.promptHash, promptHash))
    } catch {
      // ignore
    }
  }

  async clear(): Promise<void> {
    this.memoryCache.clear()
    try {
      await db.delete(semanticCacheTable)
    } catch {
      // ignore
    }
  }

  async cleanup(): Promise<number> {
    const now = new Date().toISOString()
    let deleted = 0

    try {
      const expired = await db.select({ id: semanticCacheTable.id }).from(semanticCacheTable)
        .where(sql`${semanticCacheTable.expiresAt} < ${now}`)
      deleted = expired.length

      if (deleted > 0) {
        await db.delete(semanticCacheTable).where(sql`${semanticCacheTable.expiresAt} < ${now}`)
        logger.info({ deleted }, 'Cleaned up expired cache entries')
      }
    } catch {
      // ignore
    }

    for (const [key, val] of this.memoryCache) {
      if (Date.now() > val.expiresAt) {
        this.memoryCache.delete(key)
      }
    }

    return deleted
  }

  async getStats() {
    try {
      const [stats] = await db.select({
        total: sql<number>`count(*)`,
        hits: sql<number>`coalesce(sum(${semanticCacheTable.hits}), 0)`,
      }).from(semanticCacheTable)

      const total = stats?.total ?? 0
      const hits = stats?.hits ?? 0

      return {
        totalEntries: total,
        memoryEntries: this.memoryCache.size,
        totalHits: hits,
        hitRate: total > 0 ? hits / total : 0,
      }
    } catch {
      return {
        totalEntries: 0,
        memoryEntries: this.memoryCache.size,
        totalHits: 0,
        hitRate: 0,
      }
    }
  }

  private setMemoryCache(key: string, entry: CacheEntry) {
    if (this.memoryCache.size >= this.maxMemoryEntries) {
      const oldest = this.memoryCache.keys().next().value
      if (oldest) this.memoryCache.delete(oldest)
    }
    this.memoryCache.set(key, { entry, expiresAt: new Date(entry.expiresAt).getTime() })
  }
}

export async function computeQueryHash(query: string, model: string): Promise<string> {
  const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ')
  const data = `${normalized}:${model}`
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data))
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const semanticCacheStore = new SemanticCache()
