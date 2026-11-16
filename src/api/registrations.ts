import { apiFetch } from './client'
import type { RegistrationResponse } from './types'

export function submitRegistration(): Promise<RegistrationResponse> {
  return apiFetch<RegistrationResponse>('/api/v1/registrations', { method: 'POST' })
}
