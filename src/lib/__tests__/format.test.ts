import { describe, it, expect } from 'vitest'
import { toOpenAIRequest, fromOpenAIResponse } from '../format/openai'
import { toAnthropicRequest, fromAnthropicResponse } from '../format/anthropic'
import { toGeminiRequest, fromGeminiResponse } from '../format/gemini'
import type { NormalizedRequest } from '../providers/types'

function makeReq(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>): NormalizedRequest {
  return {
    model: 'test-model',
    messages: messages.map((m) => ({ ...m, role: m.role as 'system' | 'user' | 'assistant' | 'tool' })),
  }
}

describe('Format Translators', () => {
  describe('OpenAI', () => {
    it('converts normalized request to OpenAI format', () => {
      const req = makeReq([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi' },
      ])
      const result = toOpenAIRequest(req)
      expect(result.messages).toHaveLength(2)
      expect(result.messages[0].role).toBe('user')
      expect(result.messages[1].role).toBe('assistant')
    })

    it('parses OpenAI response', () => {
      const raw = {
        id: 'chatcmpl-123',
        model: 'gpt-4o',
        choices: [{ index: 0, message: { role: 'assistant', content: 'Hello!' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      }
      const result = fromOpenAIResponse(raw)
      expect(result.id).toBe('chatcmpl-123')
      expect(result.choices[0].message.content).toBe('Hello!')
      expect(result.usage.totalTokens).toBe(15)
    })
  })

  describe('Anthropic', () => {
    it('extracts system message from anthropic format', () => {
      const req = makeReq([
        { role: 'system', content: 'You are helpful' },
        { role: 'user', content: 'Hello' },
      ])
      const result = toAnthropicRequest(req)
      expect(result.system).toBe('You are helpful')
    })

    it('parses Anthropic response', () => {
      const raw = {
        id: 'msg-123',
        model: 'claude-sonnet-4',
        content: [{ type: 'text', text: 'Hello!' }],
        stop_reason: 'end_turn',
        usage: { input_tokens: 10, output_tokens: 5 },
      }
      const result = fromAnthropicResponse(raw)
      expect(result.id).toBe('msg-123')
      expect(result.choices[0].message.content).toBe('Hello!')
    })
  })

  describe('Gemini', () => {
    it('creates Gemini contents array', () => {
      const req = makeReq([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi' },
      ])
      const result = toGeminiRequest(req)
      expect(result.contents).toBeDefined()
      expect(result.contents.length).toBeGreaterThan(0)
    })

    it('extracts systemInstruction', () => {
      const req = makeReq([
        { role: 'system', content: 'Be helpful' },
        { role: 'user', content: 'Hello' },
      ])
      const result = toGeminiRequest(req)
      expect(result.systemInstruction).toBeDefined()
    })

    it('parses Gemini response', () => {
      const raw = {
        candidates: [{ content: { parts: [{ text: 'Hello!' }] }, finishReason: 'STOP' }],
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 },
      }
      const result = fromGeminiResponse(raw)
      expect(result.choices[0].message.content).toBe('Hello!')
    })
  })
})
