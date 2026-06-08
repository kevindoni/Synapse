import type { RequestFeatures, RoutingPrediction, RoutingCandidate } from './features'
import { PriorityStrategy, LatencyStrategy, CostStrategy, RoundRobinStrategy, HybridStrategy } from './strategies'
import { db } from '../db'
import { routerTrainingData } from '../db/schema'
import { sql } from 'drizzle-orm'
import { logger } from '../utils/logger'
import { v4 as uuid } from 'uuid'

type StrategyName = 'priority' | 'latency' | 'cost' | 'round_robin' | 'hybrid'

class NeuralRouter {
  private strategies = new Map<string, PriorityStrategy | LatencyStrategy | CostStrategy | RoundRobinStrategy | HybridStrategy>()
  private defaultStrategy: StrategyName = 'hybrid'

  constructor() {
    this.strategies.set('priority', new PriorityStrategy())
    this.strategies.set('latency', new LatencyStrategy())
    this.strategies.set('cost', new CostStrategy())
    this.strategies.set('round_robin', new RoundRobinStrategy())
    this.strategies.set('hybrid', new HybridStrategy())
  }

  route(features: RequestFeatures, candidates: RoutingCandidate[], strategy?: StrategyName): RoutingPrediction {
    const strat = this.strategies.get(strategy || this.defaultStrategy)
    if (!strat) {
      return this.strategies.get('priority')!.select(features, candidates)
    }
    return strat.select(features, candidates)
  }

  setDefaultStrategy(name: StrategyName) {
    if (this.strategies.has(name)) {
      this.defaultStrategy = name
    }
  }

  getDefaultStrategy(): StrategyName {
    return this.defaultStrategy
  }

  async recordOutcome(data: {
    features: RequestFeatures
    selectedProvider: string
    selectedModel: string
    outcome: 'success' | 'timeout' | 'error' | 'rate_limited'
    latencyMs?: number
    cost?: number
    qualityScore?: number
  }) {
    try {
      await db.insert(routerTrainingData).values({
        id: uuid(),
        features: JSON.stringify(data.features),
        selectedProvider: data.selectedProvider,
        selectedModel: data.selectedModel,
        outcome: data.outcome,
        latencyMs: data.latencyMs ?? null,
        cost: data.cost ?? null,
        qualityScore: data.qualityScore ?? null,
      })
    } catch (err) {
      logger.warn({ error: (err as Error).message }, 'Failed to record routing outcome')
    }
  }

  async getAccuracyStats() {
    try {
      const [total] = await db.select({ count: sql<number>`count(*)` }).from(routerTrainingData)
      const [success] = await db.select({ count: sql<number>`count(*)` }).from(routerTrainingData)
        .where(sql`${routerTrainingData.outcome} = 'success'`)

      const totalRequests = total?.count ?? 0
      const successCount = success?.count ?? 0

      return {
        totalSamples: totalRequests,
        accuracy: totalRequests > 0 ? successCount / totalRequests : 0,
      }
    } catch {
      return { totalSamples: 0, accuracy: 0 }
    }
  }
}

export const neuralRouter = new NeuralRouter()
