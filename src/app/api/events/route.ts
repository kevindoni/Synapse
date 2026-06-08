export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      send('connected', { message: 'Synapse SSE connected', timestamp: Date.now() })

      const heartbeat = setInterval(() => {
        try {
          send('heartbeat', { timestamp: Date.now() })
        } catch {
          clearInterval(heartbeat)
          clearInterval(statsInterval)
        }
      }, 30000)

      const statsInterval = setInterval(async () => {
        try {
          send('stats', {
            timestamp: Date.now(),
            requestsPerMinute: Math.floor(Math.random() * 50) + 10,
            tokensPerMinute: Math.floor(Math.random() * 5000) + 1000,
            activeProviders: 5,
            cacheHitRate: Math.random() * 0.3 + 0.1,
          })
        } catch {
          clearInterval(statsInterval)
          clearInterval(heartbeat)
        }
      }, 5000)

      send('stats', { timestamp: Date.now(), requestsPerMinute: 0, tokensPerMinute: 0, activeProviders: 5, cacheHitRate: 0 })

      const originalClose = controller.close.bind(controller)
      controller.close = () => {
        clearInterval(heartbeat)
        clearInterval(statsInterval)
        originalClose()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
