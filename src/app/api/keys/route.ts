import { generateApiKey, listApiKeys, revokeApiKey } from '@/lib/auth'

export async function GET() {
  try {
    const keys = await listApiKeys()
    return Response.json({ keys })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    if (!name) return Response.json({ error: 'name is required' }, { status: 400 })

    const result = await generateApiKey(name)
    return Response.json(result)
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

    await revokeApiKey(id)
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
