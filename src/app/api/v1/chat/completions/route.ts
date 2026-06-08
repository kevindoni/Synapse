import { NextResponse } from 'next/server'
import { routeRequest, routeRequestStream } from '@/lib/router'
import { db } from '@/lib/db'
import { providerAccounts, requestLogs } from '@/lib/db/schema'
import type { ProviderAccount } from '@/lib/providers/types'
import { logger } from '@/lib/utils/logger'
import { v4 as uuid } from 'uuid'

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: getCorsHeaders() })
}

export async function POST(request: Request) {
  const requestId = uuid()
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { model, messages, temperature, max_tokens, maxTokens, stream, tools } = body

    if (!model || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: { type: 'invalid_request', message: 'model and messages are required' } },
        { status: 400, headers: getCorsHeaders() }
      )
    }

    const normalizedReq = {
      model: model as string,
      messages: messages as Array<{ role: 'system' | 'user' | 'assistant' | 'tool'; content: string }>,
      temperature: temperature as number | undefined,
      maxTokens: (maxTokens || max_tokens) as number | undefined,
      stream: stream as boolean | undefined,
      tools: tools as unknown[] | undefined,
    }

    const accountCache = new Map<string, ProviderAccount | null>()
    const getAccount = (providerId: string): ProviderAccount | null => {
      if (!accountCache.has(providerId)) return null
      return accountCache.get(providerId) ?? null
    }

    const allAccounts = await db.select().from(providerAccounts)
    for (const row of allAccounts) {
      let authData: Record<string, unknown> = {}
      try { authData = JSON.parse(row.authData || '{}') } catch {}
      const account: ProviderAccount = {
        id: row.id,
        providerId: row.providerId,
        label: row.label || undefined,
        authData,
        enabled: row.enabled,
        priority: row.priority,
        quotaUsedTokens: row.quotaUsedTokens,
        quotaLimitTokens: row.quotaLimitTokens ?? undefined,
        quotaResetAt: row.quotaResetAt ? new Date(row.quotaResetAt) : undefined,
        lastUsedAt: row.lastUsedAt ? new Date(row.lastUsedAt) : undefined,
      }
      accountCache.set(row.providerId, account)
    }

    if (stream) {
      const encoder = new TextEncoder()
      const streamResult = new ReadableStream({
        async start(controller) {
          try {
            const routeStream = await routeRequestStream(normalizedReq, getAccount)
            for await (const chunk of routeStream) {
              const data = JSON.stringify({
                id: chunk.id || requestId,
                object: 'chat.completion.chunk',
                model: routeStream.model,
                choices: chunk.choices.map((c: { index: number; delta: Record<string, unknown>; finishReason: string | null }) => ({
                  index: c.index,
                  delta: c.delta,
                  finish_reason: c.finishReason,
                })),
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (err) {
            const errorData = JSON.stringify({ error: { type: 'stream_error', message: (err as Error).message } })
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
            controller.close()
          }
        },
      })

      return new Response(streamResult, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          ...getCorsHeaders(),
        },
      })
    }

    const result = await routeRequest(normalizedReq, getAccount)
    const latencyMs = Date.now() - startTime

    try {
      await db.insert(requestLogs).values({
        id: uuid(),
        requestId,
        model: result.model,
        providerId: result.provider,
        inputTokens: result.response.usage.inputTokens,
        outputTokens: result.response.usage.outputTokens,
        tokensSaved: 0,
        cost: 0,
        latencyMs,
        statusCode: 200,
        fallbackUsed: result.fallbackUsed,
        cached: false,
      })
    } catch (logErr) {
      logger.warn({ error: (logErr as Error).message }, 'Failed to log request')
    }

    const openaiResponse = {
      id: result.response.id,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: result.model,
      choices: result.response.choices.map((c: { index: number; message: { role: string; content: string }; finishReason: string }) => ({
        index: c.index,
        message: { role: c.message.role, content: c.message.content },
        finish_reason: c.finishReason,
      })),
      usage: {
        prompt_tokens: result.response.usage.inputTokens,
        completion_tokens: result.response.usage.outputTokens,
        total_tokens: result.response.usage.totalTokens,
      },
    }

    return NextResponse.json(openaiResponse, { headers: getCorsHeaders() })
  } catch (err) {
    logger.error({ error: (err as Error).message, requestId }, 'Chat completion failed')
    return NextResponse.json(
      { error: { type: 'server_error', message: (err as Error).message } },
      { status: 500, headers: getCorsHeaders() }
    )
  }
}
