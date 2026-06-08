import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'path'
import os from 'os'
import fs from 'fs'

const dataDir = process.env.DATA_DIR || path.join(os.homedir(), '.synapse')
const dbDir = path.join(dataDir, 'db')
const dbPath = path.join(dbDir, 'synapse.db')

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')
sqlite.pragma('busy_timeout = 5000')

export const db = drizzle(sqlite, { schema })
export { sqlite }
