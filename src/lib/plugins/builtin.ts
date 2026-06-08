import { pluginManager } from './index'
import type { Plugin, PluginContext } from './index'

const piiPatterns = [
  /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  /\b\d{3}[-.]?\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  /\b(?:4\d{3}|5[1-5]\d{2}|2\d{3}|3[47]\d{2})[-\s.]?\d{4}[-\s.]?\d{4}[-\s.]?\d{4}\b/g,
]

const piiPlugin: Plugin = {
  name: 'pii-redactor',
  description: 'Redacts personally identifiable information (SSN, email, phone, credit card)',
  phase: 'pre_request',
  execute: async (ctx: PluginContext) => {
    let content = ctx.content
    let modified = false

    for (const pattern of piiPatterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, '[REDACTED]')
        modified = true
      }
    }

    return { modified, content }
  },
}

pluginManager.register(piiPlugin)

const profanityWords = ['damn', 'hell', 'crap']
const profanityPlugin: Plugin = {
  name: 'profanity-filter',
  description: 'Filters profanity from responses',
  phase: 'post_response',
  execute: async (ctx: PluginContext) => {
    let content = ctx.content
    let modified = false

    for (const word of profanityWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      if (regex.test(content)) {
        content = content.replace(regex, '*'.repeat(word.length))
        modified = true
      }
    }

    return { modified, content }
  },
}

pluginManager.register(profanityPlugin)

const responseValidator: Plugin = {
  name: 'response-validator',
  description: 'Validates response is not empty and has reasonable length',
  phase: 'post_response',
  execute: async (ctx: PluginContext) => {
    const issues: string[] = []

    if (!ctx.content || ctx.content.trim().length === 0) {
      issues.push('empty_response')
    }

    if (ctx.content.length > 100000) {
      issues.push('response_too_long')
    }

    return {
      modified: false,
      content: ctx.content,
      metadata: { validation: { valid: issues.length === 0, issues } },
    }
  },
}

pluginManager.register(responseValidator)
