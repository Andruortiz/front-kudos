import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import PublishKudoPage from './PublishKudoPage'

afterEach(() => {
  vi.restoreAllMocks()
})

const luis = { id: 'u1', name: 'Luis', email: 'luis@uco.net.co', role: 'TEACHER' }

function mockApi(publishResponse: () => Response) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) =>
    String(input).includes('/categories')
      ? new Response(JSON.stringify({ items: [{ id: 'c1', name: 'Empatía' }] }), { status: 200 })
      : String(input).includes('/recipients')
      ? new Response(JSON.stringify({ items: [luis] }), { status: 200 })
      : publishResponse(),
  )
}

function publishCalls(fetchMock: ReturnType<typeof mockApi>) {
  return fetchMock.mock.calls.filter(([url]) => !/\/(recipients|categories)/.test(String(url)))
}

function renderPage() {
  render(
    <MemoryRouter>
      <PublishKudoPage />
    </MemoryRouter>,
  )
}

async function fill() {
  fireEvent.click(await screen.findByRole('button', { name: /Luis · Docente/ }))
  await screen.findByRole('option', { name: 'Empatía' })
  fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'c1' } })
  fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Gracias por tu ayuda' } })
}

test('publishes the kudo to the chosen recipient and shows the state of each channel', async () => {
  const body = {
    id: '1',
    status: 'PUBLISHED',
    createdAt: 'now',
    notifications: [
      { channel: 'EMAIL', status: 'PENDING' },
      { channel: 'WHATSAPP', status: 'PENDING' },
    ],
  }
  const fetchMock = mockApi(() => new Response(JSON.stringify(body), { status: 201 }))
  renderPage()

  await fill()
  fireEvent.click(screen.getByRole('button', { name: 'Enviar Kudo' }))

  expect(await screen.findByRole('heading', { name: 'Kudo publicado' })).toBeInTheDocument()
  expect(screen.getByText('EMAIL: PENDING')).toBeInTheDocument()
  expect(screen.getByText('WHATSAPP: PENDING')).toBeInTheDocument()
  const form = publishCalls(fetchMock)[0][1]?.body as FormData
  const sent = JSON.parse(await (form.get('kudo') as Blob).text())
  expect(sent.recipientId).toBe('u1')
})

test('asks to choose a recipient before sending', async () => {
  const fetchMock = mockApi(() => new Response('{}', { status: 201 }))
  renderPage()
  await screen.findByRole('option', { name: 'Empatía' })
  fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'c1' } })
  fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Hola' } })

  fireEvent.click(screen.getByRole('button', { name: 'Enviar Kudo' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('Elige un destinatario')
  expect(publishCalls(fetchMock)).toHaveLength(0)
})

test('shows the server message when the API rejects the kudo', async () => {
  mockApi(
    () =>
      new Response(JSON.stringify({ code: 'kudo.role.not.allowed', message: 'Tu rol no puede enviar Kudos a ese destinatario' }), {
        status: 403,
      }),
  )
  renderPage()

  await fill()
  fireEvent.click(screen.getByRole('button', { name: 'Enviar Kudo' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('Tu rol no puede enviar Kudos a ese destinatario')
})

test('blocks more than five attachments without calling the publish API', async () => {
  const fetchMock = mockApi(() => new Response('{}', { status: 201 }))
  renderPage()
  await fill()
  const files = Array.from({ length: 6 }, (_, i) => new File(['x'], `a${i}.pdf`, { type: 'application/pdf' }))
  fireEvent.change(screen.getByLabelText(/Adjuntos/), { target: { files } })

  fireEvent.click(screen.getByRole('button', { name: 'Enviar Kudo' }))

  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('máximo 5 adjuntos'))
  expect(publishCalls(fetchMock)).toHaveLength(0)
})

test('lets the user remove a selected file before sending', async () => {
  const fetchMock = mockApi(() => new Response(JSON.stringify({ id: 'k1', status: 'PUBLISHED', createdAt: 'now', notifications: [] }), { status: 201 }))
  renderPage()
  await fill()
  const files = [
    new File(['%PDF'], 'uno.pdf', { type: 'application/pdf' }),
    new File(['%PDF'], 'dos.pdf', { type: 'application/pdf' }),
  ]
  fireEvent.change(screen.getByLabelText(/Adjuntos/), { target: { files } })

  fireEvent.click(screen.getByRole('button', { name: 'Quitar uno.pdf' }))
  fireEvent.click(screen.getByRole('button', { name: 'Enviar Kudo' }))

  await waitFor(() => expect(publishCalls(fetchMock)).toHaveLength(1))
  const body = publishCalls(fetchMock)[0][1]?.body as FormData
  expect((body.getAll('files') as File[]).map((file) => file.name)).toEqual(['dos.pdf'])
})

test('reuses the idempotency key when the same submission is retried after an error', async () => {
  const fetchMock = mockApi(
    () => new Response(JSON.stringify({ code: 'kudo.scanner.unavailable', message: 'No se pudo analizar' }), { status: 503 }),
  )
  renderPage()
  await fill()

  fireEvent.click(screen.getByRole('button', { name: 'Enviar Kudo' }))
  await screen.findByRole('alert')
  fireEvent.click(screen.getByRole('button', { name: 'Enviar Kudo' }))
  await waitFor(() => expect(publishCalls(fetchMock)).toHaveLength(2))

  const keys = publishCalls(fetchMock).map(([, init]) => new Headers(init?.headers).get('Idempotency-Key'))
  expect(keys[0]).toBeTruthy()
  expect(keys[1]).toBe(keys[0])
})
