export type AuthType = 'oauth' | 'api_key' | 'none' | 'service_account'
export type PricingTier = 'free' | 'cheap' | 'subscription' | 'pay_per_use'
export type HealthStatusType = 'healthy' | 'degraded' | 'down' | 'disabled'
export type TaskType = 'code' | 'chat' | 'reason' | 'review' | 'debug' | 'doc' | 'translate' | 'fast'

export interface Model {
  id: string
  name: string
  displayName?: string
  providerId: string
  pricingTier?: PricingTier
  costPer1mInput?: number
  costPer1mOutput?: number
  contextWindow?: number
  capabilities?: string[]
  available: boolean
}

export interface ProviderInfo {
  id: string
  name: string
  prefix: string
  authType: AuthType
  baseUrl: string
  enabled: boolean
}

export interface ProviderAccount {
  id: string
  providerId: string
  label?: string
  authData: Record<string, unknown>
  enabled: boolean
  priority: number
  quotaUsedTokens: number
  quotaLimitTokens?: number
  quotaResetAt?: Date
  lastUsedAt?: Date
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  toolCallId?: string
  toolCalls?: ToolCall[]
}

export interface ToolCall {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

export interface NormalizedRequest {
  model: string
  messages: Message[]
  temperature?: number
  maxTokens?: number
  stream?: boolean
  tools?: unknown[]
  metadata?: Record<string, unknown>
  skillId?: string
  taskType?: TaskType
}

export interface NormalizedResponse {
  id: string
  model: string
  choices: Array<{
    index: number
    message: Message
    finishReason: string
  }>
  usage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
  latencyMs: number
  provider: string
}

export interface NormalizedChunk {
  id: string
  model: string
  choices: Array<{
    index: number
    delta: Partial<Message>
    finishReason: string | null
  }>
  usage?: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
}

export interface QuotaInfo {
  usedTokens: number
  limitTokens?: number
  resetAt?: Date
  unlimited: boolean
}

export interface ProviderAdapter {
  info: ProviderInfo
  fetchModels(): Promise<Model[]>
  chatCompletion(req: NormalizedRequest, account: ProviderAccount): Promise<NormalizedResponse>
  chatCompletionStream(req: NormalizedRequest, account: ProviderAccount): AsyncIterable<NormalizedChunk>
  healthCheck(): Promise<{ status: HealthStatusType; latencyMs: number }>
  getQuota?(account: ProviderAccount): Promise<QuotaInfo>
}

export interface MeshProvider {
  provider: ProviderInfo
  account: ProviderAccount
  model: Model
  health: HealthStatusType
  cost: number
  latency: number
}
