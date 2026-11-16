import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import App from './App'

afterEach(() => {
  vi.restoreAllMocks()
})

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

test('the landing is public and offers to sign in with Microsoft', () => {
  renderAt('/')

  expect(screen.getByRole('heading', { name: 'UCO Kudos' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Entrar con Microsoft' })).toHaveAttribute('href', '/inicio')
  expect(screen.getByRole('link', { name: 'Pedir acceso' })).toHaveAttribute('href', '/acceso')
})

test('the home behind the login shows the navigation and the quick links', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
  renderAt('/inicio')

  expect(await screen.findByRole('link', { name: /Enviar un Kudo/ })).toHaveAttribute('href', '/kudos/new')
  expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
})

test('shows not found for unknown routes', () => {
  renderAt('/nada')

  expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
})
