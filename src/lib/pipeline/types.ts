export type NodeType = 'input' | 'cache_check' | 'squeezer' | 'router' | 'provider_call' | 'fallback' | 'skill_apply' | 'cache_store' | 'benchmark' | 'plugin' | 'output' | 'condition'

export interface PipelineNode {
  id: string
  type: NodeType
  label: string
  config: Record<string, unknown>
  position: { x: number; y: number }
}

export interface PipelineConnection {
  id: string
  source: string
  target: string
  condition?: string
}

export interface Pipeline {
  id: string
  name: string
  description: string
  nodes: PipelineNode[]
  connections: PipelineConnection[]
  isDefault: boolean
}

export interface PipelineContext {
  request: import('../providers/types').NormalizedRequest
  response?: import('../providers/types').NormalizedResponse
  metadata: Record<string, unknown>
  currentNode?: string
  history: Array<{ node: string; result: string; durationMs: number }>
}

const DEFAULT_PIPELINE_NODES: PipelineNode[] = [
  { id: 'input', type: 'input', label: 'Request Input', config: {}, position: { x: 0, y: 0 } },
  { id: 'cache', type: 'cache_check', label: 'Cache Check', config: {}, position: { x: 200, y: 0 } },
  { id: 'squeeze', type: 'squeezer', label: 'Token Squeezer', config: { level: 'balanced' }, position: { x: 400, y: 0 } },
  { id: 'skill', type: 'skill_apply', label: 'Apply Skill', config: {}, position: { x: 600, y: -100 } },
  { id: 'router', type: 'router', label: 'Neural Router', config: { strategy: 'hybrid' }, position: { x: 600, y: 100 } },
  { id: 'provider', type: 'provider_call', label: 'Provider Call', config: {}, position: { x: 800, y: 0 } },
  { id: 'fallback', type: 'fallback', label: 'Fallback Engine', config: {}, position: { x: 1000, y: 0 } },
  { id: 'benchmark', type: 'benchmark', label: 'Benchmark', config: { enabled: false }, position: { x: 1200, y: -100 } },
  { id: 'plugin', type: 'plugin', label: 'Post-Process', config: { plugins: [] }, position: { x: 1200, y: 100 } },
  { id: 'cache_store', type: 'cache_store', label: 'Cache Store', config: {}, position: { x: 1400, y: 0 } },
  { id: 'output', type: 'output', label: 'Response Output', config: {}, position: { x: 1600, y: 0 } },
]

const DEFAULT_PIPELINE_CONNECTIONS: PipelineConnection[] = [
  { id: 'c1', source: 'input', target: 'cache' },
  { id: 'c2', source: 'cache', target: 'squeeze', condition: 'cache_miss' },
  { id: 'c3', source: 'squeeze', target: 'skill' },
  { id: 'c4', source: 'squeeze', target: 'router' },
  { id: 'c5', source: 'router', target: 'provider' },
  { id: 'c6', source: 'provider', target: 'fallback', condition: 'error' },
  { id: 'c7', source: 'provider', target: 'benchmark', condition: 'success' },
  { id: 'c8', source: 'provider', target: 'plugin', condition: 'success' },
  { id: 'c9', source: 'fallback', target: 'plugin', condition: 'success' },
  { id: 'c10', source: 'plugin', target: 'cache_store' },
  { id: 'c11', source: 'cache_store', target: 'output' },
  { id: 'c12', source: 'cache', target: 'output', condition: 'cache_hit' },
]

export const DEFAULT_PIPELINE: Pipeline = {
  id: 'default',
  name: 'Default Pipeline',
  description: 'Standard request processing pipeline with cache, squeeze, route, fallback',
  nodes: DEFAULT_PIPELINE_NODES,
  connections: DEFAULT_PIPELINE_CONNECTIONS,
  isDefault: true,
}

export function getNodesAfter(pipeline: Pipeline, nodeId: string, condition?: string): PipelineConnection[] {
  return pipeline.connections.filter(
    (c) => c.source === nodeId && (!condition || c.condition === condition || !c.condition),
  )
}
