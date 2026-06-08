import { benchmarkEngine } from '@/lib/benchmark'

export async function GET() {
  try {
    const [comparisons, recent] = await Promise.all([
      benchmarkEngine.compareModels(),
      benchmarkEngine.getRecentBenchmarks(20),
    ])
    return Response.json({ comparisons, recent })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
