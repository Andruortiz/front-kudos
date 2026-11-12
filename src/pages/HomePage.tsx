import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <main>
      <h1>UCO Kudos</h1>
      <nav>
        <Link to="/kudos/new">Enviar Kudo</Link>
      </nav>
    </main>
  )
}
