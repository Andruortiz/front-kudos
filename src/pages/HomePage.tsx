import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <main>
      <h1>Bienvenido a UCO Kudos</h1>
      <p className="muted">Envía y recibe Kudos: reconocimientos de aprecio y gratitud entre compañeros.</p>
      <nav className="quick-links" aria-label="Accesos rápidos">
        <Link className="quick-link" to="/kudos/new">
          <strong>Enviar un Kudo</strong>
          <span>Reconoce a alguien con un mensaje.</span>
        </Link>
        <Link className="quick-link" to="/kudos/received">
          <strong>Kudos recibidos</strong>
          <span>Lo que te dedicaron.</span>
        </Link>
        <Link className="quick-link" to="/kudos/sent">
          <strong>Kudos enviados</strong>
          <span>Lo que has enviado.</span>
        </Link>
        <Link className="quick-link" to="/perfil">
          <strong>Mi perfil</strong>
          <span>Confirma tus datos y tu celular.</span>
        </Link>
      </nav>
    </main>
  )
}
