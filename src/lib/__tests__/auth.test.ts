import { describe, it, expect } from 'vitest'
import { hashApiKey, verifyJwt, signJwt } from '../auth'

describe('Auth', () => {
  describe('hashApiKey', () => {
    it('produces consistent SHA-256 hashes', async () => {
      const hash1 = await hashApiKey('test-key')
      const hash2 = await hashApiKey('test-key')
      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(64)
    })

    it('produces different hashes for different inputs', async () => {
      const hash1 = await hashApiKey('key-1')
      const hash2 = await hashApiKey('key-2')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('JWT', () => {
    it('signs and verifies a token', async () => {
      const token = await signJwt({ sub: 'admin', role: 'admin', name: 'Admin' })
      expect(token).toBeTruthy()

      const payload = await verifyJwt(token)
      expect(payload).not.toBeNull()
      expect(payload!.sub).toBe('admin')
      expect(payload!.role).toBe('admin')
      expect(payload!.name).toBe('Admin')
    })

    it('rejects invalid tokens', async () => {
      const payload = await verifyJwt('invalid-token')
      expect(payload).toBeNull()
    })

    it('rejects empty tokens', async () => {
      const payload = await verifyJwt('')
      expect(payload).toBeNull()
    })
  })
})
