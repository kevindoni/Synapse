import { neuralRouter } from '@/lib/neural'

export async function GET() {
  try {
    const stats = await neuralRouter.getAccuracyStats()
    return Response.json({
      defaultStrategy: neuralRouter.getDefaultStrategy(),
      ...stats,
    })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { strategy } = await request.json()
    neuralRouter.setDefaultStrategy(strategy)
    return Response.json({ success: true, strategy })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
