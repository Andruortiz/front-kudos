import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import AccessRequestPage from './AccessRequestPage'

afterEach(() => {
  vi.restoreAllMocks()
})

function sendEmail(email: string) {
  render(
    <MemoryRouter>
      <AccessRequestPage />
    </MemoryRouter>,
  )
  fireEvent.change(screen.getByLabelText('Correo institucional'), { target: { value: email } })
  fireEvent.click(screen.getByRole('button', { name: 'Pedir acceso' }))
}

test('sends the email and tells the person to accept the invitation', async () => {
  const fetchMock = vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response(JSON.stringify({ status: 'INVITED' }), { status: 200 }))

  sendEmail(' pedro@uco.net.co ')

  expect(await screen.findByRole('status')).toHaveTextContent('Te enviamos una invitación')
  const [url, init] = fetchMock.mock.calls[0]
  expect(String(url)).toMatch(/\/api\/v1\/access-requests$/)
  expect(JSON.parse(String(init?.body))).toEqual({ email: 'pedro@uco.net.co' })
})

test('tells the person who already has access to just sign in', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ status: 'ALREADY_HAS_ACCESS' }), { status: 200 }),
  )

  sendEmail('ana@uco.net.co')

  expect(await screen.findByRole('status')).toHaveTextContent('Ya tienes acceso')
})

test('shows the server message when the email is not allowed', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ code: 'user.email.not.institutional', message: 'El correo debe ser institucional' }), {
      status: 422,
    }),
  )

  sendEmail('alguien@gmail.com')

  expect(await screen.findByRole('alert')).toHaveTextContent('El correo debe ser institucional')
})
