import { apiFetch } from './client'
import type { RegistrationRequest, RegistrationResponse } from './types'

export function submitRegistration(request: RegistrationRequest): Promise<RegistrationResponse> {
  return apiFetch<RegistrationResponse>('/api/v1/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
}
