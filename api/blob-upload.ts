import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import {
  PDF_MAX_BYTES,
  assertPublishToken,
  errorResponse,
  jsonResponse,
  optionsResponse,
  parseUploadClientPayload,
  validateUploadPath,
} from './_publicationTypes.js'
import {
  nodeRequestUrl,
  readJsonBody,
  sendResponse,
  type NodeRequest,
  type NodeResponse,
} from './_node.js'

export default async function handler(request: NodeRequest, response: NodeResponse): Promise<void> {
  if (request.method === 'OPTIONS') return sendResponse(response, optionsResponse())
  if (request.method !== 'POST') return sendResponse(response, jsonResponse({ error: 'method not allowed' }, 405))

  try {
    const body = (await readJsonBody(request)) as HandleUploadBody
    const webRequest = toWebRequest(request)
    if (body.type === 'blob.generate-client-token') assertPublishToken(request)

    const result = await handleUpload({
      request: webRequest,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = parseUploadClientPayload(clientPayload)
        validateUploadPath(pathname, payload)
        return {
          allowedContentTypes: ['application/pdf'],
          maximumSizeInBytes: PDF_MAX_BYTES,
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 31536000,
          tokenPayload: JSON.stringify(payload),
        }
      },
      onUploadCompleted: async () => {},
    })
    return sendResponse(response, jsonResponse(result))
  } catch (error) {
    return sendResponse(response, errorResponse(error))
  }
}

function toWebRequest(request: NodeRequest): Request {
  const headers = new Headers()
  for (const [key, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) headers.set(key, value.join(', '))
    else if (value !== undefined) headers.set(key, value)
  }
  return new Request(nodeRequestUrl(request), {
    method: request.method,
    headers,
  })
}
