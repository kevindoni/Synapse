import { sqliteTable, text, integer, real, blob, index, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const providers = sqliteTable('providers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  prefix: text('prefix').notNull().unique(),
  type: text('type', { enum: ['oauth', 'api_key', 'none', 'service_account'] }).notNull(),
  config: text('config').notNull().default('{}'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  priority: integer('priority').notNull().default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const providerAccounts = sqliteTable('provider_accounts', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull().references(() => providers.id),
  label: text('label'),
  authData: text('auth_data').notNull().default('{}'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  priority: integer('priority').notNull().default(0),
  quotaUsedTokens: integer('quota_used_tokens').notNull().default(0),
  quotaLimitTokens: integer('quota_limit_tokens'),
  quotaResetAt: text('quota_reset_at'),
  lastUsedAt: text('last_used_at'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const models = sqliteTable('models', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull().references(() => providers.id),
  name: text('name').notNull(),
  displayName: text('display_name'),
  pricingTier: text('pricing_tier', { enum: ['free', 'cheap', 'subscription', 'pay_per_use'] }),
  costPer1mInput: real('cost_per_1m_input'),
  costPer1mOutput: real('cost_per_1m_output'),
  contextWindow: integer('context_window'),
  capabilities: text('capabilities').default('[]'),
  available: integer('available', { mode: 'boolean' }).notNull().default(true),
  lastCheckedAt: text('last_checked_at'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const combos = sqliteTable('combos', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  models: text('models').notNull().default('[]'),
  routingStrategy: text('routing_strategy').notNull().default('priority'),
  fallbackEnabled: integer('fallback_enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const requestLogs = sqliteTable('request_logs', {
  id: text('id').primaryKey(),
  requestId: text('request_id').notNull(),
  model: text('model').notNull(),
  providerId: text('provider_id'),
  accountId: text('account_id'),
  comboId: text('combo_id'),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  tokensSaved: integer('tokens_saved').default(0),
  cost: real('cost').default(0),
  latencyMs: integer('latency_ms'),
  statusCode: integer('status_code'),
  errorMessage: text('error_message'),
  fallbackUsed: integer('fallback_used', { mode: 'boolean' }).default(false),
  cached: integer('cached', { mode: 'boolean' }).default(false),
  skillId: text('skill_id'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const providerHealth = sqliteTable('provider_health', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull().references(() => providers.id),
  status: text('status', { enum: ['healthy', 'degraded', 'down', 'disabled'] }).notNull().default('healthy'),
  avgLatencyMs: integer('avg_latency_ms'),
  p95LatencyMs: integer('p95_latency_ms'),
  errorRate: real('error_rate').default(0),
  successRate: real('success_rate').default(1),
  consecutiveFailures: integer('consecutive_failures').default(0),
  lastSuccessAt: text('last_success_at'),
  lastCheckAt: text('last_check_at'),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const usageDaily = sqliteTable('usage_daily', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  providerId: text('provider_id'),
  model: text('model'),
  totalRequests: integer('total_requests').default(0),
  totalInputTokens: integer('total_input_tokens').default(0),
  totalOutputTokens: integer('total_output_tokens').default(0),
  totalTokensSaved: integer('total_tokens_saved').default(0),
  totalCost: real('total_cost').default(0),
  totalErrors: integer('total_errors').default(0),
  totalFallbacks: integer('total_fallbacks').default(0),
  totalCacheHits: integer('total_cache_hits').default(0),
}, (t) => [
  uniqueIndex('usage_daily_unique').on(t.date, t.providerId, t.model),
])

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull().unique(),
  permissions: text('permissions').default('{}'),
  lastUsedAt: text('last_used_at'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const semanticCache = sqliteTable('semantic_cache', {
  id: text('id').primaryKey(),
  embedding: blob('embedding').notNull(),
  promptHash: text('prompt_hash').notNull(),
  promptText: text('prompt_text').notNull(),
  responseText: text('response_text').notNull(),
  model: text('model').notNull(),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  similarityThreshold: real('similarity_threshold').default(0.95),
  hits: integer('hits').default(0),
  qualityScore: real('quality_score'),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const routerTrainingData = sqliteTable('router_training_data', {
  id: text('id').primaryKey(),
  features: text('features').notNull().default('{}'),
  selectedProvider: text('selected_provider').notNull(),
  selectedModel: text('selected_model').notNull(),
  outcome: text('outcome', { enum: ['success', 'timeout', 'error', 'rate_limited'] }).notNull(),
  latencyMs: integer('latency_ms'),
  cost: real('cost'),
  qualityScore: real('quality_score'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const modelBenchmarks = sqliteTable('model_benchmarks', {
  id: text('id').primaryKey(),
  model: text('model').notNull(),
  taskType: text('task_type').notNull(),
  latencyMs: integer('latency_ms'),
  tokensUsed: integer('tokens_used'),
  qualityScore: real('quality_score'),
  cost: real('cost'),
  providerId: text('provider_id'),
  isShadow: integer('is_shadow', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const pipelines = sqliteTable('pipelines', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  nodes: text('nodes').notNull().default('[]'),
  connections: text('connections').notNull().default('[]'),
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const skills = sqliteTable('skills', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  version: text('version').notNull().default('1.0.0'),
  author: text('author').notNull().default('user'),
  systemPrompt: text('system_prompt').notNull(),
  behavior: text('behavior').notNull().default('{}'),
  rotationConfig: text('rotation_config').notNull().default('{}'),
  groupId: text('group_id'),
  tags: text('tags').notNull().default('[]'),
  qualityScore: real('quality_score').default(0),
  usageCount: integer('usage_count').default(0),
  lastUsedAt: text('last_used_at'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  source: text('source').notNull().default('user'),
  sourceUrl: text('source_url'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const skillGroups = sqliteTable('skill_groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  rotationStrategy: text('rotation_strategy').notNull().default('round_robin'),
  taskTypes: text('task_types').notNull().default('[]'),
  activeSkillId: text('active_skill_id'),
  rotationIndex: integer('rotation_index').default(0),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  lastRotatedAt: text('last_rotated_at').notNull().$defaultFn(() => new Date().toISOString()),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const skillQuality = sqliteTable('skill_quality', {
  id: text('id').primaryKey(),
  skillId: text('skill_id').notNull().references(() => skills.id),
  taskType: text('task_type').notNull(),
  totalRequests: integer('total_requests').default(0),
  avgQualityScore: real('avg_quality_score').default(0),
  avgLatencyMs: real('avg_latency_ms').default(0),
  userAcceptanceRate: real('user_acceptance_rate').default(0),
  lastUpdated: text('last_updated').notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => [
  uniqueIndex('skill_quality_unique').on(t.skillId, t.taskType),
])

export const skillRotationLog = sqliteTable('skill_rotation_log', {
  id: text('id').primaryKey(),
  fromSkillId: text('from_skill_id'),
  toSkillId: text('to_skill_id').notNull(),
  groupId: text('group_id'),
  triggerType: text('trigger_type').notNull(),
  requestId: text('request_id'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const episodes = sqliteTable('episodes', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  eventType: text('event_type').notNull(),
  model: text('model'),
  provider: text('provider'),
  taskType: text('task_type'),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  tokensSaved: integer('tokens_saved').default(0),
  latencyMs: integer('latency_ms'),
  cost: real('cost').default(0),
  qualityScore: real('quality_score'),
  outcome: text('outcome'),
  metadata: text('metadata').default('{}'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => [
  index('idx_episodes_timestamp').on(t.timestamp),
  index('idx_episodes_model').on(t.model),
  index('idx_episodes_provider').on(t.provider),
])

export const knowledge = sqliteTable('knowledge', {
  id: text('id').primaryKey(),
  category: text('category').notNull(),
  subject: text('subject').notNull(),
  key: text('key').notNull(),
  value: text('value').notNull().default('{}'),
  confidence: real('confidence').default(0),
  sampleCount: integer('sample_count').default(0),
  source: text('source').notNull().default('distilled'),
  lastUpdated: text('last_updated').notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => [
  uniqueIndex('knowledge_unique').on(t.category, t.subject, t.key),
  index('knowledge_lookup').on(t.category, t.subject, t.key),
])

export const proceduralRules = sqliteTable('procedural_rules', {
  id: text('id').primaryKey(),
  category: text('category').notNull(),
  condition: text('condition').notNull(),
  action: text('action').notNull(),
  confidence: real('confidence').default(0),
  sampleCount: integer('sample_count').default(0),
  status: text('status').notNull().default('auto_generated'),
  priority: integer('priority').default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  verifiedAt: text('verified_at'),
  lastAppliedAt: text('last_applied_at'),
  applyCount: integer('apply_count').default(0),
  successCount: integer('success_count').default(0),
}, (t) => [
  index('idx_rules_category').on(t.category, t.status),
])

export const distillationLog = sqliteTable('distillation_log', {
  id: text('id').primaryKey(),
  startedAt: text('started_at').notNull(),
  completedAt: text('completed_at'),
  episodesProcessed: integer('episodes_processed').default(0),
  patternsFound: integer('patterns_found').default(0),
  rulesGenerated: integer('rules_generated').default(0),
  rulesUpdated: integer('rules_updated').default(0),
  modelRetrained: integer('model_retrained', { mode: 'boolean' }).default(false),
  modelAccuracyBefore: real('model_accuracy_before'),
  modelAccuracyAfter: real('model_accuracy_after'),
  knowledgeEntriesAdded: integer('knowledge_entries_added').default(0),
  knowledgeEntriesUpdated: integer('knowledge_entries_updated').default(0),
  status: text('status').notNull().default('running'),
  errorMessage: text('error_message'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})
