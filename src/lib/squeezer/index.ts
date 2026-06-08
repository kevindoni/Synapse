export type CompressionLevel = 'none' | 'light' | 'balanced' | 'aggressive'

export interface SqueezeResult {
  originalTokens: number
  squeezedTokens: number
  savingsPercent: number
  level: CompressionLevel
  filters: string[]
}

export interface SqueezeContext {
  content: string
  contentType: 'code' | 'text' | 'mixed'
  contextWindow: number
  usedTokens: number
  targetTokens?: number
}

const CODE_PATTERNS = /(?:function|class|const |let |var |import |export |def |async |return |=>|```|\{|\}|\[|\])/
const COMMENT_PATTERNS = /(?:\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm
const WHITESPACE_MULTI = /\n{3,}/g
const TRAILING_WS = /[ \t]+$/gm
const EMPTY_LINES = /^\s*\n/gm
const CONSOLE_LOG = /console\.(log|debug|info|warn|error)\([^)]*\);?\n?/g
const TYPE_IMPORTS = /^import\s+type\s+.*$;\s*$/gm
const EMPTY_BLOCKS = /\{\s*\}/g

function classifyContent(content: string): 'code' | 'text' | 'mixed' {
  const lines = content.split('\n')
  let codeLines = 0
  let textLines = 0

  for (const line of lines) {
    if (CODE_PATTERNS.test(line)) codeLines++
    else if (line.trim()) textLines++
  }

  if (codeLines > textLines * 2) return 'code'
  if (textLines > codeLines * 2) return 'text'
  return 'mixed'
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

function removeComments(content: string): string {
  return content.replace(COMMENT_PATTERNS, '')
}

function collapseWhitespace(content: string): string {
  return content
    .replace(TRAILING_WS, '')
    .replace(WHITESPACE_MULTI, '\n\n')
}

function removeConsoleLogs(content: string): string {
  return content.replace(CONSOLE_LOG, '')
}

function removeTypeImports(content: string): string {
  return content.replace(TYPE_IMPORTS, '')
}

function collapseEmptyBlocks(content: string): string {
  return content.replace(EMPTY_BLOCKS, '{}')
}

function removeEmptyLines(content: string): string {
  return content.replace(EMPTY_LINES, '')
}

function smartTruncate(content: string, targetTokens: number): string {
  const currentTokens = estimateTokens(content)
  if (currentTokens <= targetTokens) return content

  const ratio = targetTokens / currentTokens
  const targetChars = Math.floor(content.length * ratio)

  const lines = content.split('\n')
  const result: string[] = []
  let charCount = 0

  for (const line of lines) {
    if (charCount + line.length > targetChars) break
    result.push(line)
    charCount += line.length + 1
  }

  return result.join('\n')
}

export function squeeze(ctx: SqueezeContext, level: CompressionLevel = 'balanced'): SqueezeResult {
  const originalTokens = estimateTokens(ctx.content)
  if (level === 'none') {
    return { originalTokens, squeezedTokens: originalTokens, savingsPercent: 0, level: 'none', filters: [] }
  }

  let content = ctx.content
  const contentType = classifyContent(content)
  const appliedFilters: string[] = []

  if (level === 'light') {
    content = collapseWhitespace(content)
    appliedFilters.push('collapse_whitespace')
  }

  if (level === 'balanced' || level === 'aggressive') {
    content = collapseWhitespace(content)
    appliedFilters.push('collapse_whitespace')

    if (contentType === 'code' || contentType === 'mixed') {
      content = removeComments(content)
      appliedFilters.push('remove_comments')

      content = removeConsoleLogs(content)
      appliedFilters.push('remove_console_logs')
    }

    if (level === 'balanced') {
      content = collapseEmptyBlocks(content)
      appliedFilters.push('collapse_empty_blocks')
    }
  }

  if (level === 'aggressive') {
    if (contentType === 'code' || contentType === 'mixed') {
      content = removeTypeImports(content)
      appliedFilters.push('remove_type_imports')

      content = removeEmptyLines(content)
      appliedFilters.push('remove_empty_lines')
    }

    const contextRemaining = ctx.contextWindow - ctx.usedTokens
    const targetTokens = Math.min(
      ctx.targetTokens || contextRemaining,
      contextRemaining,
    )

    if (estimateTokens(content) > targetTokens) {
      content = smartTruncate(content, targetTokens)
      appliedFilters.push('smart_truncate')
    }
  }

  const squeezedTokens = estimateTokens(content)
  const savingsPercent = originalTokens > 0 ? ((originalTokens - squeezedTokens) / originalTokens) * 100 : 0

  return { originalTokens, squeezedTokens, savingsPercent, level, filters: appliedFilters }
}

export function selectCompressionLevel(contextFillRatio: number): CompressionLevel {
  if (contextFillRatio < 0.5) return 'none'
  if (contextFillRatio < 0.7) return 'light'
  if (contextFillRatio < 0.85) return 'balanced'
  return 'aggressive'
}
