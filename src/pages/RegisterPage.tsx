import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { submitRegistration } from '../api/registrations'
import type { SelfRegistrationRole } from '../api/types'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<SelfRegistrationRole>('STUDENT')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSending(true)
    try {
      await submitRegistration({ name: name.trim(), email: email.trim(), phone: phone.trim(), role })
      setSent(true)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo enviar la solicitud')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="public-page">
      <main>
        <Link to="/" className="brand">
          UCO Kudos
        </Link>
        <div className="form-page">
          <h1>Registrarme</h1>
          {sent ? (
            <>
              <p role="status">Tu solicitud quedó pendiente de aprobación.</p>
              <p className="muted">Un responsable la revisará. Cuando esté aprobada podrás iniciar sesión.</p>
              <Link className="btn" to="/">
                Volver al inicio
              </Link>
            </>
          ) : (
            <>
              <p className="muted">
                Llena el cuestionario con tus datos. Tu solicitud será revisada antes de activar tu cuenta.
              </p>
              <form onSubmit={submit}>
                <label>
                  Nombre completo
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
                </label>
                <label>
                  Correo institucional
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  Celular (formato internacional)
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+573001234567"
                    autoComplete="tel"
                    required
                  />
                </label>
                <label>
                  Rol
                  <select value={role} onChange={(e) => setRole(e.target.value as SelfRegistrationRole)}>
                    <option value="STUDENT">Estudiante</option>
                    <option value="TEACHER">Docente</option>
                  </select>
                </label>
                {error && <p role="alert">{error}</p>}
                <button type="submit" disabled={sending}>
                  {sending ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </form>
              <p className="muted">
                ¿Ya tienes cuenta? <Link to="/inicio">Iniciar sesión</Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
