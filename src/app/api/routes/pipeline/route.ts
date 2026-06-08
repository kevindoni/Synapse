import { pipelineEngine } from '@/lib/pipeline'

export async function GET() {
  try {
    const pipelines = await pipelineEngine.list()
    return Response.json({ pipelines })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const id = await pipelineEngine.create(body)
    return Response.json({ success: true, id })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
