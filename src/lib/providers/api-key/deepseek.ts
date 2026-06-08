import { BaseAdapter } from '../base-adapter'
import type { ProviderInfo, ProviderAccount, NormalizedRequest, NormalizedResponse, NormalizedChunk, Model, HealthStatusType } from '../types'

export class DeepSeekAdapter extends BaseAdapter {
  info: ProviderInfo

  constructor(info?: Partial<ProviderInfo>) {
    super()
    this.info = {
      id: info?.id || 'deepseek',
      name: info?.name || 'DeepSeek',
      prefix: info?.prefix || 'ds/',
      authType: info?.authType || 'api_key',
      baseUrl: info?.baseUrl || 'https://api.deepseek.com/v1',
      enabled: info?.enabled ?? true,
    }
  }

  async fetchModels(): Promise<Model[]> {
    try {
      const data = await this.fetchJson<{ data: Array<{ id: string }> }>(
        `${this.info.baseUrl}/models`,
        { headers: { 'Content-Type': 'application/json' } }
      )
      return data.data.map((m) => ({
        id: `${this.info.prefix}${m.id}`,
        name: m.id,
        displayName: m.id,
        providerId: this.info.id,
        pricingTier: 'pay_per_use' as const,
        available: true,
      }))
    } catch {
      return [
        { id: 'ds/deepseek-chat', name: 'deepseek-chat', displayName: 'DeepSeek Chat', providerId: this.info.id, pricingTier: 'pay_per_use', available: true },
        { id: 'ds/deepseek-reasoner', name: 'deepseek-reasoner', displayName: 'DeepSeek Reasoner', providerId: this.info.id, pricingTier: 'pay_per_use', available: true },
      ]
    }
  }

  async chatCompletion(req: NormalizedRequest, account: ProviderAccount): Promise<NormalizedResponse> {
    const startTime = Date.now()
    const body = this.createOpenAIRequest(req)

    const raw = await this.fetchJson<{
      id?: string; model?: string
      choices?: Array<{ index?: number; message?: { role?: string; content?: string; reasoning_content?: string }; finish_reason?: string }>
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
    }>(`${this.info.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${account.authData.apiKey}` },
      body: JSON.stringify(body),
    })

    const resp = this.parseOpenAIResponse(raw, this.info.name, startTime)
    if (raw.choices?.[0]?.message?.reasoning_content) {
      resp.choices[0].message.content = raw.choices[0].message.reasoning_content + '\n' + (raw.choices[0].message.content || '')
    }
    return resp
  }

  async *chatCompletionStream(req: NormalizedRequest, account: ProviderAccount): AsyncIterable<NormalizedChunk> {
    const body = { ...this.createOpenAIRequest(req), stream: true }
    const response = await this.fetchWithRetry(`${this.info.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${account.authData.apiKey}` },
      body: JSON.stringify(body),
    })
    if (!response.body) return
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') return
        try {
          const parsed = JSON.parse(data)
          yield {
            id: parsed.id || '', model: parsed.model || '',
            choices: (parsed.choices || []).map((c: Record<string, unknown>) => ({
              index: (c.index as number) || 0,
              delta: { role: (c.delta as Record<string, unknown>)?.role as 'assistant' | undefined, content: (c.delta as Record<string, unknown>)?.content as string | undefined },
              finishReason: (c.finish_reason as string) || null,
            })),
          }
        } catch { continue }
      }
    }
  }

  async healthCheck(): Promise<{ status: HealthStatusType; latencyMs: number }> {
    const start = Date.now()
    try {
      await fetch(`${this.info.baseUrl}/models`, { method: 'GET', signal: AbortSignal.timeout(10000) })
      return { status: 'healthy', latencyMs: Date.now() - start }
    } catch {
      return { status: 'down', latencyMs: Date.now() - start }
    }
  }
}
