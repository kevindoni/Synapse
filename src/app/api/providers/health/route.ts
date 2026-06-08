import { healthChecker } from '@/lib/health'

export async function GET() {
  try {
    const health = await healthChecker.getProviderHealth()
    return Response.json({ health })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
