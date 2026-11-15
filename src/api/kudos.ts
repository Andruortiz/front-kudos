import { apiFetch } from './client'
import type { Kudo, KudoDetail, ListKudosResponse, PublishKudoRequest, PublishKudoResponse } from './types'

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

export type KudoType = 'SENT' | 'RECEIVED' | 'ALL'

export async function listKudos(type: KudoType, categoryId?: string): Promise<Kudo[]> {
  const params = new URLSearchParams({ type })
  if (categoryId) {
    params.set('categoryId', categoryId)
  }
  const response = await apiFetch<ListKudosResponse>(`/api/v1/kudos?${params}`)
  return response.items
}

export function getKudo(id: string): Promise<KudoDetail> {
  return apiFetch<KudoDetail>(`/api/v1/kudos/${encodeURIComponent(id)}`)
}
