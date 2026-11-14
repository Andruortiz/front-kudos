import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import type { Recipient } from '../api/types'
import RecipientPicker from './RecipientPicker'

afterEach(() => {
  vi.restoreAllMocks()
})

const luis: Recipient = { id: 'u1', name: 'Luis', email: 'luis@uco.net.co', role: 'TEACHER' }

function respond(items: Recipient[]) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ items }), { status: 200 }))
}

function urls(fetchMock: ReturnType<typeof respond>) {
  return fetchMock.mock.calls.map(([url]) => String(url))
}

test('lists the suggestions on open and selects one', async () => {
  const fetchMock = respond([luis])
  const onSelect = vi.fn()
  render(<RecipientPicker selected={null} onSelect={onSelect} debounceMs={0} />)

  const option = await screen.findByRole('button', { name: /Luis · Docente · luis@uco.net.co/ })
  expect(urls(fetchMock)[0]).toMatch(/\/api\/v1\/recipients$/)

  fireEvent.click(option)
  expect(onSelect).toHaveBeenCalledWith(luis)
})

test('does not search with fewer than three letters and searches from three', async () => {
  const fetchMock = respond([luis])
  render(<RecipientPicker selected={null} onSelect={() => undefined} debounceMs={0} />)
  await screen.findByRole('button', { name: /Luis/ })
  fetchMock.mockClear()

  fireEvent.change(screen.getByLabelText('Destinatario'), { target: { value: 'lu' } })
  expect(await screen.findByText('Escribe al menos 3 letras para buscar')).toBeInTheDocument()
  expect(fetchMock).not.toHaveBeenCalled()

  fireEvent.change(screen.getByLabelText('Destinatario'), { target: { value: 'lui' } })
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
  expect(urls(fetchMock)[0]).toMatch(/\?q=lui$/)
})

test('shows the server message when the list cannot be loaded', async () => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    async () => new Response(JSON.stringify({ code: 'user.not.found', message: 'El usuario no existe' }), { status: 404 }),
  )
  render(<RecipientPicker selected={null} onSelect={() => undefined} debounceMs={0} />)

  expect(await screen.findByRole('alert')).toHaveTextContent('El usuario no existe')
})

test('shows the chosen recipient and lets the user change it', () => {
  const onSelect = vi.fn()
  render(<RecipientPicker selected={luis} onSelect={onSelect} />)

  expect(screen.getByText('Destinatario: Luis (Docente)')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Cambiar destinatario' }))
  expect(onSelect).toHaveBeenCalledWith(null)
})
