import type { Message, NormalizedRequest } from '../providers/types'

export interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string | AnthropicContentBlock[]
}

export interface AnthropicContentBlock {
  type: 'text' | 'image' | 'tool_use' | 'tool_result'
  text?: string
  tool_use_id?: string
  name?: string
  input?: unknown
  content?: string
}

export interface AnthropicRequest {
  model: string
  messages: AnthropicMessage[]
  system?: string
  max_tokens: number
  temperature?: number
  stream?: boolean
  tools?: unknown[]
}

export function toAnthropicRequest(req: NormalizedRequest): AnthropicRequest {
  const messages: AnthropicMessage[] = []
  let system: string | undefined

  for (const msg of req.messages) {
    if (msg.role === 'system') {
      system = (system ? system + '\n\n' : '') + msg.content
      continue
    }

    const anthropicMsg: AnthropicMessage = {
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }

    if (msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0) {
      anthropicMsg.content = [
        { type: 'text', text: msg.content },
        ...msg.toolCalls.map((tc) => ({
          type: 'tool_use' as const,
          id: tc.id,
          name: tc.function.name,
          input: JSON.parse(tc.function.arguments),
        })),
      ]
    }

    if (msg.role === 'tool') {
      anthropicMsg.content = [
        {
          type: 'tool_result' as const,
          tool_use_id: msg.toolCallId,
          content: msg.content,
        },
      ]
    }

    messages.push(anthropicMsg)
  }

  if (messages.length === 0) {
    messages.push({ role: 'user', content: ' ' })
  }

  if (messages[0].role !== 'user') {
    messages.unshift({ role: 'user', content: ' ' })
  }

  let filtered = messages.filter((m) => m.role === 'user' || m.role === 'assistant')
  const merged: AnthropicMessage[] = []
  for (const msg of filtered) {
    if (merged.length > 0 && merged[merged.length - 1].role === msg.role) {
      const last = merged[merged.length - 1]
      const lastText = typeof last.content === 'string' ? last.content : ''
      const currText = typeof msg.content === 'string' ? msg.content : ''
      merged[merged.length - 1] = { ...last, content: lastText + '\n' + currText }
    } else {
      merged.push(msg)
    }
  }

  return {
    model: req.model,
    messages: merged,
    system,
    max_tokens: req.maxTokens || 4096,
    temperature: req.temperature,
    stream: req.stream,
    tools: req.tools,
  }
}

export function fromAnthropicResponse(data: Record<string, unknown>) {
  const content = data.content as Array<{ type: string; text?: string }>
  const textContent = content?.filter((c) => c.type === 'text').map((c) => c.text || '').join('') || ''

  return {
    id: data.id as string,
    model: data.model as string,
    choices: [
      {
        index: 0,
        message: { role: 'assistant' as const, content: textContent },
        finishReason: (data.stop_reason as string) || 'end_turn',
      },
    ],
    usage: {
      inputTokens: (data.usage as Record<string, number>)?.input_tokens || 0,
      outputTokens: (data.usage as Record<string, number>)?.output_tokens || 0,
      totalTokens:
        ((data.usage as Record<string, number>)?.input_tokens || 0) +
        ((data.usage as Record<string, number>)?.output_tokens || 0),
    },
  }
}

export function fromAnthropicChunk(data: Record<string, unknown>) {
  const delta = data.delta as { type: string; text?: string; stop_reason?: string } | undefined
  const isContent = delta?.type === 'text_delta'
  const isStop = delta?.type === 'message_stop' || delta?.stop_reason

  return {
    id: (data.id as string) || '',
    model: data.model as string,
    choices: [
      {
        index: 0,
        delta: isContent ? { role: 'assistant' as const, content: delta?.text || '' } : {},
        finishReason: isStop ? (delta?.stop_reason as string) || 'end_turn' : null,
      },
    ],
  }
}
