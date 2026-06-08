import { experienceDistiller } from '@/lib/distiller'

export async function POST() {
  try {
    const result = await experienceDistiller.run()
    return Response.json(result)
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
