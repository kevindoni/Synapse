import { registry } from '../providers/registry'
import type { NormalizedRequest, NormalizedResponse, ProviderAccount } from '../providers/types'
import { logger } from '../utils/logger'

export interface RouteResult {
  response: NormalizedResponse
  provider: string
  model: string
  fallbackUsed: boolean
  fallbackChain?: string[]
}

export async function routeRequest(
  req: NormalizedRequest,
  getAccount: (providerId: string) => ProviderAccount | null
): Promise<RouteResult> {
  const resolved = registry.resolveModel(req.model)
  if (!resolved) {
    if (req.model.includes('/')) {
      throw new Error(`No provider found for model: ${req.model}`)
    }
    const adapters = registry.list()
    if (adapters.length === 0) {
      throw new Error('No providers registered')
    }
    const fallbackChain: string[] = []
    for (const adapter of adapters) {
      const account = getAccount(adapter.info.id)
      if (!account || !account.enabled) continue
      try {
        const modifiedReq = { ...req, model: req.model }
        const response = await adapter.chatCompletion(modifiedReq, account)
        return { response, provider: adapter.info.name, model: req.model, fallbackUsed: true, fallbackChain }
      } catch (err) {
        fallbackChain.push(`${adapter.info.name}: ${(err as Error).message}`)
        logger.warn({ provider: adapter.info.name, error: (err as Error).message }, 'Provider failed, trying next')
      }
    }
    throw new Error(`All providers failed: ${fallbackChain.join(' | ')}`)
  }

  const { adapter, modelName } = resolved
  const account = getAccount(adapter.info.id)
  if (!account || !account.enabled) {
    throw new Error(`No enabled account for provider: ${adapter.info.name}`)
  }

  const modifiedReq = { ...req, model: modelName }
  const response = await adapter.chatCompletion(modifiedReq, account)

  return {
    response,
    provider: adapter.info.name,
    model: req.model,
    fallbackUsed: false,
  }
}

export async function routeRequestStream(
  req: NormalizedRequest,
  getAccount: (providerId: string) => ProviderAccount | null
): Promise<AsyncIterable<import('../providers/types').NormalizedChunk> & { provider: string; model: string }> {
  const resolved = registry.resolveModel(req.model)
  if (!resolved) {
    throw new Error(`No provider found for model: ${req.model}`)
  }

  const { adapter, modelName } = resolved
  const account = getAccount(adapter.info.id)
  if (!account || !account.enabled) {
    throw new Error(`No enabled account for provider: ${adapter.info.name}`)
  }

  const modifiedReq = { ...req, model: modelName }
  const stream = adapter.chatCompletionStream(modifiedReq, account)

  return {
    ...stream,
    provider: adapter.info.name,
    model: req.model,
  }
}
