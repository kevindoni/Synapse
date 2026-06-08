import fs from 'fs'
import path from 'path'
import os from 'os'
import { configSchema, type Config } from './schema'
import { configDefaults } from './defaults'

let cachedConfig: Config | null = null

function getConfigPath(): string {
  const dataDir = process.env.DATA_DIR || path.join(os.homedir(), '.synapse')
  return path.join(dataDir, 'config.json')
}

function ensureDataDir(): void {
  const dataDir = process.env.DATA_DIR || path.join(os.homedir(), '.synapse')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

export function loadConfig(): Config {
  if (cachedConfig) return cachedConfig

  ensureDataDir()
  const configPath = getConfigPath()

  let rawConfig: Record<string, unknown> = {}
  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, 'utf-8')
      rawConfig = JSON.parse(raw)
    } catch {
      rawConfig = {}
    }
  }

  const merged = { ...configDefaults, ...rawConfig }
  const parsed = configSchema.safeParse(merged)

  if (!parsed.success) {
    console.error('Config validation errors:', parsed.error.flatten())
    cachedConfig = configDefaults
    return cachedConfig
  }

  cachedConfig = parsed.data

  if (!fs.existsSync(configPath)) {
    saveConfig(cachedConfig)
  }

  return cachedConfig
}

export function saveConfig(config: Config): void {
  ensureDataDir()
  const configPath = getConfigPath()
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
  cachedConfig = config
}

export function updateConfig(partial: Partial<Config>): Config {
  const current = loadConfig()
  const updated = { ...current, ...partial }
  const parsed = configSchema.parse(updated)
  saveConfig(parsed)
  return parsed
}

export function getConfig(): Config {
  return loadConfig()
}
