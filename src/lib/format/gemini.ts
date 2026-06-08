import type { NormalizedRequest } from '../providers/types'

export interface GeminiContent {
  role: 'user' | 'model'
  parts: GeminiPart[]
}

export interface GeminiPart {
  text?: string
  functionCall?: { name: string; args: Record<string, unknown> }
  functionResponse?: { name: string; response: Record<string, unknown> }
}

export interface GeminiRequest {
  model: string
  contents: GeminiContent[]
  systemInstruction?: { parts: Array<{ text: string }> }
  generationConfig: {
    maxOutputTokens?: number
    temperature?: number
  }
  tools?: unknown[]
}

export function toGeminiRequest(req: NormalizedRequest): GeminiRequest {
  const contents: GeminiContent[] = []
  const systemParts: Array<{ text: string }> = []

  for (const msg of req.messages) {
    if (msg.role === 'system') {
      systemParts.push({ text: msg.content })
      continue
    }

    const parts: GeminiPart[] = []

    if (msg.role === 'assistant' && msg.toolCalls) {
      for (const tc of msg.toolCalls) {
        parts.push({
          functionCall: {
            name: tc.function.name,
            args: JSON.parse(tc.function.arguments),
          },
        })
      }
      if (msg.content) {
        parts.unshift({ text: msg.content })
      }
    } else if (msg.role === 'tool') {
      parts.push({
        functionResponse: {
          name: msg.toolCallId || '',
          response: { content: msg.content },
        },
      })
    } else {
      parts.push({ text: msg.content })
    }

    if (parts.length > 0) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts,
      })
    }
  }

  const merged: GeminiContent[] = []
  for (const c of contents) {
    if (merged.length > 0 && merged[merged.length - 1].role === c.role) {
      merged[merged.length - 1] = { ...merged[merged.length - 1], parts: [...merged[merged.length - 1].parts, ...c.parts] }
    } else {
      merged.push(c)
    }
  }

  return {
    model: req.model,
    contents: merged,
    ...(systemParts.length > 0 ? { systemInstruction: { parts: systemParts } } : {}),
    generationConfig: {
      maxOutputTokens: req.maxTokens,
      temperature: req.temperature,
    },
    tools: req.tools,
  }
}

export function fromGeminiResponse(data: Record<string, unknown>) {
  const candidates = data.candidates as Array<{ content: { parts: GeminiPart[] }; finishReason: string }> | undefined
  const candidate = candidates?.[0]
  const text = candidate?.content?.parts?.map((p) => p.text || '').join('') || ''

  const usage = data.usageMetadata as { promptTokenCount: number; candidatesTokenCount: number; totalTokenCount: number } | undefined

  return {
    id: crypto.randomUUID(),
    model: data.model as string,
    choices: [
      {
        index: 0,
        message: { role: 'assistant' as const, content: text },
        finishReason: candidate?.finishReason || 'STOP',
      },
    ],
    usage: {
      inputTokens: usage?.promptTokenCount || 0,
      outputTokens: usage?.candidatesTokenCount || 0,
      totalTokens: usage?.totalTokenCount || 0,
    },
  }
}

export function fromGeminiChunk(data: Record<string, unknown>) {
  const candidates = data.candidates as Array<{ content: { parts: GeminiPart[] }; finishReason: string }> | undefined
  const candidate = candidates?.[0]
  const text = candidate?.content?.parts?.map((p) => p.text || '').join('') || ''

  return {
    id: '',
    model: '',
    choices: [
      {
        index: 0,
        delta: text ? { role: 'assistant' as const, content: text } : {},
        finishReason: candidate?.finishReason === 'STOP' ? 'stop' : null,
      },
    ],
  }
}
