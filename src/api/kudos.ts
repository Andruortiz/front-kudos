import { API_URL, ApiError, apiFetch, authHeaders } from './client'
import type {
  AttachmentInfo,
  ErrorBody,
  Kudo,
  KudoDetail,
  ListKudosResponse,
  PublishKudoRequest,
  PublishKudoResponse,
} from './types'

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

export async function downloadAttachment(kudoId: string, attachment: AttachmentInfo): Promise<void> {
  let response: Response
  try {
    response = await fetch(`${API_URL}/api/v1/kudos/${kudoId}/attachments/${attachment.id}`, {
      headers: await authHeaders(),
    })
  } catch {
    throw new ApiError(0, 'network', 'No se pudo conectar con el servidor')
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null
    throw new ApiError(response.status, body?.code ?? 'unknown', body?.message ?? 'No se pudo descargar el adjunto')
  }
  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = attachment.name
  link.click()
  URL.revokeObjectURL(url)
}

export type KudoType ='SENT' | 'RECEIVED' | 'ALL'

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
