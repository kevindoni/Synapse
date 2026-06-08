import type { Config } from './schema'

export const configDefaults: Config = {
  port: 3333,
  hostname: '127.0.0.1',
  logLevel: 'info',
  dataDir: '',
  auth: {
    initialPassword: 'changeme',
    jwtSecret: '',
    requireApiKey: false,
  },
  rtk: {
    enabled: true,
    compressionLevel: 'balanced',
    filters: ['git-diff', 'grep', 'ls-tree', 'log-dump', 'smart-truncate'],
  },
  proxy: {
    enabled: false,
    type: 'socks5',
    host: '127.0.0.1',
    port: 9050,
  },
  tor: {
    enabled: false,
    socksPort: 9050,
    controlPort: 9051,
    password: '',
  },
  cache: {
    enabled: true,
    ttlMinutes: 10,
    maxSize: '100MB',
  },
  fallback: {
    maxRetries: 3,
    timeoutMs: 30000,
    cooldownMinutes: 5,
  },
  cloudSync: {
    enabled: false,
    url: '',
    encryptionKey: '',
  },
  semanticCache: {
    enabled: true,
    similarityThreshold: 0.95,
    ttlMinutes: 30,
    maxEntries: 10000,
    embeddingModel: 'local-minilm',
  },
  memory: {
    enabled: true,
    episodicTtlDays: 90,
    distillationIntervalHours: 6,
  },
  skills: {
    enabled: true,
    defaultRotationStrategy: 'task_match',
  },
}
