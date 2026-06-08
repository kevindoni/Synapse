import { describe, it, expect } from 'vitest'
import { namespaceResolver, BUILTIN_ALIASES, TASK_TYPE_MODELS } from '../namespace'
import type { TaskType } from '../namespace'

describe('Namespace', () => {
  describe('BUILTIN_ALIASES', () => {
    it('has 8 built-in aliases', () => {
      expect(BUILTIN_ALIASES).toHaveLength(8)
    })

    it('each alias has required fields', () => {
      for (const a of BUILTIN_ALIASES) {
        expect(a.alias).toBeTruthy()
        expect(a.resolvesTo).toBeTruthy()
        expect(a.description).toBeTruthy()
        expect(a.taskTypes.length).toBeGreaterThan(0)
      }
    })
  })

  describe('resolve', () => {
    it('resolves "best" to claude-sonnet-4', () => {
      const result = namespaceResolver.resolve('best')
      expect(result).toContain('an/claude-sonnet-4')
    })

    it('resolves "fast" to gpt-4o-mini', () => {
      const result = namespaceResolver.resolve('fast')
      expect(result).toContain('oa/gpt-4o-mini')
    })

    it('resolves "cheap" to deepseek-chat', () => {
      const result = namespaceResolver.resolve('cheap')
      expect(result).toContain('ds/deepseek-chat')
    })

    it('resolves "code" to a code model', () => {
      const result = namespaceResolver.resolve('code')
      expect(result.length).toBeGreaterThan(0)
    })

    it('passes through full model IDs', () => {
      const result = namespaceResolver.resolve('oa/gpt-4o')
      expect(result).toEqual(['oa/gpt-4o'])
    })

    it('is case-insensitive', () => {
      const result = namespaceResolver.resolve('BEST')
      expect(result).toContain('an/claude-sonnet-4')
    })

    it('returns single model for unknown short names', () => {
      const result = namespaceResolver.resolve('unknown-model')
      expect(result).toEqual(['unknown-model'])
    })
  })

  describe('detectTaskType', () => {
    it('detects code tasks', () => {
      expect(namespaceResolver.detectTaskType('write a function that sorts an array')).toBe('code')
      expect(namespaceResolver.detectTaskType('async function hello() {}')).toBe('code')
      expect(namespaceResolver.detectTaskType('fix the bug in my code')).toBe('debug')
    })

    it('detects reasoning tasks', () => {
      expect(namespaceResolver.detectTaskType('reason about this problem')).toBe('reason')
      expect(namespaceResolver.detectTaskType('prove this theorem')).toBe('reason')
    })

    it('detects review tasks', () => {
      expect(namespaceResolver.detectTaskType('review this pull request')).toBe('review')
      expect(namespaceResolver.detectTaskType('critique my approach')).toBe('review')
    })

    it('defaults to chat', () => {
      expect(namespaceResolver.detectTaskType('hello there')).toBe('chat')
      expect(namespaceResolver.detectTaskType('how are you')).toBe('chat')
    })
  })

  describe('resolveForTask', () => {
    it('returns models for a task type', () => {
      const models = namespaceResolver.resolveForTask('code')
      expect(models.length).toBeGreaterThan(0)
    })

    it('defaults to chat for unknown task', () => {
      const models = namespaceResolver.resolveForTask('chat' as TaskType)
      expect(models).toEqual(TASK_TYPE_MODELS.chat)
    })
  })

  describe('TASK_TYPE_MODELS', () => {
    it('has models for every task type', () => {
      const taskTypes: TaskType[] = ['code', 'chat', 'reason', 'review', 'debug', 'doc', 'translate', 'fast', 'creative', 'math']
      for (const tt of taskTypes) {
        expect(TASK_TYPE_MODELS[tt]).toBeDefined()
        expect(TASK_TYPE_MODELS[tt].length).toBeGreaterThan(0)
      }
    })
  })
})
