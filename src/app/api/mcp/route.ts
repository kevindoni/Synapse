import { registerTool, registerResource, listTools, listResources, callTool, readResource } from '@/lib/mcp/registry'
import { analytics } from '@/lib/analytics'
import { healthChecker } from '@/lib/health'
import { semanticCacheStore } from '@/lib/cache'
import { memoryStore } from '@/lib/memory'
import { experienceDistiller } from '@/lib/distiller'
import { registry } from '@/lib/providers/registry'

let registered = false
function ensureRegistered() {
  if (registered) return
  registered = true

  registerTool({ name: 'get_usage_stats', description: 'Get usage statistics', inputSchema: { type: 'object', properties: { days: { type: 'number' } } }, handler: async (args) => analytics.getUsageStats((args.days as number) || 7) })
  registerTool({ name: 'get_health_status', description: 'Get provider health', inputSchema: { type: 'object', properties: {} }, handler: async () => healthChecker.getProviderHealth() })
  registerTool({ name: 'get_cache_stats', description: 'Get cache statistics', inputSchema: { type: 'object', properties: {} }, handler: async () => semanticCacheStore.getStats() })
  registerTool({ name: 'search_memory', description: 'Search memory', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] }, handler: async (args) => memoryStore.search(args.query as string) })
  registerTool({ name: 'clear_cache', description: 'Clear cache', inputSchema: { type: 'object', properties: {} }, handler: async () => { await semanticCacheStore.clear(); return { success: true } } })
  registerTool({ name: 'trigger_distillation', description: 'Run distillation', inputSchema: { type: 'object', properties: {} }, handler: async () => experienceDistiller.run() })
  registerResource({ uri: 'synapse://config', name: 'Configuration', description: 'Current config', mimeType: 'application/json', read: async () => JSON.stringify({ version: '2.0.0' }) })
  registerResource({ uri: 'synapse://providers', name: 'Providers', description: 'Provider list', mimeType: 'application/json', read: async () => JSON.stringify(registry.list().map((a) => ({ id: a.info.id, name: a.info.name }))) })
}

export async function GET() {
  ensureRegistered()
  return Response.json({ tools: listTools(), resources: listResources() })
}

export async function POST(request: Request) {
  ensureRegistered()
  try {
    const { method, params } = await request.json()

    if (method === 'tools/list') return Response.json({ tools: listTools() })
    if (method === 'tools/call') {
      const result = await callTool(params.name, params.arguments || {})
      return Response.json({ content: [{ type: 'text', text: JSON.stringify(result) }] })
    }
    if (method === 'resources/list') return Response.json({ resources: listResources() })
    if (method === 'resources/read') {
      const content = await readResource(params.uri)
      return Response.json({ contents: [{ uri: params.uri, mimeType: 'application/json', text: content }] })
    }

    return Response.json({ error: `Unknown method: ${method}` }, { status: 400 })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
