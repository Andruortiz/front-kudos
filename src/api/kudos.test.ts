import { afterEach, expect, test, vi } from 'vitest'
import { ApiError } from './client'
import { publishKudo } from './kudos'

afterEach(() => {
  vi.restoreAllMocks()
})

const request = { recipientId: 'r', categoryId: 'c', content: 'Gracias' }

test('sends a multipart request with the idempotency key and returns the response', async () => {
  const body = { id: '1', status: 'PUBLISHED', createdAt: 'now', notifications: [] }
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), { status: 201 }),
  )

  const result = await publishKudo(request, [new File(['x'], 'a.pdf', { type: 'application/pdf' })], 'key-1')

  expect(result.id).toBe('1')
  const [url, init] = fetchMock.mock.calls[0]
  expect(String(url)).toMatch(/\/api\/v1\/kudos$/)
  expect(new Headers(init?.headers).get('Idempotency-Key')).toBe('key-1')
  const form = init?.body as FormData
  expect(form.get('kudo')).toBeInstanceOf(Blob)
  expect(form.getAll('files')).toHaveLength(1)
})

test('turns an error body into an ApiError with the server message', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ code: 'kudo.recipient.self', message: 'No puedes enviarte un Kudo a ti mismo' }), {
      status: 422,
    }),
  )

  await expect(publishKudo(request, [], 'key-2')).rejects.toMatchObject({
    status: 422,
    code: 'kudo.recipient.self',
    message: 'No puedes enviarte un Kudo a ti mismo',
  })
})

test('reports a network failure as an ApiError', async () => {
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('failed'))
  await expect(publishKudo(request, [], 'key-3')).rejects.toBeInstanceOf(ApiError)
})
