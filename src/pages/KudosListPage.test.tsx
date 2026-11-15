import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import KudosListPage from './KudosListPage'

afterEach(() => {
  vi.restoreAllMocks()
})

const kudo = { id: 'k1', authorId: 'a', recipientId: 'r', categoryId: 'c1', content: 'Gracias por tu ayuda', createdAt: '2026-11-14T10:00:00Z' }

function mockApi(kudos: unknown[], status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) =>
    String(input).includes('/categories')
      ? new Response(JSON.stringify({ items: [{ id: 'c1', name: 'Empatía' }] }), { status: 200 })
      : new Response(JSON.stringify(status === 200 ? { items: kudos } : { code: 'x', message: 'Falló' }), { status }),
  )
}

function renderPage(type: 'SENT' | 'RECEIVED') {
  render(
    <MemoryRouter>
      <KudosListPage type={type} />
    </MemoryRouter>,
  )
}

test('lists the sent kudos with their category name', async () => {
  const fetchMock = mockApi([kudo])
  renderPage('SENT')

  expect(await screen.findByText('Gracias por tu ayuda')).toBeInTheDocument()
  expect(screen.getByText('Empatía')).toBeInTheDocument()
  expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/kudos?type=SENT'))).toBe(true)
})

test('asks for the received kudos on the received page', async () => {
  const fetchMock = mockApi([])
  renderPage('RECEIVED')

  expect(await screen.findByText('Aún no hay Kudos.')).toBeInTheDocument()
  expect(fetchMock.mock.calls.some(([url]) => String(url).includes('type=RECEIVED'))).toBe(true)
})

test('shows the server message when the list fails', async () => {
  mockApi([], 403)
  renderPage('SENT')

  expect(await screen.findByRole('alert')).toHaveTextContent('Falló')
})
