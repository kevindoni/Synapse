import pino from 'pino'
import { getConfig } from '../config'

const config = getConfig()

export const logger = pino({
  level: config.logLevel || 'info',
  transport: {
    target: 'pino/file',
    options: { destination: 1 },
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})
