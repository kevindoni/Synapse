import { z } from 'zod'

export const configSchema = z.object({
  port: z.number().default(3333),
  hostname: z.string().default('127.0.0.1'),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  dataDir: z.string().default(''),
  auth: z.object({
    initialPassword: z.string().default('changeme'),
    jwtSecret: z.string().default(''),
    requireApiKey: z.boolean().default(false),
  }).default({ initialPassword: 'changeme', jwtSecret: '', requireApiKey: false }),
  rtk: z.object({
    enabled: z.boolean().default(true),
    compressionLevel: z.enum(['none', 'light', 'balanced', 'aggressive']).default('balanced'),
    filters: z.array(z.string()).default(['git-diff', 'grep', 'ls-tree', 'log-dump', 'smart-truncate']),
  }).default({ enabled: true, compressionLevel: 'balanced', filters: ['git-diff', 'grep', 'ls-tree', 'log-dump', 'smart-truncate'] }),
  proxy: z.object({
    enabled: z.boolean().default(false),
    type: z.enum(['http', 'socks5']).default('socks5'),
    host: z.string().default('127.0.0.1'),
    port: z.number().default(9050),
  }).default({ enabled: false, type: 'socks5', host: '127.0.0.1', port: 9050 }),
  tor: z.object({
    enabled: z.boolean().default(false),
    socksPort: z.number().default(9050),
    controlPort: z.number().default(9051),
    password: z.string().default(''),
  }).default({ enabled: false, socksPort: 9050, controlPort: 9051, password: '' }),
  cache: z.object({
    enabled: z.boolean().default(true),
    ttlMinutes: z.number().default(10),
    maxSize: z.string().default('100MB'),
  }).default({ enabled: true, ttlMinutes: 10, maxSize: '100MB' }),
  fallback: z.object({
    maxRetries: z.number().default(3),
    timeoutMs: z.number().default(30000),
    cooldownMinutes: z.number().default(5),
  }).default({ maxRetries: 3, timeoutMs: 30000, cooldownMinutes: 5 }),
  cloudSync: z.object({
    enabled: z.boolean().default(false),
    url: z.string().default(''),
    encryptionKey: z.string().default(''),
  }).default({ enabled: false, url: '', encryptionKey: '' }),
  semanticCache: z.object({
    enabled: z.boolean().default(true),
    similarityThreshold: z.number().min(0).max(1).default(0.95),
    ttlMinutes: z.number().default(30),
    maxEntries: z.number().default(10000),
    embeddingModel: z.string().default('local-minilm'),
  }).default({ enabled: true, similarityThreshold: 0.95, ttlMinutes: 30, maxEntries: 10000, embeddingModel: 'local-minilm' }),
  memory: z.object({
    enabled: z.boolean().default(true),
    episodicTtlDays: z.number().default(90),
    distillationIntervalHours: z.number().default(6),
  }).default({ enabled: true, episodicTtlDays: 90, distillationIntervalHours: 6 }),
  skills: z.object({
    enabled: z.boolean().default(true),
    defaultRotationStrategy: z.enum(['task_match', 'round_robin', 'quality_based', 'schedule', 'weighted_random']).default('task_match'),
  }).default({ enabled: true, defaultRotationStrategy: 'task_match' }),
})

export type Config = z.infer<typeof configSchema>
