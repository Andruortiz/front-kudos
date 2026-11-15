import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <main>
      <h1>UCO Kudos</h1>

        <h3>Bienvenido a UCO Kudos</h3>
        <p>Esta aplicación permite enviar y recibir Kudos, que son reconocimientos de aprecio y gratitud entre compañeros.</p>
        <p>Para comenzar, puedes navegar a la sección de Kudos enviados o recibidos, o crear un nuevo Kudo.</p>
        <nav>
          <Link to="/kudos/sent">Ver Kudos enviados</Link> ·{' '}
          <Link to="/kudos/received">Ver Kudos recibidos</Link> ·{' '}
          <Link to="/kudos/new">Crear un nuevo Kudo</Link>
          <Link to={`/kudos/perfil`} >Confirma tus datos antes de continuar</Link>

        </nav>
    </main>
  )
}
