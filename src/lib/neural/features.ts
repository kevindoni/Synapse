export interface RequestFeatures {
  hourOfDay: number
  dayOfWeek: number
  promptTokenCount: number
  hasCode: boolean
  hasTools: boolean
  isStreaming: boolean
  temperature: number
  taskType: string
  modelFamily: string
  contextFillRatio: number
}

export interface RoutingPrediction {
  provider: string
  model: string
  confidence: number
  expectedLatencyMs: number
  expectedCost: number
  strategy: 'neural' | 'hybrid' | 'rule_based'
}

export interface RoutingStrategy {
  name: string
  select(features: RequestFeatures, candidates: RoutingCandidate[]): RoutingPrediction
}

export interface RoutingCandidate {
  providerId: string
  model: string
  health: number
  latency: number
  cost: number
  successRate: number
}

export function extractFeatures(request: {
  messages?: Array<{ content: string; role: string }>
  model?: string
  stream?: boolean
  temperature?: number
  maxTokens?: number
  tools?: unknown[]
  taskType?: string
}): RequestFeatures {
  const now = new Date()
  const content = (request.messages || []).map((m) => m.content).join(' ')
  const estimatedTokens = Math.ceil(content.length / 4)

  const hasCode = /(?:function|class|const |let |var |import |export |def |async |return |=>|```)/.test(content)
  const hasTools = (request.tools?.length ?? 0) > 0

  const modelFamily = (() => {
    const m = (request.model || '').toLowerCase()
    if (m.includes('gpt') || m.includes('o1') || m.includes('o3')) return 'openai'
    if (m.includes('claude')) return 'anthropic'
    if (m.includes('gemini')) return 'gemini'
    if (m.includes('deepseek')) return 'deepseek'
    return 'unknown'
  })()

  return {
    hourOfDay: now.getHours(),
    dayOfWeek: now.getDay(),
    promptTokenCount: estimatedTokens,
    hasCode,
    hasTools,
    isStreaming: request.stream ?? false,
    temperature: request.temperature ?? 0.7,
    taskType: request.taskType || (hasCode ? 'code' : 'chat'),
    modelFamily,
    contextFillRatio: Math.min(estimatedTokens / 128000, 1),
  }
}
