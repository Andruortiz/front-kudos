import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import RegisterPage from './RegisterPage'

afterEach(() => {
  vi.restoreAllMocks()
})

function fillForm() {
  fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: ' Pedro Pérez ' } })
  fireEvent.change(screen.getByLabelText('Correo institucional'), { target: { value: 'pedro@uco.net.co' } })
  fireEvent.change(screen.getByLabelText(/Celular/), { target: { value: '+573001234567' } })
  fireEvent.change(screen.getByLabelText('Rol'), { target: { value: 'TEACHER' } })
}

function renderPage() {
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  )
}

test('sends the request and says it is pending', async () => {
  const fetchMock = vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response(JSON.stringify({ id: 'r1', status: 'PENDING' }), { status: 201 }))
  renderPage()

  fillForm()
  fireEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }))

  expect(await screen.findByRole('status')).toHaveTextContent('pendiente de aprobación')
  const [url, init] = fetchMock.mock.calls[0]
  expect(String(url)).toMatch(/\/api\/v1\/registrations$/)
  expect(JSON.parse(String(init?.body))).toEqual({
    name: 'Pedro Pérez',
    email: 'pedro@uco.net.co',
    phone: '+573001234567',
    role: 'TEACHER',
  })
})

test('shows the server message when the email is not allowed', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ code: 'user.email.not.institutional', message: 'El correo debe ser institucional' }), {
      status: 422,
    }),
  )
  renderPage()

  fillForm()
  fireEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('El correo debe ser institucional')
})
