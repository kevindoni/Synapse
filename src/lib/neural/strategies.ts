import type { RequestFeatures, RoutingPrediction, RoutingStrategy, RoutingCandidate } from './features'

export class PriorityStrategy implements RoutingStrategy {
  name = 'priority'
  select(_features: RequestFeatures, candidates: RoutingCandidate[]): RoutingPrediction {
    const sorted = [...candidates].sort((a, b) => {
      if (a.health !== b.health) return b.health - a.health
      return a.cost - b.cost
    })
    const best = sorted[0]
    return {
      provider: best.providerId,
      model: best.model,
      confidence: 0.5,
      expectedLatencyMs: best.latency,
      expectedCost: best.cost,
      strategy: 'rule_based',
    }
  }
}

export class LatencyStrategy implements RoutingStrategy {
  name = 'latency'
  select(_features: RequestFeatures, candidates: RoutingCandidate[]): RoutingPrediction {
    const healthy = candidates.filter((c) => c.health > 0.5)
    const sorted = [...(healthy.length > 0 ? healthy : candidates)].sort((a, b) => a.latency - b.latency)
    const best = sorted[0]
    return {
      provider: best.providerId,
      model: best.model,
      confidence: 0.6,
      expectedLatencyMs: best.latency,
      expectedCost: best.cost,
      strategy: 'rule_based',
    }
  }
}

export class CostStrategy implements RoutingStrategy {
  name = 'cost'
  select(_features: RequestFeatures, candidates: RoutingCandidate[]): RoutingPrediction {
    const healthy = candidates.filter((c) => c.health > 0.5)
    const sorted = [...(healthy.length > 0 ? healthy : candidates)].sort((a, b) => a.cost - b.cost)
    const best = sorted[0]
    return {
      provider: best.providerId,
      model: best.model,
      confidence: 0.6,
      expectedLatencyMs: best.latency,
      expectedCost: best.cost,
      strategy: 'rule_based',
    }
  }
}

export class RoundRobinStrategy implements RoutingStrategy {
  name = 'round_robin'
  private counter = 0
  select(_features: RequestFeatures, candidates: RoutingCandidate[]): RoutingPrediction {
    const idx = this.counter % candidates.length
    this.counter++
    const pick = candidates[idx]
    return {
      provider: pick.providerId,
      model: pick.model,
      confidence: 0.4,
      expectedLatencyMs: pick.latency,
      expectedCost: pick.cost,
      strategy: 'rule_based',
    }
  }
}

export class HybridStrategy implements RoutingStrategy {
  name = 'hybrid'

  constructor(
    private neuralWeight = 0.6,
    private ruleWeight = 0.4,
  ) {}

  select(features: RequestFeatures, candidates: RoutingCandidate[]): RoutingPrediction {
    const scored = candidates.map((c) => {
      const healthScore = c.health
      const latencyScore = 1 - Math.min(c.latency / 5000, 1)
      const costScore = 1 - Math.min(c.cost / 0.1, 1)
      const successScore = c.successRate

      const neuralBonus = this.getNeuralBonus(features, c)
      const ruleScore = (healthScore * 0.3 + latencyScore * 0.3 + costScore * 0.2 + successScore * 0.2)
      const finalScore = ruleScore * this.ruleWeight + neuralBonus * this.neuralWeight

      return { candidate: c, score: finalScore }
    })

    scored.sort((a, b) => b.score - a.score)
    const best = scored[0]

    const confidence = Math.min(best.score, 0.95)
    const strategy: 'neural' | 'hybrid' | 'rule_based' = confidence > 0.8 ? 'neural' : confidence > 0.5 ? 'hybrid' : 'rule_based'

    return {
      provider: best.candidate.providerId,
      model: best.candidate.model,
      confidence,
      expectedLatencyMs: best.candidate.latency,
      expectedCost: best.candidate.cost,
      strategy,
    }
  }

  private getNeuralBonus(features: RequestFeatures, candidate: RoutingCandidate): number {
    let bonus = 0.5

    if (features.hasCode && candidate.providerId.includes('anthropic')) bonus += 0.15
    if (features.hasCode && candidate.providerId.includes('openai')) bonus += 0.1
    if (features.taskType === 'reason' && candidate.providerId.includes('openai')) bonus += 0.15
    if (features.contextFillRatio > 0.8 && candidate.providerId.includes('gemini')) bonus += 0.2
    if (features.temperature < 0.3 && candidate.providerId.includes('openai')) bonus += 0.1
    if (features.hourOfDay >= 9 && features.hourOfDay <= 17 && candidate.cost < 0.005) bonus += 0.05

    return Math.min(bonus, 1)
  }
}
