import { afterEach, expect, test, vi } from 'vitest'
import { apiFetch } from './client'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

async function sentHeaders() {
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
  await apiFetch('/api/v1/me')
  return new Headers(fetchMock.mock.calls[0][1]?.headers)
}

test('sends no X-Dev-User header when VITE_DEV_USER_ID is not set', async () => {
  expect((await sentHeaders()).get('X-Dev-User')).toBeNull()
})

test('sends the X-Dev-User header in development when VITE_DEV_USER_ID is set', async () => {
  vi.resetModules()
  vi.stubEnv('VITE_DEV_USER_ID', '00000000-0000-0000-0000-000000000002')
  const { apiFetch: freshFetch } = await import('./client')
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))

  await freshFetch('/api/v1/me')

  expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get('X-Dev-User')).toBe(
    '00000000-0000-0000-0000-000000000002',
  )
})

test('sends the access token from the provider as a Bearer header', async () => {
  vi.resetModules()
  const { setTokenProvider } = await import('../auth/token')
  const { apiFetch: freshFetch } = await import('./client')
  setTokenProvider(async () => 'abc.def')
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))

  await freshFetch('/api/v1/me')

  expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get('Authorization')).toBe('Bearer abc.def')
})

test('uses a readable message when the answer has no body', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 401 }))

  await expect(apiFetch('/api/v1/me')).rejects.toMatchObject({
    status: 401,
    message: 'Tu sesión no es válida o expiró. Vuelve a iniciar sesión',
  })
})
