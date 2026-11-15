import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import KudosListPage from './KudosListPage'

afterEach(() => {
  vi.restoreAllMocks()
})

const kudo = {
  id: 'k1',
  authorId: 'a',
  authorName: 'Ana Estudiante',
  recipientId: 'r',
  recipientName: 'Luis Docente',
  categoryId: 'c1',
  categoryName: 'Empatía',
  content: 'Gracias por tu ayuda',
  createdAt: '2026-11-14T10:00:00Z',
}

function mockApi(kudos: unknown[], status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(status === 200 ? { items: kudos } : { code: 'x', message: 'Falló' }), { status }),
  )
}

test('lists the sent kudos with who they are for and their category', async () => {
  const fetchMock = mockApi([kudo])
  render(<MemoryRouter><KudosListPage type="SENT" /></MemoryRouter>)

  expect(await screen.findByText('Gracias por tu ayuda')).toBeInTheDocument()
  expect(screen.getByText('Empatía')).toBeInTheDocument()
  expect(screen.getByText('Para Luis Docente')).toBeInTheDocument()
  expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/kudos?type=SENT'))).toBe(true)
})

test('shows who sent each received kudo', async () => {
  const fetchMock = mockApi([kudo])
  render(<MemoryRouter><KudosListPage type="RECEIVED" /></MemoryRouter>)

  expect(await screen.findByText('De Ana Estudiante')).toBeInTheDocument()
  expect(fetchMock.mock.calls.some(([url]) => String(url).includes('type=RECEIVED'))).toBe(true)
})

test('falls back to a placeholder when a name is missing', async () => {
  mockApi([{ ...kudo, recipientName: null, categoryName: null }])
  render(<MemoryRouter><KudosListPage type="SENT" /></MemoryRouter>)

  expect(await screen.findByText('Para Usuario desconocido')).toBeInTheDocument()
  expect(screen.getByText('Sin categoría')).toBeInTheDocument()
})

test('says there are no kudos yet', async () => {
  mockApi([])
  render(<MemoryRouter><KudosListPage type="RECEIVED" /></MemoryRouter>)

  expect(await screen.findByText('Aún no hay Kudos.')).toBeInTheDocument()
})

test('shows the server message when the list fails', async () => {
  mockApi([], 403)
  render(<MemoryRouter><KudosListPage type="SENT" /></MemoryRouter>)

  expect(await screen.findByRole('alert')).toHaveTextContent('Falló')
})

test('each kudo links to its detail', async () => {
  mockApi([kudo])
  render(<MemoryRouter><KudosListPage type="SENT" /></MemoryRouter>)

  expect(await screen.findByRole('link', { name: /Empatía/ })).toHaveAttribute('href', '/kudos/k1')
})
