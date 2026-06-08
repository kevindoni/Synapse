import type { ProviderAdapter, MeshProvider, ProviderAccount, Model } from './types'

class ProviderRegistry {
  private adapters = new Map<string, ProviderAdapter>()

  register(adapter: ProviderAdapter): void {
    this.adapters.set(adapter.info.prefix, adapter)
  }

  unregister(prefix: string): void {
    this.adapters.delete(prefix)
  }

  get(prefix: string): ProviderAdapter | undefined {
    return this.adapters.get(prefix)
  }

  list(): ProviderAdapter[] {
    return Array.from(this.adapters.values())
  }

  resolveModel(modelId: string): { adapter: ProviderAdapter; modelName: string } | null {
    const slashIndex = modelId.indexOf('/')
    if (slashIndex === -1) return null

    const prefix = modelId.substring(0, slashIndex) + '/'
    const modelName = modelId.substring(slashIndex + 1)

    const adapter = this.adapters.get(prefix)
    if (!adapter) return null

    return { adapter, modelName }
  }

  resolveAllProviders(modelName: string): Array<{ adapter: ProviderAdapter; localName: string }> {
    const results: Array<{ adapter: ProviderAdapter; localName: string }> = []

    for (const adapter of this.adapters.values()) {
      results.push({ adapter, localName: modelName })
    }

    return results
  }
}

export const registry = new ProviderRegistry()
