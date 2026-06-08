import { test, expect } from '@playwright/test'

test.describe('API Endpoints', () => {
  test('GET /api/v1/models returns models list', async ({ request }) => {
    const res = await request.get('/api/v1/models')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('data')
    expect(Array.isArray(data.data)).toBe(true)
  })

  test('GET /api/models returns models', async ({ request }) => {
    const res = await request.get('/api/models')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('models')
    expect(Array.isArray(data.models)).toBe(true)
  })

  test('GET /api/providers returns providers', async ({ request }) => {
    const res = await request.get('/api/providers')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('providers')
    expect(data.providers.length).toBeGreaterThan(0)
  })

  test('GET /api/providers/health returns health', async ({ request }) => {
    const res = await request.get('/api/providers/health')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('health')
  })

  test('GET /api/settings returns settings', async ({ request }) => {
    const res = await request.get('/api/settings')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('settings')
  })

  test('GET /api/cache returns cache stats', async ({ request }) => {
    const res = await request.get('/api/cache')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('stats')
  })

  test('GET /api/memory returns memory stats', async ({ request }) => {
    const res = await request.get('/api/memory')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('stats')
  })

  test('GET /api/skills returns skills and groups', async ({ request }) => {
    const res = await request.get('/api/skills')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('skills')
    expect(data).toHaveProperty('groups')
  })

  test('GET /api/dashboard returns dashboard data', async ({ request }) => {
    const res = await request.get('/api/dashboard')
    expect(res.status()).toBe(200)
  })

  test('GET /api/namespace resolves aliases', async ({ request }) => {
    const res = await request.get('/api/namespace?model=best')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('resolved')
    expect(data.resolved).toContain('an/claude-sonnet-4')
  })

  test('POST /api/auth/login with wrong password returns 401', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { password: 'wrong' },
    })
    expect(res.status()).toBe(401)
  })

  test('POST /api/auth/login with correct password returns token', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { password: 'changeme' },
    })
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('token')
    expect(data).toHaveProperty('user')
  })

  test('POST /api/keys creates an API key', async ({ request }) => {
    const res = await request.post('/api/keys', {
      data: { name: 'e2e-test-key' },
    })
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('key')
    expect(data.key).toMatch(/^adn_/)

    if (data.id) {
      const delRes = await request.delete('/api/keys', {
        data: { id: data.id },
      })
      expect(delRes.status()).toBe(200)
    }
  })

  test('POST /api/v1/chat/completions without model returns 400', async ({ request }) => {
    const res = await request.post('/api/v1/chat/completions', {
      data: { messages: [{ role: 'user', content: 'hi' }] },
    })
    expect(res.status()).toBe(400)
  })

  test('POST /api/v1/chat/completions without messages returns 400', async ({ request }) => {
    const res = await request.post('/api/v1/chat/completions', {
      data: { model: 'oa/gpt-4o' },
    })
    expect(res.status()).toBe(400)
  })

  test('MCP tools/list returns available tools', async ({ request }) => {
    const res = await request.post('/api/mcp', {
      data: { jsonrpc: '2.0', method: 'tools/list', id: 1 },
    })
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('tools')
    expect(data.tools.length).toBeGreaterThan(0)
  })
})
