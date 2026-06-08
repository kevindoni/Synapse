export interface MCPTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  handler: (args: Record<string, unknown>) => Promise<unknown>
}

export interface MCPResource {
  uri: string
  name: string
  description: string
  mimeType: string
  read: () => Promise<string>
}

const tools: MCPTool[] = []
const resources: MCPResource[] = []

export function registerTool(tool: MCPTool) {
  const existing = tools.findIndex((t) => t.name === tool.name)
  if (existing >= 0) tools[existing] = tool
  else tools.push(tool)
}

export function registerResource(resource: MCPResource) {
  const existing = resources.findIndex((r) => r.uri === resource.uri)
  if (existing >= 0) resources[existing] = resource
  else resources.push(resource)
}

export function listTools(): Array<{ name: string; description: string; inputSchema: Record<string, unknown> }> {
  return tools.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema }))
}

export function listResources(): Array<{ uri: string; name: string; description: string; mimeType: string }> {
  return resources.map((r) => ({ uri: r.uri, name: r.name, description: r.description, mimeType: r.mimeType }))
}

export async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const tool = tools.find((t) => t.name === name)
  if (!tool) throw new Error(`Tool not found: ${name}`)
  return tool.handler(args)
}

export async function readResource(uri: string): Promise<string> {
  const resource = resources.find((r) => r.uri === uri)
  if (!resource) throw new Error(`Resource not found: ${uri}`)
  return resource.read()
}
