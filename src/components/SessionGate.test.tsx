import { render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import SessionGate from './SessionGate'

afterEach(() => {
  vi.restoreAllMocks()
})

test('shows the reason when the account is not registered', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ code: 'auth.user.not.registered', message: 'Tu cuenta no está registrada' }), {
      status: 401,
    }),
  )
  render(<SessionGate canLogout={false}><p>contenido</p></SessionGate>)

  expect(await screen.findByRole('alert')).toHaveTextContent('Tu cuenta no está registrada')
  expect(screen.queryByText('contenido')).not.toBeInTheDocument()
})

test('lets a registered user through', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
  render(<SessionGate canLogout={false}><p>contenido</p></SessionGate>)

  expect(await screen.findByText('contenido')).toBeInTheDocument()
})

test('does not block for errors that are not about the account', async () => {
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('failed'))
  render(<SessionGate canLogout={false}><p>contenido</p></SessionGate>)

  expect(await screen.findByText('contenido')).toBeInTheDocument()
})
