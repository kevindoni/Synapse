import { db } from '../db'
import { pipelines } from '../db/schema'
import { eq } from 'drizzle-orm'
import { DEFAULT_PIPELINE } from './types'
import type { Pipeline, PipelineNode, PipelineConnection } from './types'
import { logger } from '../utils/logger'
import { v4 as uuid } from 'uuid'

class PipelineEngine {
  async list(): Promise<Pipeline[]> {
    try {
      const rows = await db.select().from(pipelines)
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description || '',
        nodes: JSON.parse(r.nodes),
        connections: JSON.parse(r.connections),
        isDefault: !!r.isDefault,
      }))
    } catch {
      return [DEFAULT_PIPELINE]
    }
  }

  async getDefault(): Promise<Pipeline> {
    try {
      const rows = await db.select().from(pipelines).where(eq(pipelines.isDefault, true)).limit(1)
      if (rows.length > 0) {
        return {
          id: rows[0].id,
          name: rows[0].name,
          description: rows[0].description || '',
          nodes: JSON.parse(rows[0].nodes),
          connections: JSON.parse(rows[0].connections),
          isDefault: true,
        }
      }
    } catch { /* ignore */ }
    return DEFAULT_PIPELINE
  }

  async create(pipeline: Omit<Pipeline, 'id'>): Promise<string> {
    const id = uuid()
    try {
      await db.insert(pipelines).values({
        id,
        name: pipeline.name,
        description: pipeline.description,
        nodes: JSON.stringify(pipeline.nodes),
        connections: JSON.stringify(pipeline.connections),
        isDefault: pipeline.isDefault ?? false,
      })
    } catch (err) {
      logger.warn({ error: (err as Error).message }, 'Failed to create pipeline')
    }
    return id
  }

  async update(id: string, updates: Partial<Pipeline>): Promise<void> {
    try {
      const set: Record<string, unknown> = { updatedAt: new Date().toISOString() }
      if (updates.name !== undefined) set.name = updates.name
      if (updates.description !== undefined) set.description = updates.description
      if (updates.nodes !== undefined) set.nodes = JSON.stringify(updates.nodes)
      if (updates.connections !== undefined) set.connections = JSON.stringify(updates.connections)
      if (updates.isDefault !== undefined) set.isDefault = updates.isDefault

      await db.update(pipelines).set(set).where(eq(pipelines.id, id))
    } catch (err) {
      logger.warn({ error: (err as Error).message }, 'Failed to update pipeline')
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await db.delete(pipelines).where(eq(pipelines.id, id))
    } catch (err) {
      logger.warn({ error: (err as Error).message }, 'Failed to delete pipeline')
    }
  }
}

export const pipelineEngine = new PipelineEngine()
