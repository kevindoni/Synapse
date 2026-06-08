import { costEngine } from '@/lib/prediction'

export async function GET() {
  try {
    const [forecast, modelComparison] = await Promise.all([
      costEngine.getForecast(),
      costEngine.getModelCostComparison(),
    ])
    return Response.json({ forecast, modelComparison })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
