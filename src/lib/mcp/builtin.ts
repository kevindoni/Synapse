import { registerTool, registerResource } from './registry'
import { analytics } from '../analytics'
import { memoryStore } from '../memory'
import { semanticCacheStore } from '../cache'
import { healthChecker } from '../health'

registerTool({
  name: 'get_usage_stats',
  description: 'Get usage statistics for the last N days',
  inputSchema: {
    type: 'object',
    properties: { days: { type: 'number', description: 'Number of days (default: 7)' } },
  },
  handler: async (args) => analytics.getUsageStats((args.days as number) || 7),
})

registerTool({
  name: 'get_health_status',
  description: 'Get health status of all providers',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => healthChecker.getProviderHealth(),
})

registerTool({
  name: 'get_cache_stats',
  description: 'Get semantic cache statistics',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => semanticCacheStore.getStats(),
})

registerTool({
  name: 'search_memory',
  description: 'Search persistent memory for information',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' },
      types: { type: 'array', items: { type: 'string' }, description: 'Memory types to search' },
    },
    required: ['query'],
  },
  handler: async (args) => memoryStore.search(args.query as string, args.types as import('../memory/types').MemoryType[] | undefined),
})

registerTool({
  name: 'clear_cache',
  description: 'Clear the semantic cache',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => { await semanticCacheStore.clear(); return { success: true } },
})

registerTool({
  name: 'trigger_distillation',
  description: 'Trigger experience distillation run',
  inputSchema: { type: 'object', properties: {} },
  handler: async () => {
    const { experienceDistiller } = await import('../distiller')
    return experienceDistiller.run()
  },
})

registerResource({
  uri: 'synapse://config',
  name: 'Synapse Configuration',
  description: 'Current gateway configuration',
  mimeType: 'application/json',
  read: async () => {
    const { loadConfig } = await import('../config')
    const config = await loadConfig()
    return JSON.stringify(config, null, 2)
  },
})

registerResource({
  uri: 'synapse://providers',
  name: 'Provider List',
  description: 'List of registered providers',
  mimeType: 'application/json',
  read: async () => {
    const { registry } = await import('../providers/registry')
    return JSON.stringify(registry.list().map((a) => ({ id: a.info.id, name: a.info.name, prefix: a.info.prefix })), null, 2)
  },
})
