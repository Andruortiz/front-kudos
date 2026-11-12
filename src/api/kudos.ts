import { apiFetch } from './client'
import type { PublishKudoRequest, PublishKudoResponse } from './types'

export function publishKudo(
  request: PublishKudoRequest,
  files: File[],
  idempotencyKey: string,
): Promise<PublishKudoResponse> {
  const body = new FormData()
  body.append('kudo', new Blob([JSON.stringify(request)], { type: 'application/json' }))
  files.forEach((file) => body.append('files', file))
  return apiFetch<PublishKudoResponse>('/api/v1/kudos', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body,
  })
}
