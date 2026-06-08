import { db } from './index'
import { sql } from 'drizzle-orm'
import { logger } from '../utils/logger'

const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    prefix TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK(type IN ('oauth','api_key','none','service_account')),
    config TEXT NOT NULL DEFAULT '{}',
    enabled INTEGER NOT NULL DEFAULT 1,
    priority INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS provider_accounts (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL REFERENCES providers(id),
    label TEXT,
    auth_data TEXT NOT NULL DEFAULT '{}',
    enabled INTEGER NOT NULL DEFAULT 1,
    priority INTEGER NOT NULL DEFAULT 0,
    quota_used_tokens INTEGER NOT NULL DEFAULT 0,
    quota_limit_tokens INTEGER,
    quota_reset_at TEXT,
    last_used_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS models (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL REFERENCES providers(id),
    name TEXT NOT NULL,
    display_name TEXT,
    pricing_tier TEXT CHECK(pricing_tier IN ('free','cheap','subscription','pay_per_use')),
    cost_per_1m_input REAL,
    cost_per_1m_output REAL,
    context_window INTEGER,
    capabilities TEXT DEFAULT '[]',
    available INTEGER NOT NULL DEFAULT 1,
    last_checked_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS combos (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    models TEXT NOT NULL DEFAULT '[]',
    routing_strategy TEXT NOT NULL DEFAULT 'priority',
    fallback_enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS request_logs (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    model TEXT NOT NULL,
    provider_id TEXT,
    account_id TEXT,
    combo_id TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    tokens_saved INTEGER DEFAULT 0,
    cost REAL DEFAULT 0,
    latency_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,
    fallback_used INTEGER DEFAULT 0,
    cached INTEGER DEFAULT 0,
    skill_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS provider_health (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL REFERENCES providers(id),
    status TEXT NOT NULL DEFAULT 'healthy' CHECK(status IN ('healthy','degraded','down','disabled')),
    avg_latency_ms INTEGER,
    p95_latency_ms INTEGER,
    error_rate REAL DEFAULT 0,
    success_rate REAL DEFAULT 1,
    consecutive_failures INTEGER DEFAULT 0,
    last_success_at TEXT,
    last_check_at TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS usage_daily (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    provider_id TEXT,
    model TEXT,
    total_requests INTEGER DEFAULT 0,
    total_input_tokens INTEGER DEFAULT 0,
    total_output_tokens INTEGER DEFAULT 0,
    total_tokens_saved INTEGER DEFAULT 0,
    total_cost REAL DEFAULT 0,
    total_errors INTEGER DEFAULT 0,
    total_fallbacks INTEGER DEFAULT 0,
    total_cache_hits INTEGER DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    permissions TEXT DEFAULT '{}',
    last_used_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS semantic_cache (
    id TEXT PRIMARY KEY,
    embedding BLOB NOT NULL,
    prompt_hash TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    model TEXT NOT NULL,
    input_tokens INTEGER,
    output_tokens INTEGER,
    similarity_threshold REAL DEFAULT 0.95,
    hits INTEGER DEFAULT 0,
    quality_score REAL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS router_training_data (
    id TEXT PRIMARY KEY,
    features TEXT NOT NULL DEFAULT '{}',
    selected_provider TEXT NOT NULL,
    selected_model TEXT NOT NULL,
    outcome TEXT NOT NULL CHECK(outcome IN ('success','timeout','error','rate_limited')),
    latency_ms INTEGER,
    cost REAL,
    quality_score REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS model_benchmarks (
    id TEXT PRIMARY KEY,
    model TEXT NOT NULL,
    task_type TEXT NOT NULL,
    latency_ms INTEGER,
    tokens_used INTEGER,
    quality_score REAL,
    cost REAL,
    provider_id TEXT,
    is_shadow INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS pipelines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    nodes TEXT NOT NULL DEFAULT '[]',
    connections TEXT NOT NULL DEFAULT '[]',
    is_default INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    version TEXT NOT NULL DEFAULT '1.0.0',
    author TEXT NOT NULL DEFAULT 'user',
    system_prompt TEXT NOT NULL,
    behavior TEXT NOT NULL DEFAULT '{}',
    rotation_config TEXT NOT NULL DEFAULT '{}',
    group_id TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    quality_score REAL DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    last_used_at TEXT,
    enabled INTEGER NOT NULL DEFAULT 1,
    source TEXT NOT NULL DEFAULT 'user',
    source_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS skill_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    rotation_strategy TEXT NOT NULL DEFAULT 'round_robin',
    task_types TEXT NOT NULL DEFAULT '[]',
    active_skill_id TEXT,
    rotation_index INTEGER DEFAULT 0,
    enabled INTEGER NOT NULL DEFAULT 1,
    last_rotated_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS skill_quality (
    id TEXT PRIMARY KEY,
    skill_id TEXT NOT NULL REFERENCES skills(id),
    task_type TEXT NOT NULL,
    total_requests INTEGER DEFAULT 0,
    avg_quality_score REAL DEFAULT 0,
    avg_latency_ms REAL DEFAULT 0,
    user_acceptance_rate REAL DEFAULT 0,
    last_updated TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS skill_rotation_log (
    id TEXT PRIMARY KEY,
    from_skill_id TEXT,
    to_skill_id TEXT NOT NULL,
    group_id TEXT,
    trigger_type TEXT NOT NULL,
    request_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS episodes (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    event_type TEXT NOT NULL,
    model TEXT,
    provider TEXT,
    task_type TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    tokens_saved INTEGER DEFAULT 0,
    latency_ms INTEGER,
    cost REAL DEFAULT 0,
    quality_score REAL,
    outcome TEXT,
    metadata TEXT DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS knowledge (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL DEFAULT '{}',
    confidence REAL DEFAULT 0,
    sample_count INTEGER DEFAULT 0,
    source TEXT NOT NULL DEFAULT 'distilled',
    last_updated TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS procedural_rules (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    condition TEXT NOT NULL,
    action TEXT NOT NULL,
    confidence REAL DEFAULT 0,
    sample_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'auto_generated',
    priority INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    verified_at TEXT,
    last_applied_at TEXT,
    apply_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS distillation_log (
    id TEXT PRIMARY KEY,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    episodes_processed INTEGER DEFAULT 0,
    patterns_found INTEGER DEFAULT 0,
    rules_generated INTEGER DEFAULT 0,
    rules_updated INTEGER DEFAULT 0,
    model_retrained INTEGER DEFAULT 0,
    model_accuracy_before REAL,
    model_accuracy_after REAL,
    knowledge_entries_added INTEGER DEFAULT 0,
    knowledge_entries_updated INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'running',
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
]

const CREATE_INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_episodes_timestamp ON episodes(timestamp)`,
  `CREATE INDEX IF NOT EXISTS idx_episodes_model ON episodes(model)`,
  `CREATE INDEX IF NOT EXISTS idx_episodes_provider ON episodes(provider)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS knowledge_unique ON knowledge(category, subject, key)`,
  `CREATE INDEX IF NOT EXISTS knowledge_lookup ON knowledge(category, subject, key)`,
  `CREATE INDEX IF NOT EXISTS idx_rules_category ON procedural_rules(category, status)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS usage_daily_unique ON usage_daily(date, provider_id, model)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS skill_quality_unique ON skill_quality(skill_id, task_type)`,
]

export async function migrate() {
  logger.info('Running database migration...')

  for (const stmt of CREATE_TABLES) {
    try {
      db.run(sql.raw(stmt))
    } catch (err) {
      logger.warn({ error: (err as Error).message, table: stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] }, 'Migration warning')
    }
  }

  for (const stmt of CREATE_INDEXES) {
    try {
      db.run(sql.raw(stmt))
    } catch (err) {
      logger.warn({ error: (err as Error).message }, 'Index creation warning')
    }
  }

  logger.info({ tables: CREATE_TABLES.length, indexes: CREATE_INDEXES.length }, 'Migration complete')
}
