import { getToken } from '../auth/token'
import type { ErrorBody } from './types'

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, 'network', 'No se pudo conectar con el servidor')
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null
    throw new ApiError(response.status, body?.code ?? 'unknown', body?.message ?? 'Ocurrió un error inesperado')
  }
  return (await response.json()) as T
}
