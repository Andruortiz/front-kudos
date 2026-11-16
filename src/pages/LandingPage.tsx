import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="public-page">
      <main>
        <div className="brand">UCO Kudos</div>
        <section className="hero">
          <h1>UCO Kudos</h1>
          <p className="hero__tagline">
            Reconoce a quien te ayudó. Envía y recibe Kudos: pequeños mensajes de aprecio y gratitud entre compañeros y
            docentes.
          </p>
          <div className="hero__actions">
            <Link className="btn btn-primary" to="/inicio">
              Entrar con Microsoft
            </Link>
          </div>
        </section>
        <section className="features" aria-label="Qué puedes hacer">
          <div className="feature">
            <h2>Reconoce</h2>
            <p>Agradece a un compañero o docente con un mensaje y elige la categoría que mejor lo describe.</p>
          </div>
          <div className="feature">
            <h2>Recibe</h2>
            <p>Mira los Kudos que te enviaron y quién te los dedicó, todo en un solo lugar.</p>
          </div>
          <div className="feature">
            <h2>Comparte</h2>
            <p>Adjunta imágenes o PDF para que el reconocimiento quede completo.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
