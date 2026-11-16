import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import KudoDetailPage from './KudoDetailPage'

afterEach(() => {
  vi.restoreAllMocks()
})

const detail = {
  id: 'k1',
  authorId: 'a',
  authorName: 'Ana Estudiante',
  recipientId: 'r',
  recipientName: 'Luis Docente',
  categoryId: 'c1',
  categoryName: 'Empatía',
  content: 'Gracias por tu ayuda',
  createdAt: '2026-11-14T10:00:00Z',
  attachments: [{ id: 'att1', name: 'nota.pdf', contentType: 'application/pdf', size: 3 * 1024 }],
}

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/kudos/k1']}>
      <Routes>
        <Route path="/kudos/:id" element={<KudoDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

test('shows the whole kudo with who sent it, who got it and its attachments', async () => {
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(detail), { status: 200 }))
  renderPage()

  expect(await screen.findByText('Gracias por tu ayuda')).toBeInTheDocument()
  expect(screen.getByText('De: Ana Estudiante')).toBeInTheDocument()
  expect(screen.getByText('Para: Luis Docente')).toBeInTheDocument()
  expect(screen.getByText('Empatía')).toBeInTheDocument()
  expect(screen.getByText('nota.pdf (3 KB)')).toBeInTheDocument()
  expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/api\/v1\/kudos\/k1$/)
})

test('downloads an attachment from its own endpoint and names the file', async () => {
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) =>
    String(url).endsWith('/attachments/att1')
      ? new Response(new Blob(['%PDF-1.4']), { status: 200 })
      : new Response(JSON.stringify(detail), { status: 200 }),
  )
  URL.createObjectURL = vi.fn(() => 'blob:x')
  URL.revokeObjectURL = vi.fn()
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  renderPage()

  fireEvent.click(await screen.findByRole('button', { name: 'nota.pdf (3 KB)' }))

  await waitFor(() => expect(click).toHaveBeenCalled())
  expect(String(fetchMock.mock.calls[1][0])).toMatch(/\/api\/v1\/kudos\/k1\/attachments\/att1$/)
})

test('shows the server message when the kudo is not found', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ code: 'kudo.not.found', message: 'El Kudo no existe' }), { status: 404 }),
  )
  renderPage()

  expect(await screen.findByRole('alert')).toHaveTextContent('El Kudo no existe')
})
