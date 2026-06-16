import type { IncomingMessage, ServerResponse } from 'node:http'

export interface NodeRequest extends IncomingMessage {
  body?: unknown
  query?: Record<string, string | string[]>
}

export type NodeResponse = ServerResponse

export async function readJsonBody(request: NodeRequest): Promise<unknown> {
  if (request.body !== undefined) return request.body
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim()
  if (!raw) return {}
  return JSON.parse(raw)
}

export async function sendResponse(response: NodeResponse, webResponse: Response): Promise<void> {
  response.statusCode = webResponse.status
  webResponse.headers.forEach((value, key) => {
    response.setHeader(key, value)
  })
  try {
    const buffer = await webResponse.arrayBuffer()
    response.end(Buffer.from(buffer))
  } catch (error) {
    response.statusCode = 500
    response.setHeader('content-type', 'application/json')
    response.end(JSON.stringify({
      error: error instanceof Error ? error.message : 'unknown response error',
    }))
  }
}

export async function sendJsonResponse(
  response: NodeResponse,
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Promise<void> {
  response.statusCode = status
  response.setHeader('content-type', 'application/json')
  for (const [key, value] of Object.entries(headers)) {
    response.setHeader(key, value)
  }
  response.end(JSON.stringify(body))
}

export function nodeRequestUrl(request: NodeRequest): string {
  const proto = String(request.headers['x-forwarded-proto'] ?? 'https').split(',')[0]
  const host = request.headers.host ?? 'localhost'
  return `${proto}://${host}${request.url ?? '/'}`
}
