export interface Plugin {
  name: string
  description: string
  phase: 'pre_request' | 'post_response' | 'both'
  execute: (context: PluginContext) => Promise<PluginResult>
}

export interface PluginContext {
  type: 'request' | 'response'
  content: string
  model: string
  provider: string
  metadata: Record<string, unknown>
}

export interface PluginResult {
  modified: boolean
  content: string
  metadata?: Record<string, unknown>
}

class PluginManager {
  private plugins = new Map<string, Plugin>()

  register(plugin: Plugin) {
    this.plugins.set(plugin.name, plugin)
  }

  unregister(name: string) {
    this.plugins.delete(name)
  }

  async executePhase(phase: 'pre_request' | 'post_response', context: PluginContext): Promise<PluginContext> {
    let current = context

    for (const plugin of this.plugins.values()) {
      if (plugin.phase !== phase && plugin.phase !== 'both') continue

      try {
        const result = await plugin.execute(current)
        if (result.modified) {
          current = {
            ...current,
            content: result.content,
            metadata: { ...current.metadata, ...result.metadata },
          }
        }
      } catch {
        // plugin error doesn't stop pipeline
      }
    }

    return current
  }

  list(): Array<{ name: string; description: string; phase: string }> {
    return Array.from(this.plugins.values()).map((p) => ({
      name: p.name,
      description: p.description,
      phase: p.phase,
    }))
  }
}

export const pluginManager = new PluginManager()
