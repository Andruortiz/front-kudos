import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import ProfilePage from './ProfilePage'

afterEach(() => {
  vi.restoreAllMocks()
})

const profile = {
  id: 'u1', name: 'Ana Estudiante', email: 'ana@uco.net.co', phone: null,
  phoneVerified: false, role: 'STUDENT', status: 'ACTIVE',
}

test('shows my data and saves a new phone', async () => {
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) =>
    new Response(JSON.stringify(init?.method === 'PUT' ? { ...profile, phone: '+573001234567' } : profile), { status: 200 }),
  )
  render(<ProfilePage />)

  expect(await screen.findByText('Nombre: Ana Estudiante')).toBeInTheDocument()
  expect(screen.getByText(/Sin registrar/)).toBeInTheDocument()
  fireEvent.change(screen.getByLabelText(/Celular/), { target: { value: '+573001234567' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar celular' }))

  expect(await screen.findByRole('status')).toHaveTextContent('Celular actualizado')
  const put = fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT')
  expect(JSON.parse(String(put?.[1]?.body))).toEqual({ phone: '+573001234567' })
})

test('shows the server message when the phone is invalid', async () => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) =>
    init?.method === 'PUT'
      ? new Response(JSON.stringify({ code: 'user.phone.invalid', message: 'El celular debe usar el formato internacional' }), { status: 422 })
      : new Response(JSON.stringify(profile), { status: 200 }),
  )
  render(<ProfilePage />)
  await screen.findByText('Nombre: Ana Estudiante')

  fireEvent.change(screen.getByLabelText(/Celular/), { target: { value: '3001234567' } })
  fireEvent.click(screen.getByRole('button', { name: 'Guardar celular' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('formato internacional')
})
