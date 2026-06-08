'use client'

import { useEffect, useState, useRef } from 'react'
import { Send, Trash2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  tokens?: number
  streaming?: boolean
}

interface ModelOption {
  id: string
  name: string
  providerId: string
  available: boolean
}

export default function PlaygroundPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [model, setModel] = useState('best')
  const [models, setModels] = useState<ModelOption[]>([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/models').then((r) => r.json()).then((data) => {
      const all = (data as { models: ModelOption[] }).models || []
      setModels(all)
      if (all.length > 0 && model === 'best') setModel(all[0].name)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input.trim() }
    const allMessages = [...messages, userMsg]
    setMessages(allMessages)
    setInput('')
    setLoading(true)

    const assistantIdx = allMessages.length
    setMessages((prev) => [...prev, { role: 'assistant', content: '', streaming: true }])

    try {
      const res = await fetch('/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        }),
      })

      if (!res.ok || !res.body) {
        const errData = await res.json().catch(() => ({ error: { message: 'Request failed' } }))
        setMessages((prev) => {
          const updated = [...prev]
          updated[assistantIdx] = { role: 'assistant', content: errData.error?.message || 'Request failed' }
          return updated
        })
        setLoading(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''
      let modelUsed = model

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data: ')) continue
          const data = trimmed.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              fullContent += parsed.error.message || JSON.stringify(parsed.error)
              continue
            }
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) fullContent += delta
            if (parsed.model) modelUsed = parsed.model
          } catch { continue }
        }

        setMessages((prev) => {
          const updated = [...prev]
          updated[assistantIdx] = { role: 'assistant', content: fullContent, model: modelUsed, streaming: true }
          return updated
        })
      }

      setMessages((prev) => {
        const updated = [...prev]
        updated[assistantIdx] = { role: 'assistant', content: fullContent, model: modelUsed, streaming: false }
        return updated
      })
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[assistantIdx] = { role: 'assistant', content: 'Network error: Failed to connect' }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  const namespaceAliases = [
    { value: 'best', label: 'Best (auto)' },
    { value: 'fast', label: 'Fast (auto)' },
    { value: 'cheap', label: 'Cheap (auto)' },
    { value: 'reasoning', label: 'Reasoning (auto)' },
    { value: 'code', label: 'Code (auto)' },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-muted border border-border rounded-md text-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring max-w-xs"
          >
            <optgroup label="Namespace Aliases">
              {namespaceAliases.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </optgroup>
            <optgroup label="Models">
              {models.map((m) => (
                <option key={m.id} value={m.name} disabled={!m.available}>
                  {m.name} ({m.providerId})
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <button
          onClick={() => setMessages([])}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-card border border-border rounded-lg p-4 space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Send a message to start testing
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-primary/10 text-foreground' : 'bg-muted text-foreground'}`}>
              <p className="whitespace-pre-wrap">{m.content || '\u00A0'}{m.streaming && <span className="animate-pulse">|</span>}</p>
              {m.model && !m.streaming && (
                <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2">
                  <code className="font-mono">{m.model}</code>
                  {m.tokens && <span>{m.tokens} tokens</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-muted border border-border rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" /> Send
        </button>
      </div>
    </div>
  )
}
