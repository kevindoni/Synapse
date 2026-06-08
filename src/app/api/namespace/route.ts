import { namespaceResolver } from '@/lib/namespace'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const model = url.searchParams.get('model')
    const task = url.searchParams.get('task')

    const aliases = namespaceResolver.listAliases()

    if (model) {
      const resolved = namespaceResolver.resolve(model)
      return Response.json({ input: model, resolved })
    }

    if (task) {
      const models = namespaceResolver.resolveForTask(task as 'code' | 'chat' | 'reason')
      return Response.json({ task, models })
    }

    return Response.json({ aliases })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
