import { apiFetch } from './client'
import type { AccessResponse } from './types'

export function requestAccess(email: string): Promise<AccessResponse> {
  return apiFetch<AccessResponse>('/api/v1/access-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
}
