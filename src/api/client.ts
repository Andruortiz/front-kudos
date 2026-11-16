import { getToken } from '../auth/token'
import type { ErrorBody } from './types'

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const DEV_USER_ID: string | undefined = import.meta.env.VITE_DEV_USER_ID

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

/** Only for answers without a body, such as a proxy or a gateway error; the API itself always sends {code, message}. */
function fallbackMessage(status: number): string {
  if (status === 401) {
    return 'Tu sesión no es válida o expiró. Vuelve a iniciar sesión'
  }
  if (status === 403) {
    return 'No tienes permiso para hacer esto'
  }
  if (status >= 500) {
    return 'El servidor tuvo un problema. Inténtalo de nuevo en un momento'
  }
  return 'Ocurrió un error inesperado'
}

export async function authHeaders(base?: HeadersInit): Promise<Headers> {
  const headers = new Headers(base)
  const token = await getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  // shortcut: solo desarrollo, el backend local lo lee en lugar del login real; quitar con Entra
  if (import.meta.env.DEV && DEV_USER_ID) {
    headers.set('X-Dev-User', DEV_USER_ID)
  }
  return headers
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = await authHeaders(init.headers)
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, 'network', 'No se pudo conectar con el servidor')
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null
    throw new ApiError(response.status, body?.code ?? 'unknown', body?.message ?? fallbackMessage(response.status))
  }
  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}
