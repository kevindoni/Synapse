import { pluginManager } from '@/lib/plugins/index'

const PII_PATTERNS = [
  /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
]

let registered = false
function ensureRegistered() {
  if (registered) return
  registered = true

  pluginManager.register({
    name: 'pii-redactor',
    description: 'Redacts PII (SSN, email, phone)',
    phase: 'pre_request',
    execute: async (ctx) => {
      let content = ctx.content
      for (const pattern of PII_PATTERNS) {
        content = content.replace(pattern, '[REDACTED]')
      }
      return { modified: content !== ctx.content, content }
    },
  })
  pluginManager.register({
    name: 'response-validator',
    description: 'Validates response quality',
    phase: 'post_response',
    execute: async (ctx) => {
      const valid = ctx.content.trim().length > 0
      return { modified: false, content: ctx.content, metadata: { validation: { valid } } }
    },
  })
}

export async function GET() {
  ensureRegistered()
  const plugins = pluginManager.list()
  return Response.json({ plugins })
}
