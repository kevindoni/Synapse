import { describe, it, expect } from 'vitest'
import { squeeze, selectCompressionLevel } from '../squeezer'
import type { SqueezeContext, CompressionLevel } from '../squeezer'

function makeCtx(content: string, overrides?: Partial<SqueezeContext>): SqueezeContext {
  return {
    content,
    contentType: 'mixed',
    contextWindow: 128000,
    usedTokens: 0,
    ...overrides,
  }
}

describe('Token Squeezer', () => {
  describe('squeeze', () => {
    it('returns zero savings for "none" level', () => {
      const result = squeeze(makeCtx('hello world'), 'none')
      expect(result.savingsPercent).toBe(0)
      expect(result.level).toBe('none')
      expect(result.filters).toEqual([])
    })

    it('applies whitespace collapsing for "light" level', () => {
      const content = 'hello\n\n\n\nworld'
      const result = squeeze(makeCtx(content), 'light')
      expect(result.filters).toContain('collapse_whitespace')
      expect(result.squeezedTokens).toBeLessThanOrEqual(result.originalTokens)
    })

    it('removes comments for code content at "balanced" level', () => {
      const content = '// this is a comment\nfunction hello() {\n  return 42;\n}\n/* block comment */'
      const result = squeeze(makeCtx(content, { contentType: 'code' }), 'balanced')
      expect(result.filters).toContain('collapse_whitespace')
      expect(result.filters).toContain('remove_comments')
      expect(result.filters).toContain('remove_console_logs')
    })

    it('removes console.log for code at "balanced" level', () => {
      const content = 'console.log("debug");\nconsole.error("err");\nconst x = 1;'
      const result = squeeze(makeCtx(content, { contentType: 'code' }), 'balanced')
      expect(result.filters).toContain('remove_console_logs')
    })

    it('applies aggressive compression with truncation', () => {
      const longContent = Array.from({ length: 1000 }, (_, i) => `// line ${i}\nconsole.log("${i}");\nimport type { T${i} } from "mod";\nconst x${i} = ${i};\n`).join('\n')
      const result = squeeze(makeCtx(longContent, { contentType: 'code', usedTokens: 120000, targetTokens: 1000 }), 'aggressive')
      expect(result.filters).toContain('collapse_whitespace')
      expect(result.filters).toContain('remove_comments')
      expect(result.filters).toContain('remove_console_logs')
      expect(result.savingsPercent).toBeGreaterThan(0)
    })

    it('handles empty content', () => {
      const result = squeeze(makeCtx(''), 'balanced')
      expect(result.originalTokens).toBe(0)
      expect(result.squeezedTokens).toBe(0)
    })

    it('calculates savings percent correctly', () => {
      const content = '// comment\n\n\n\nconst x = 1;'
      const result = squeeze(makeCtx(content, { contentType: 'code' }), 'balanced')
      expect(result.savingsPercent).toBeGreaterThanOrEqual(0)
      expect(result.savingsPercent).toBeLessThanOrEqual(100)
    })
  })

  describe('selectCompressionLevel', () => {
    it('returns "none" for low fill ratio', () => {
      expect(selectCompressionLevel(0.3)).toBe('none')
    })

    it('returns "light" for moderate fill ratio', () => {
      expect(selectCompressionLevel(0.6)).toBe('light')
    })

    it('returns "balanced" for high fill ratio', () => {
      expect(selectCompressionLevel(0.75)).toBe('balanced')
    })

    it('returns "aggressive" for very high fill ratio', () => {
      expect(selectCompressionLevel(0.9)).toBe('aggressive')
    })

    it('handles edge cases', () => {
      expect(selectCompressionLevel(0)).toBe('none')
      expect(selectCompressionLevel(0.5)).toBe('light')
      expect(selectCompressionLevel(0.7)).toBe('balanced')
      expect(selectCompressionLevel(0.85)).toBe('aggressive')
      expect(selectCompressionLevel(1)).toBe('aggressive')
    })
  })
})
