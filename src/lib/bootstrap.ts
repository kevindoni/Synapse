import { registry } from './providers/registry'
import { OpenAIAdapter } from './providers/api-key/openai'
import { AnthropicAdapter } from './providers/api-key/anthropic'
import { DeepSeekAdapter } from './providers/api-key/deepseek'
import { OpenRouterAdapter } from './providers/api-key/openrouter'
import { GeminiAdapter } from './providers/api-key/gemini'
import { migrate } from './db/migrate'
import { experienceDistiller } from './distiller'
import { healthChecker } from './health'
import { logger } from './utils/logger'
import { registerTool, registerResource } from './mcp/registry'
import { pluginManager } from './plugins/index'
import { analytics } from './analytics'
import { memoryStore } from './memory'
import { semanticCacheStore } from './cache'
import type { Plugin, PluginContext } from './plugins/index'

function registerMCPTools() {
  registerTool({
    name: 'get_usage_stats',
    description: 'Get usage statistics',
    inputSchema: { type: 'object', properties: { days: { type: 'number' } } },
    handler: async (args) => analytics.getUsageStats((args.days as number) || 7),
  })
  registerTool({
    name: 'get_health_status',
    description: 'Get provider health',
    inputSchema: { type: 'object', properties: {} },
    handler: async () => healthChecker.getProviderHealth(),
  })
  registerTool({
    name: 'get_cache_stats',
    description: 'Get cache statistics',
    inputSchema: { type: 'object', properties: {} },
    handler: async () => semanticCacheStore.getStats(),
  })
  registerTool({
    name: 'search_memory',
    description: 'Search memory',
    inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
    handler: async (args) => memoryStore.search(args.query as string),
  })
  registerTool({
    name: 'clear_cache',
    description: 'Clear cache',
    inputSchema: { type: 'object', properties: {} },
    handler: async () => { await semanticCacheStore.clear(); return { success: true } },
  })
  registerTool({
    name: 'trigger_distillation',
    description: 'Run distillation',
    inputSchema: { type: 'object', properties: {} },
    handler: async () => experienceDistiller.run(),
  })
  registerResource({
    uri: 'synapse://config',
    name: 'Configuration',
    description: 'Current config',
    mimeType: 'application/json',
    read: async () => JSON.stringify({ version: '2.0.0' }),
  })
  registerResource({
    uri: 'synapse://providers',
    name: 'Providers',
    description: 'Provider list',
    mimeType: 'application/json',
    read: async () => JSON.stringify(registry.list().map((a) => ({ id: a.info.id, name: a.info.name }))),
  })
}

function registerPlugins() {
  pluginManager.register({
    name: 'pii-redactor',
    description: 'Redacts PII (SSN, email, phone)',
    phase: 'pre_request',
    execute: async (ctx: PluginContext) => {
      let content = ctx.content
      content = content.replace(/\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g, '[REDACTED]')
      content = content.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[REDACTED]')
      content = content.replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[REDACTED]')
      return { modified: content !== ctx.content, content }
    },
  })
  pluginManager.register({
    name: 'response-validator',
    description: 'Validates response quality',
    phase: 'post_response',
    execute: async (ctx: PluginContext) => {
      const valid = ctx.content.trim().length > 0
      return { modified: false, content: ctx.content, metadata: { validation: { valid } } }
    },
  })
}

export async function bootstrap() {
  logger.info('Bootstrapping Synapse...')

  await migrate()

  const builtInProviders = [
    new OpenAIAdapter(),
    new AnthropicAdapter(),
    new GeminiAdapter(),
    new DeepSeekAdapter(),
    new OpenRouterAdapter(),
  ]

  for (const adapter of builtInProviders) {
    registry.register(adapter)
  }

  logger.info({ providers: builtInProviders.length }, 'Providers registered')

  registerMCPTools()
  registerPlugins()
  logger.info('MCP tools and plugins registered')

  healthChecker.start(5 * 60 * 1000)
  experienceDistiller.start()

  logger.info('Synapse bootstrap complete')
}
