export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  tool_call_id?: string
  tool_calls?: Array<{
    id: string
    type: 'function'
    function: { name: string; arguments: string }
  }>
}

export interface OpenAIRequest {
  model: string
  messages: OpenAIMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
  tools?: unknown[]
}

export function toOpenAIRequest(req: import('../providers/types').NormalizedRequest): OpenAIRequest {
  return {
    model: req.model,
    messages: req.messages.map((m) => ({
      role: m.role,
      content: m.content,
      ...(m.toolCallId ? { tool_call_id: m.toolCallId } : {}),
      ...(m.toolCalls ? { tool_calls: m.toolCalls } : {}),
    })),
    temperature: req.temperature,
    max_tokens: req.maxTokens,
    stream: req.stream,
    tools: req.tools,
  }
}

export function fromOpenAIResponse(data: Record<string, unknown>) {
  const choices = data.choices as Array<{
    index: number
    message: { role: string; content: string }
    finish_reason: string
  }>

  const usage = data.usage as { prompt_tokens: number; completion_tokens: number; total_tokens: number }

  return {
    id: data.id as string,
    model: data.model as string,
    choices: choices.map((c) => ({
      index: c.index,
      message: { role: c.message.role as 'assistant', content: c.message.content },
      finishReason: c.finish_reason,
    })),
    usage: {
      inputTokens: usage?.prompt_tokens || 0,
      outputTokens: usage?.completion_tokens || 0,
      totalTokens: usage?.total_tokens || 0,
    },
  }
}

export function fromOpenAIChunk(data: Record<string, unknown>) {
  const choices = data.choices as Array<{
    index: number
    delta: { role?: string; content?: string }
    finish_reason: string | null
  }>

  return {
    id: data.id as string,
    model: data.model as string,
    choices: choices.map((c) => ({
      index: c.index,
      delta: c.delta.content ? { role: 'assistant' as const, content: c.delta.content } : {},
      finishReason: c.finish_reason,
    })),
  }
}
