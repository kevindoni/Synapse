import type { NormalizedRequest, NormalizedResponse, ProviderAccount, ProviderAdapter, HealthStatusType } from '../providers/types'
import { logger } from '../utils/logger'

export interface FallbackOptions {
  maxRetries: number
  retryDelayMs: number
  timeoutMs: number
  retryOnStatusCodes: number[]
  retryOnErrors: string[]
  healthThreshold: HealthStatusType
  preferCostOverLatency: boolean
}

export const DEFAULT_FALLBACK_OPTIONS: FallbackOptions = {
  maxRetries: 3,
  retryDelayMs: 1000,
  timeoutMs: 30000,
  retryOnStatusCodes: [429, 500, 502, 503, 504],
  retryOnErrors: ['timeout', 'rate_limit', 'overloaded', 'context_length_exceeded'],
  healthThreshold: 'healthy',
  preferCostOverLatency: false,
}

interface FallbackCandidate {
  adapter: ProviderAdapter
  account: ProviderAccount
  priority: number
  cost: number
  latency: number
  health: HealthStatusType
}

export class FallbackEngine {
  private options: FallbackOptions

  constructor(options?: Partial<FallbackOptions>) {
    this.options = { ...DEFAULT_FALLBACK_OPTIONS, ...options }
  }

  async executeWithFallback(
    req: NormalizedRequest,
    candidates: FallbackCandidate[],
  ): Promise<{
    response: NormalizedResponse
    provider: string
    model: string
    fallbackUsed: boolean
    fallbackChain: string[]
    attempts: number
  }> {
    const sorted = this.rankCandidates(candidates)
    const fallbackChain: string[] = []

    for (let attempt = 0; attempt < sorted.length; attempt++) {
      const candidate = sorted[attempt]
      const { adapter, account } = candidate

      if (!account.enabled) {
        fallbackChain.push(`${adapter.info.name}: account disabled`)
        continue
      }

      if (!this.isHealthyEnough(candidate.health)) {
        fallbackChain.push(`${adapter.info.name}: unhealthy (${candidate.health})`)
        continue
      }

      try {
        const response = await this.executeWithTimeout(adapter, req, account)
        return {
          response,
          provider: adapter.info.name,
          model: req.model,
          fallbackUsed: attempt > 0,
          fallbackChain,
          attempts: attempt + 1,
        }
      } catch (err) {
        const errorMsg = (err as Error).message
        fallbackChain.push(`${adapter.info.name}: ${errorMsg}`)
        logger.warn(
          { provider: adapter.info.name, attempt: attempt + 1, error: errorMsg, model: req.model },
          'Fallback: provider failed',
        )

        if (this.isRetryableError(errorMsg) && attempt < this.options.maxRetries - 1) {
          const delay = this.options.retryDelayMs * Math.pow(2, attempt)
          await this.sleep(delay)
          attempt--
        }
      }
    }

    throw new FallbackExhaustedError(
      `All ${sorted.length} providers failed for model "${req.model}"`,
      fallbackChain,
    )
  }

  private rankCandidates(candidates: FallbackCandidate[]): FallbackCandidate[] {
    return [...candidates].sort((a, b) => {
      const healthOrder: Record<HealthStatusType, number> = { healthy: 0, degraded: 1, down: 2, disabled: 3 }
      const healthDiff = (healthOrder[a.health] ?? 99) - (healthOrder[b.health] ?? 99)
      if (healthDiff !== 0) return healthDiff

      const priorityDiff = a.priority - b.priority
      if (priorityDiff !== 0) return priorityDiff

      if (this.options.preferCostOverLatency) {
        return a.cost - b.cost
      }
      return a.latency - b.latency
    })
  }

  private isHealthyEnough(health: HealthStatusType): boolean {
    const order: Record<HealthStatusType, number> = { healthy: 0, degraded: 1, down: 2, disabled: 3 }
    const threshold = order[this.options.healthThreshold] ?? 0
    return (order[health] ?? 99) <= threshold
  }

  private isRetryableError(errorMsg: string): boolean {
    const lower = errorMsg.toLowerCase()
    return this.options.retryOnErrors.some((e) => lower.includes(e))
  }

  private async executeWithTimeout(
    adapter: ProviderAdapter,
    req: NormalizedRequest,
    account: ProviderAccount,
  ): Promise<NormalizedResponse> {
    return Promise.race([
      adapter.chatCompletion(req, account),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${this.options.timeoutMs}ms`)), this.options.timeoutMs),
      ),
    ])
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export class FallbackExhaustedError extends Error {
  fallbackChain: string[]

  constructor(message: string, fallbackChain: string[]) {
    super(message)
    this.name = 'FallbackExhaustedError'
    this.fallbackChain = fallbackChain
  }
}
