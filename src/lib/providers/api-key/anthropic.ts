import { BaseAdapter } from '../base-adapter'
import type { ProviderInfo, ProviderAccount, NormalizedRequest, NormalizedResponse, Model, HealthStatusType } from '../types'

export class AnthropicAdapter extends BaseAdapter {
  info: ProviderInfo

  constructor(info?: Partial<ProviderInfo>) {
    super()
    this.info = {
      id: info?.id || 'anthropic',
      name: info?.name || 'Anthropic',
      prefix: info?.prefix || 'an/',
      authType: info?.authType || 'api_key',
      baseUrl: info?.baseUrl || 'https://api.anthropic.com',
      enabled: info?.enabled ?? true,
    }
  }

  private staticModels: Model[] = [
    { id: 'an/claude-opus-4-7', name: 'claude-opus-4-7', displayName: 'Claude Opus 4.7', providerId: 'anthropic', pricingTier: 'pay_per_use', costPer1mInput: 15, costPer1mOutput: 75, contextWindow: 200000, capabilities: ['streaming', 'tools', 'vision'], available: true },
    { id: 'an/claude-sonnet-4-5', name: 'claude-sonnet-4-5', displayName: 'Claude Sonnet 4.5', providerId: 'anthropic', pricingTier: 'pay_per_use', costPer1mInput: 3, costPer1mOutput: 15, contextWindow: 200000, capabilities: ['streaming', 'tools', 'vision'], available: true },
    { id: 'an/claude-haiku-4-5', name: 'claude-haiku-4-5', displayName: 'Claude Haiku 4.5', providerId: 'anthropic', pricingTier: 'pay_per_use', costPer1mInput: 0.8, costPer1mOutput: 4, contextWindow: 200000, capabilities: ['streaming', 'tools', 'vision'], available: true },
  ]

  async fetchModels(): Promise<Model[]> {
    return this.staticModels
  }

  async chatCompletion(req: NormalizedRequest, account: ProviderAccount): Promise<NormalizedResponse> {
    const startTime = Date.now()
    const systemMsg = req.messages.find((m) => m.role === 'system')
    const nonSystemMsgs = req.messages.filter((m) => m.role !== 'system')

    const claudeBody: Record<string, unknown> = {
      model: req.model.replace('an/', ''),
      messages: nonSystemMsgs.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: req.maxTokens || 4096,
      stream: false,
    }
    if (systemMsg) claudeBody.system = systemMsg.content

    const raw = await this.fetchJson<{
      id?: string
      model?: string
      content?: Array<{ type: string; text?: string }>
      stop_reason?: string
      usage?: { input_tokens?: number; output_tokens?: number }
    }>(`${this.info.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': account.authData.apiKey as string,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(claudeBody),
    })

    const content = raw.content?.find((c) => c.type === 'text')?.text || ''

    return {
      id: raw.id || crypto.randomUUID(),
      model: raw.model || req.model,
      choices: [{
        index: 0,
        message: { role: 'assistant', content },
        finishReason: raw.stop_reason || 'stop',
      }],
      usage: {
        inputTokens: raw.usage?.input_tokens || 0,
        outputTokens: raw.usage?.output_tokens || 0,
        totalTokens: (raw.usage?.input_tokens || 0) + (raw.usage?.output_tokens || 0),
      },
      latencyMs: Date.now() - startTime,
      provider: this.info.name,
    }
  }

  async *chatCompletionStream(): AsyncIterable<import('../types').NormalizedChunk> {
    yield { id: '', model: '', choices: [{ index: 0, delta: { content: 'Streaming not implemented for Anthropic adapter yet' }, finishReason: 'stop' }] }
  }

  async healthCheck(): Promise<{ status: HealthStatusType; latencyMs: number }> {
    const start = Date.now()
    try {
      await fetch(`${this.info.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'test', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-haiku-4-5', messages: [{ role: 'user', content: 'hi' }], max_tokens: 1 }),
        signal: AbortSignal.timeout(10000),
      })
      return { status: 'healthy', latencyMs: Date.now() - start }
    } catch {
      return { status: 'down', latencyMs: Date.now() - start }
    }
  }
}
