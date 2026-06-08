export type RotationStrategy = 'task_match' | 'round_robin' | 'quality_based' | 'schedule' | 'weighted_random'

export interface Skill {
  id: string
  name: string
  description: string
  systemPrompt: string
  groupId: string | null
  temperature?: number
  maxTokens?: number
  preferredModel?: string
  enabled: boolean
  metadata?: Record<string, unknown>
}

export interface SkillGroup {
  id: string
  name: string
  description: string
  skillIds: string[]
  rotationStrategy: RotationStrategy
  enabled: boolean
  schedule?: {
    cron: string
    timezone: string
  }
  weights?: Record<string, number>
}

export interface SkillRotationResult {
  skill: Skill
  group: SkillGroup | null
  strategy: RotationStrategy
  confidence: number
}

export interface SkillForgeRecipe {
  name: string
  description: string
  basePrompt: string
  examples: Array<{ input: string; output: string }>
  constraints?: string[]
  preferredModel?: string
}
