import type {
  ProviderAdapter,
  ProviderInfo,
  ProviderAccount,
  NormalizedRequest,
  NormalizedResponse,
  NormalizedChunk,
  Model,
  HealthStatusType,
  Message,
} from './types'

export abstract class BaseAdapter implements ProviderAdapter {
  abstract info: ProviderInfo

  protected timeout = 30000
  protected maxRetries = 3

  abstract fetchModels(): Promise<Model[]>
  abstract chatCompletion(req: NormalizedRequest, account: ProviderAccount): Promise<NormalizedResponse>
  abstract chatCompletionStream(req: NormalizedRequest, account: ProviderAccount): AsyncIterable<NormalizedChunk>
  abstract healthCheck(): Promise<{ status: HealthStatusType; latencyMs: number }>

  protected async fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = this.maxRetries
  ): Promise<Response> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (response.status === 429 && attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }

        return response
      } catch (error) {
        lastError = error as Error
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 500
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error('Request failed after retries')
  }

  protected async fetchJson<T>(url: string, options: RequestInit): Promise<T> {
    const response = await this.fetchWithRetry(url, options)
    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status}: ${body}`)
    }
    return response.json() as Promise<T>
  }

  protected createOpenAIRequest(req: NormalizedRequest): Record<string, unknown> {
    const body: Record<string, unknown> = {
      model: req.model,
      messages: req.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: req.stream ?? false,
    }

    if (req.temperature !== undefined) body.temperature = req.temperature
    if (req.maxTokens !== undefined) body.max_tokens = req.maxTokens
    if (req.tools) body.tools = req.tools

    return body
  }

  protected parseOpenAIResponse(raw: {
    id?: string
    model?: string
    choices?: Array<{
      index?: number
      message?: { role?: string; content?: string; tool_calls?: unknown[] }
      finish_reason?: string
    }>
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
  }, providerName: string, startTime: number): NormalizedResponse {
    const message: Message = {
      role: 'assistant',
      content: raw.choices?.[0]?.message?.content || '',
    }

    return {
      id: raw.id || crypto.randomUUID(),
      model: raw.model || '',
      choices: [
        {
          index: raw.choices?.[0]?.index || 0,
          message,
          finishReason: raw.choices?.[0]?.finish_reason || 'stop',
        },
      ],
      usage: {
        inputTokens: raw.usage?.prompt_tokens || 0,
        outputTokens: raw.usage?.completion_tokens || 0,
        totalTokens: raw.usage?.total_tokens || 0,
      },
      latencyMs: Date.now() - startTime,
      provider: providerName,
    }
  }
}
