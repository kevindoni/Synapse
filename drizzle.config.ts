import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATA_DIR
      ? `${process.env.DATA_DIR}/db/adnify.db`
      : `${process.env.HOME || process.env.USERPROFILE}/.adnify/db/adnify.db`,
  },
})
