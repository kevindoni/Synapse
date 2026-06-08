import { db } from '../db'
import { usageDaily, settings } from '../db/schema'
import { sql, and, gte, lte } from 'drizzle-orm'
import { logger } from '../utils/logger'

export interface CostForecast {
  currentMonthSpend: number
  projectedMonthSpend: number
  monthlyBudget: number
  budgetUsedPercent: number
  daysRemaining: number
  dailyBurnRate: number
  daysUntilBudgetExhausted: number
  recommendation: 'normal' | 'cost_saving' | 'budget_conserving' | 'strict_free'
}

export interface ModelCostComparison {
  model: string
  providerId: string
  costPerRequest: number
  avgLatency: number
  qualityScore: number
  valueScore: number
}

class PredictiveCostEngine {
  async getForecast(): Promise<CostForecast> {
    try {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const today = now.toISOString().split('T')[0]
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const daysElapsed = now.getDate()
      const daysRemaining = daysInMonth - daysElapsed

      const [monthStats] = await db.select({
        spend: sql<number>`coalesce(sum(${usageDaily.totalCost}), 0)`,
        requests: sql<number>`coalesce(sum(${usageDaily.totalRequests}), 0)`,
      }).from(usageDaily).where(gte(usageDaily.date, monthStart))

      const currentMonthSpend = Number(monthStats?.spend ?? 0)
      const totalRequests = monthStats?.requests ?? 0
      const dailyBurnRate = daysElapsed > 0 ? currentMonthSpend / daysElapsed : 0
      const projectedMonthSpend = dailyBurnRate * daysInMonth

      let monthlyBudget = 100
      try {
        const [budgetRow] = await db.select().from(settings).where(sql`${settings.key} = 'monthly_budget'`).limit(1)
        if (budgetRow) monthlyBudget = Number(budgetRow.value)
      } catch { /* ignore */ }

      const budgetUsedPercent = monthlyBudget > 0 ? (currentMonthSpend / monthlyBudget) * 100 : 0
      const daysUntilBudgetExhausted = dailyBurnRate > 0 ? Math.floor((monthlyBudget - currentMonthSpend) / dailyBurnRate) : Infinity

      let recommendation: CostForecast['recommendation'] = 'normal'
      if (budgetUsedPercent > 95) recommendation = 'strict_free'
      else if (budgetUsedPercent > 80) recommendation = 'budget_conserving'
      else if (budgetUsedPercent > 60) recommendation = 'cost_saving'

      return {
        currentMonthSpend,
        projectedMonthSpend,
        monthlyBudget,
        budgetUsedPercent,
        daysRemaining,
        dailyBurnRate,
        daysUntilBudgetExhausted: Math.max(daysUntilBudgetExhausted, 0),
        recommendation,
      }
    } catch {
      return {
        currentMonthSpend: 0, projectedMonthSpend: 0, monthlyBudget: 100,
        budgetUsedPercent: 0, daysRemaining: 30, dailyBurnRate: 0,
        daysUntilBudgetExhausted: Infinity, recommendation: 'normal',
      }
    }
  }

  async getModelCostComparison(): Promise<ModelCostComparison[]> {
    try {
      const rows = await db.select({
        model: usageDaily.model,
        provider: usageDaily.providerId,
        totalCost: sql<number>`coalesce(sum(${usageDaily.totalCost}), 0)`,
        totalRequests: sql<number>`coalesce(sum(${usageDaily.totalRequests}), 0)`,
      }).from(usageDaily)
        .where(sql`${usageDaily.model} IS NOT NULL`)
        .groupBy(usageDaily.model, usageDaily.providerId)

      return rows.map((r) => ({
        model: r.model || '',
        providerId: r.provider || '',
        costPerRequest: r.totalRequests > 0 ? Number(r.totalCost) / r.totalRequests : 0,
        avgLatency: 0,
        qualityScore: 0,
        valueScore: r.totalRequests > 0 ? (1 / (Number(r.totalCost) / r.totalRequests + 0.001)) : 0,
      }))
    } catch {
      return []
    }
  }

  async setBudget(amount: number) {
    try {
      await db.insert(settings).values({ key: 'monthly_budget', value: String(amount) })
        .onConflictDoUpdate({ target: settings.key, set: { value: String(amount) } })
    } catch (err) {
      logger.warn({ error: (err as Error).message }, 'Failed to set budget')
    }
  }
}

export const costEngine = new PredictiveCostEngine()
