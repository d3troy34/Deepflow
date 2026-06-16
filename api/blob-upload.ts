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

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') return optionsResponse()
  if (request.method !== 'POST') return jsonResponse({ error: 'method not allowed' }, 405)

  try {
    const body = (await request.json()) as HandleUploadBody
    if (body.type === 'blob.generate-client-token') assertPublishToken(request)

    const result = await handleUpload({
      request,
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
    return jsonResponse(result)
  } catch (error) {
    return errorResponse(error)
  }
}
