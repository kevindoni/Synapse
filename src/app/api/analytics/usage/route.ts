import { analytics } from '@/lib/analytics'

export async function GET() {
  try {
    const [stats, timeSeries, providerPerf, topModels] = await Promise.all([
      analytics.getUsageStats(7),
      analytics.getUsageTimeSeries(30),
      analytics.getProviderPerformance(),
      analytics.getTopModels(10),
    ])

    return Response.json({ stats, timeSeries, providerPerformance: providerPerf, topModels })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
