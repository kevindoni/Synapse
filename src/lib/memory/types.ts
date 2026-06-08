export type MemoryType = 'episodic' | 'semantic' | 'procedural'

export interface EpisodicMemory {
  id: string
  userId?: string
  sessionId?: string
  input: string
  output: string
  model: string
  provider: string
  taskType?: string
  skillId?: string
  tokensUsed: number
  cost: number
  latencyMs: number
  rating?: number
  tags?: string[]
  createdAt: Date
  expiresAt?: Date
}

export interface SemanticMemory {
  id: string
  key: string
  value: string
  source: string
  category: string
  confidence: number
  accessCount: number
  lastAccessedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface ProceduralMemory {
  id: string
  name: string
  description: string
  rule: string
  condition: string
  action: string
  priority: number
  confidence: number
  hitCount: number
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MemorySearchResult {
  id: string
  type: MemoryType
  content: string
  relevance: number
  metadata?: Record<string, unknown>
}
