import { skillRegistry } from '@/lib/skills/registry'
import { skillForge } from '@/lib/skills/forge'

export async function GET() {
  try {
    const skills = await skillRegistry.listSkills()
    const groups = await skillRegistry.listGroups()
    return Response.json({ skills, groups })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (body.action === 'create') {
      const skillId = await skillForge.createFromRecipe({
        name: body.name,
        description: body.description || '',
        basePrompt: body.systemPrompt,
        examples: body.examples || [],
        constraints: body.constraints,
        preferredModel: body.preferredModel,
      })
      return Response.json({ success: true, skillId })
    }

    if (body.action === 'import_openclaw') {
      const skillId = await skillForge.importFromOpenClaw(body)
      return Response.json({ success: true, skillId })
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
