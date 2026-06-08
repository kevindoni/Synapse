import { forensicsEngine } from '@/lib/forensics'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const requestId = url.searchParams.get('request_id')

    if (requestId) {
      const report = await forensicsEngine.analyzeRequest(requestId)
      if (!report) return Response.json({ error: 'Request not found' }, { status: 404 })
      return Response.json(report)
    }

    const [failures, slow] = await Promise.all([
      forensicsEngine.getRecentFailures(10),
      forensicsEngine.getSlowRequests(3000, 10),
    ])

    return Response.json({ recentFailures: failures, slowRequests: slow })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
