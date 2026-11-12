import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import PublishKudoPage from './PublishKudoPage'

afterEach(() => {
  vi.restoreAllMocks()
})

function renderPage() {
  render(
    <MemoryRouter>
      <PublishKudoPage />
    </MemoryRouter>,
  )
}

function fill() {
  fireEvent.change(screen.getByLabelText('Destinatario'), { target: { value: 'r1' } })
  fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'c1' } })
  fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Gracias por tu ayuda' } })
}

test('publishes the kudo and shows the state of each channel', async () => {
  const body = {
    id: '1',
    status: 'PUBLISHED',
    createdAt: 'now',
    notifications: [
      { channel: 'EMAIL', status: 'PENDING' },
      { channel: 'WHATSAPP', status: 'PENDING' },
    ],
  }
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status: 201 }))
  renderPage()

  fill()
  fireEvent.click(screen.getByRole('button', { name: 'Enviar Kudo' }))

  expect(await screen.findByRole('heading', { name: 'Kudo publicado' })).toBeInTheDocument()
  expect(screen.getByText('EMAIL: PENDING')).toBeInTheDocument()
  expect(screen.getByText('WHATSAPP: PENDING')).toBeInTheDocument()
})

test('shows the server message when the API rejects the kudo', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ code: 'kudo.role.not.allowed', message: 'Tu rol no puede enviar Kudos a ese destinatario' }), {
      status: 403,
    }),
  )
  renderPage()

  fill()
  fireEvent.click(screen.getByRole('button', { name: 'Enviar Kudo' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('Tu rol no puede enviar Kudos a ese destinatario')
})

test('blocks more than five attachments without calling the API', async () => {
  const fetchMock = vi.spyOn(globalThis, 'fetch')
  renderPage()
  fill()
  const files = Array.from({ length: 6 }, (_, i) => new File(['x'], `a${i}.pdf`, { type: 'application/pdf' }))
  fireEvent.change(screen.getByLabelText(/Adjuntos/), { target: { files } })

  fireEvent.click(screen.getByRole('button', { name: 'Enviar Kudo' }))

  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('máximo 5 adjuntos'))
  expect(fetchMock).not.toHaveBeenCalled()
})

test('reuses the idempotency key when the same submission is retried after an error', async () => {
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ code: 'kudo.scanner.unavailable', message: 'No se pudo analizar' }), { status: 503 }),
  )
  renderPage()
  fill()

  fireEvent.click(screen.getByRole('button', { name: 'Enviar Kudo' }))
  await screen.findByRole('alert')
  fireEvent.click(screen.getByRole('button', { name: 'Enviar Kudo' }))
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))

  const keys = fetchMock.mock.calls.map(([, init]) => new Headers(init?.headers).get('Idempotency-Key'))
  expect(keys[0]).toBeTruthy()
  expect(keys[1]).toBe(keys[0])
})
