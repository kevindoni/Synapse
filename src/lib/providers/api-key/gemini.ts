import { BaseAdapter } from '../base-adapter'
import type { ProviderInfo, ProviderAccount, NormalizedRequest, NormalizedResponse, NormalizedChunk, Model, HealthStatusType } from '../types'

export class GeminiAdapter extends BaseAdapter {
  info: ProviderInfo

  constructor(info?: Partial<ProviderInfo>) {
    super()
    this.info = {
      id: info?.id || 'gemini',
      name: info?.name || 'Gemini',
      prefix: info?.prefix || 'gm/',
      authType: info?.authType || 'api_key',
      baseUrl: info?.baseUrl || 'https://generativelanguage.googleapis.com',
      enabled: info?.enabled ?? true,
    }
  }

  async fetchModels(): Promise<Model[]> {
    try {
      const data = await this.fetchJson<{ models?: Array<{ name: string; displayName?: string; inputTokenLimit?: number; outputTokenLimit?: number }> }>(
        `${this.info.baseUrl}/v1beta/models`,
        { headers: {} }
      )
      return (data.models || [])
        .filter((m) => m.name.includes('gemini'))
        .map((m) => {
          const id = m.name.replace('models/', '')
          return {
            id: `${this.info.prefix}${id}`,
            name: id,
            displayName: m.displayName || id,
            providerId: this.info.id,
            pricingTier: 'pay_per_use' as const,
            contextWindow: m.inputTokenLimit,
            available: true,
          }
        })
    } catch {
      return [
        { id: 'gm/gemini-2.5-flash', name: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash', providerId: this.info.id, pricingTier: 'pay_per_use', contextWindow: 1048576, available: true },
        { id: 'gm/gemini-2.5-pro', name: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro', providerId: this.info.id, pricingTier: 'pay_per_use', contextWindow: 2097152, available: true },
      ]
    }
  }

  async chatCompletion(req: NormalizedRequest, account: ProviderAccount): Promise<NormalizedResponse> {
    const startTime = Date.now()
    const modelName = req.model.replace('gm/', '')
    const contents = req.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

    const systemInstruction = req.messages.find((m) => m.role === 'system')

    const geminiBody: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: req.temperature,
        maxOutputTokens: req.maxTokens,
      },
    }
    if (systemInstruction) {
      geminiBody.systemInstruction = { parts: [{ text: systemInstruction.content }] }
    }

    const raw = await this.fetchJson<{
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }; finishReason?: string }>
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number }
    }>(`${this.info.baseUrl}/v1beta/models/${modelName}:generateContent?key=${account.authData.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    })

    const content = raw.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return {
      id: crypto.randomUUID(),
      model: modelName,
      choices: [{
        index: 0,
        message: { role: 'assistant', content },
        finishReason: raw.candidates?.[0]?.finishReason || 'stop',
      }],
      usage: {
        inputTokens: raw.usageMetadata?.promptTokenCount || 0,
        outputTokens: raw.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: raw.usageMetadata?.totalTokenCount || 0,
      },
      latencyMs: Date.now() - startTime,
      provider: this.info.name,
    }
  }

  async *chatCompletionStream(): AsyncIterable<NormalizedChunk> {
    yield { id: '', model: '', choices: [{ index: 0, delta: { content: 'Streaming not implemented for Gemini adapter yet' }, finishReason: 'stop' }] }
  }

  async healthCheck(): Promise<{ status: HealthStatusType; latencyMs: number }> {
    const start = Date.now()
    try {
      await fetch(`${this.info.baseUrl}/v1beta/models?key=test`, { method: 'GET', signal: AbortSignal.timeout(10000) })
      return { status: 'healthy', latencyMs: Date.now() - start }
    } catch {
      return { status: 'down', latencyMs: Date.now() - start }
    }
  }
}
