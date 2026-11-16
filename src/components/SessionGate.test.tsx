import { render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import SessionGate from './SessionGate'

afterEach(() => {
  vi.restoreAllMocks()
})

function renderGate() {
  render(
    <SessionGate canLogout={false}>
      <p>contenido</p>
    </SessionGate>,
  )
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status })
}

test('creates the account on the first login and then lets the person in', async () => {
  const fetchMock = vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(json({ code: 'auth.user.not.registered', message: 'Sin cuenta' }, 401))
    .mockResolvedValueOnce(json({ id: 'u1', status: 'APPROVED' }, 201))
  renderGate()

  expect(await screen.findByText('contenido')).toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledTimes(2)
  const [url, init] = fetchMock.mock.calls[1]
  expect(String(url)).toMatch(/\/api\/v1\/registrations$/)
  expect(init?.method).toBe('POST')
})

test('shows the reason when the account cannot be created', async () => {
  vi.spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(json({ code: 'auth.user.not.registered', message: 'Sin cuenta' }, 401))
    .mockResolvedValueOnce(
      json({ code: 'user.email.not.institutional', message: 'El correo debe ser institucional' }, 422),
    )
  renderGate()

  expect(await screen.findByRole('alert')).toHaveTextContent('El correo debe ser institucional')
  expect(screen.queryByText('contenido')).not.toBeInTheDocument()
})

test('shows the reason when the email is not allowed', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    json({ code: 'auth.email.not.allowed', message: 'Correo no permitido' }, 401),
  )
  renderGate()

  expect(await screen.findByRole('alert')).toHaveTextContent('Correo no permitido')
  expect(screen.queryByText('contenido')).not.toBeInTheDocument()
})

test('lets a registered user through', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
  renderGate()

  expect(await screen.findByText('contenido')).toBeInTheDocument()
})

test('does not block for errors that are not about the account', async () => {
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('failed'))
  renderGate()

  expect(await screen.findByText('contenido')).toBeInTheDocument()
})
