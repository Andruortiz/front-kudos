import { apiFetch } from './client'
import type { ListRecipientsResponse, Recipient } from './types'

export async function listRecipients(text: string): Promise<Recipient[]> {
  const query = text ? `?q=${encodeURIComponent(text)}` : ''
  const response = await apiFetch<ListRecipientsResponse>(`/api/v1/recipients${query}`)
  return response.items
}
