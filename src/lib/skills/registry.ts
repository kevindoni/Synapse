import { db } from '../db'
import { skills, skillGroups } from '../db/schema'
import { eq } from 'drizzle-orm'
import type { Skill, SkillGroup, RotationStrategy, SkillRotationResult } from './types'
import { logger } from '../utils/logger'

class SkillRegistry {
  private skillCache = new Map<string, Skill>()
  private groupCache = new Map<string, SkillGroup>()
  private loaded = false

  async load() {
    if (this.loaded) return

    try {
      const allSkills = await db.select().from(skills)
      const allGroups = await db.select().from(skillGroups)

      this.skillCache.clear()
      this.groupCache.clear()

      for (const s of allSkills) {
        const rotationConfig = s.rotationConfig ? JSON.parse(s.rotationConfig) : {}
        this.skillCache.set(s.id, {
          id: s.id,
          name: s.name,
          description: s.description || '',
          systemPrompt: s.systemPrompt,
          groupId: s.groupId,
          temperature: rotationConfig.temperature ?? undefined,
          maxTokens: rotationConfig.maxTokens ?? undefined,
          preferredModel: rotationConfig.preferredModel ?? undefined,
          enabled: s.enabled,
          metadata: { usageCount: s.usageCount, qualityScore: s.qualityScore, tags: JSON.parse(s.tags) },
        })
      }

      for (const g of allGroups) {
        const taskTypes: string[] = g.taskTypes ? JSON.parse(g.taskTypes) : []
        this.groupCache.set(g.id, {
          id: g.id,
          name: g.name,
          description: g.description || '',
          skillIds: taskTypes,
          rotationStrategy: (g.rotationStrategy as RotationStrategy) || 'round_robin',
          enabled: g.enabled,
        })
      }

      this.loaded = true
      logger.info({ skills: this.skillCache.size, groups: this.groupCache.size }, 'Skills loaded')
    } catch (err) {
      logger.warn({ error: (err as Error).message }, 'Failed to load skills from DB, using empty registry')
      this.loaded = true
    }
  }

  async getSkill(id: string): Promise<Skill | null> {
    await this.load()
    return this.skillCache.get(id) || null
  }

  async listSkills(): Promise<Skill[]> {
    await this.load()
    return Array.from(this.skillCache.values())
  }

  async listEnabledSkills(): Promise<Skill[]> {
    await this.load()
    return Array.from(this.skillCache.values()).filter((s) => s.enabled)
  }

  async getGroup(id: string): Promise<SkillGroup | null> {
    await this.load()
    return this.groupCache.get(id) || null
  }

  async listGroups(): Promise<SkillGroup[]> {
    await this.load()
    return Array.from(this.groupCache.values())
  }

  async createSkill(skill: Skill): Promise<void> {
    const rotationConfig: Record<string, unknown> = {}
    if (skill.temperature !== undefined) rotationConfig.temperature = skill.temperature
    if (skill.maxTokens !== undefined) rotationConfig.maxTokens = skill.maxTokens
    if (skill.preferredModel !== undefined) rotationConfig.preferredModel = skill.preferredModel

    await db.insert(skills).values({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      systemPrompt: skill.systemPrompt,
      groupId: skill.groupId,
      rotationConfig: JSON.stringify(rotationConfig),
      enabled: skill.enabled,
    })
    this.skillCache.set(skill.id, skill)
  }

  async createGroup(group: SkillGroup): Promise<void> {
    await db.insert(skillGroups).values({
      id: group.id,
      name: group.name,
      description: group.description,
      taskTypes: JSON.stringify(group.skillIds),
      rotationStrategy: group.rotationStrategy,
      enabled: group.enabled,
    })
    this.groupCache.set(group.id, group)
  }

  async updateSkill(id: string, updates: Partial<Skill>): Promise<void> {
    const existing = this.skillCache.get(id)
    if (!existing) throw new Error(`Skill not found: ${id}`)

    const updated = { ...existing, ...updates }
    const rotationConfig: Record<string, unknown> = {}
    if (updated.temperature !== undefined) rotationConfig.temperature = updated.temperature
    if (updated.maxTokens !== undefined) rotationConfig.maxTokens = updated.maxTokens
    if (updated.preferredModel !== undefined) rotationConfig.preferredModel = updated.preferredModel

    await db.update(skills).set({
      name: updated.name,
      description: updated.description,
      systemPrompt: updated.systemPrompt,
      groupId: updated.groupId,
      rotationConfig: JSON.stringify(rotationConfig),
      enabled: updated.enabled,
    }).where(eq(skills.id, id))
    this.skillCache.set(id, updated)
  }

  async deleteSkill(id: string): Promise<void> {
    await db.delete(skills).where(eq(skills.id, id))
    this.skillCache.delete(id)
  }

  async rotate(groupId: string, taskType?: string): Promise<SkillRotationResult> {
    await this.load()
    const group = this.groupCache.get(groupId)
    if (!group) throw new Error(`Group not found: ${groupId}`)
    if (!group.enabled) throw new Error(`Group "${group.name}" is disabled`)

    const enabledSkills = group.skillIds
      .map((sid) => this.skillCache.get(sid))
      .filter((s): s is Skill => !!s && s.enabled)

    if (enabledSkills.length === 0) throw new Error(`No enabled skills in group "${group.name}"`)
    if (enabledSkills.length === 1) {
      return { skill: enabledSkills[0], group, strategy: group.rotationStrategy, confidence: 1 }
    }

    const selected = this.applyStrategy(enabledSkills, group.rotationStrategy, taskType)
    return { skill: selected, group, strategy: group.rotationStrategy, confidence: 0.8 }
  }

  private applyStrategy(candidates: Skill[], strategy: RotationStrategy, taskType?: string): Skill {
    switch (strategy) {
      case 'round_robin': {
        const idx = Date.now() % candidates.length
        return candidates[idx]
      }
      case 'quality_based':
        return candidates[0]
      case 'weighted_random': {
        return candidates[Math.floor(Math.random() * candidates.length)]
      }
      case 'task_match': {
        if (taskType) {
          const match = candidates.find((s) =>
            s.name.toLowerCase().includes(taskType.toLowerCase()) ||
            s.description.toLowerCase().includes(taskType.toLowerCase())
          )
          if (match) return match
        }
        return candidates[0]
      }
      case 'schedule': {
        const idx = Math.floor(Date.now() / 3600000) % candidates.length
        return candidates[idx]
      }
      default:
        return candidates[0]
    }
  }

  invalidate() {
    this.loaded = false
    this.skillCache.clear()
    this.groupCache.clear()
  }
}

export const skillRegistry = new SkillRegistry()
