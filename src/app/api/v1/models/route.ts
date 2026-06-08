import { NextResponse } from 'next/server'
import { registry } from '@/lib/providers/registry'

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: getCorsHeaders() })
}

export async function GET() {
  const allModels: Array<{
    id: string
    object: string
    created: number
    owned_by: string
  }> = []

  for (const adapter of registry.list()) {
    try {
      const models = await adapter.fetchModels()
      for (const model of models) {
        allModels.push({
          id: model.id,
          object: 'model',
          created: Math.floor(Date.now() / 1000),
          owned_by: adapter.info.name,
        })
      }
    } catch {
      continue
    }
  }

  return NextResponse.json({
    object: 'list',
    data: allModels,
  }, { headers: getCorsHeaders() })
}
