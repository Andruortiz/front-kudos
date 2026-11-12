import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import App from './App'

test('shows the home page with a link to publish a kudo', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { name: 'UCO Kudos' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Enviar Kudo' })).toHaveAttribute('href', '/kudos/new')
})

test('shows not found for unknown routes', () => {
  render(
    <MemoryRouter initialEntries={['/nada']}>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
})
