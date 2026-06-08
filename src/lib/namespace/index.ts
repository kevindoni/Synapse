export type TaskType = 'code' | 'chat' | 'reason' | 'review' | 'debug' | 'doc' | 'translate' | 'fast' | 'creative' | 'math'

export interface NamespaceAlias {
  alias: string
  resolvesTo: string
  description: string
  taskTypes: TaskType[]
}

export const BUILTIN_ALIASES: NamespaceAlias[] = [
  { alias: 'best', resolvesTo: 'an/claude-sonnet-4', description: 'Best overall model', taskTypes: ['code', 'chat', 'reason'] },
  { alias: 'fast', resolvesTo: 'oa/gpt-4o-mini', description: 'Fastest response', taskTypes: ['fast', 'chat'] },
  { alias: 'smart', resolvesTo: 'an/claude-opus-4-7', description: 'Most capable', taskTypes: ['reason', 'code', 'review'] },
  { alias: 'cheap', resolvesTo: 'ds/deepseek-chat', description: 'Cheapest option', taskTypes: ['chat', 'doc', 'translate'] },
  { alias: 'code', resolvesTo: 'an/claude-sonnet-4', description: 'Best for code generation', taskTypes: ['code', 'debug', 'review'] },
  { alias: 'reason', resolvesTo: 'oa/o3', description: 'Best for reasoning', taskTypes: ['reason', 'math'] },
  { alias: 'creative', resolvesTo: 'an/claude-sonnet-4', description: 'Best for creative writing', taskTypes: ['creative'] },
  { alias: 'long', resolvesTo: 'gm/gemini-2.5-pro', description: 'Best for long context (1M tokens)', taskTypes: ['chat', 'doc', 'review'] },
]

export const TASK_TYPE_MODELS: Record<TaskType, string[]> = {
  code: ['an/claude-sonnet-4', 'oa/gpt-4o', 'ds/deepseek-chat'],
  chat: ['oa/gpt-4o-mini', 'an/claude-haiku-3.5', 'gm/gemini-2.5-flash'],
  reason: ['oa/o3', 'an/claude-opus-4-7', 'ds/deepseek-reasoner'],
  review: ['an/claude-sonnet-4', 'oa/gpt-4o', 'an/claude-opus-4-7'],
  debug: ['an/claude-sonnet-4', 'oa/gpt-4o', 'ds/deepseek-chat'],
  doc: ['oa/gpt-4o-mini', 'an/claude-haiku-3.5', 'gm/gemini-2.5-flash'],
  translate: ['oa/gpt-4o-mini', 'ds/deepseek-chat', 'gm/gemini-2.5-flash'],
  fast: ['oa/gpt-4o-mini', 'an/claude-haiku-3.5', 'gm/gemini-2.5-flash'],
  creative: ['an/claude-sonnet-4', 'oa/gpt-4o', 'gm/gemini-2.5-pro'],
  math: ['oa/o3', 'ds/deepseek-reasoner', 'oa/o3-mini'],
}

class NamespaceResolver {
  private aliases = new Map<string, NamespaceAlias>()
  private customAliases = new Map<string, NamespaceAlias>()

  constructor() {
    for (const alias of BUILTIN_ALIASES) {
      this.aliases.set(alias.alias, alias)
    }
  }

  resolve(modelId: string): string[] {
    const lower = modelId.toLowerCase().trim()

    const builtin = this.aliases.get(lower)
    if (builtin) return [builtin.resolvesTo]

    const custom = this.customAliases.get(lower)
    if (custom) return [custom.resolvesTo]

    if (lower.includes('/')) return [modelId]

    return [modelId]
  }

  resolveForTask(taskType: TaskType): string[] {
    return TASK_TYPE_MODELS[taskType] || TASK_TYPE_MODELS.chat
  }

  detectTaskType(content: string): TaskType {
    const lower = content.toLowerCase()

    if (/(?:function|class|import |export |const |async |return |=>|```)/.test(lower)) return 'code'
    if (/(?:explain why|reason about|prove|logical|deduce)/.test(lower)) return 'reason'
    if (/(?:review|feedback|critique|improve)/.test(lower)) return 'review'
    if (/(?:bug|error|fix|debug|stack trace|exception)/.test(lower)) return 'debug'
    if (/(?:document|docs|readme|explain how|tutorial)/.test(lower)) return 'doc'
    if (/(?:translate|traducir| Übersetzen)/.test(lower)) return 'translate'
    if (/(?:write|story|poem|creative|imagine)/.test(lower)) return 'creative'
    if (/(?:calcul|solve|equation|math|integral)/.test(lower)) return 'math'
    return 'chat'
  }

  addAlias(alias: NamespaceAlias) {
    this.customAliases.set(alias.alias, alias)
  }

  removeAlias(alias: string) {
    this.customAliases.delete(alias)
  }

  listAliases(): NamespaceAlias[] {
    return [...this.aliases.values(), ...this.customAliases.values()]
  }
}

export const namespaceResolver = new NamespaceResolver()
