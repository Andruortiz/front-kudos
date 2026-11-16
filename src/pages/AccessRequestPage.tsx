import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { requestAccess } from '../api/access'
import { ApiError } from '../api/client'
import type { AccessResponse } from '../api/types'

export default function AccessRequestPage() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<AccessResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSending(true)
    try {
      setResult(await requestAccess(email.trim()))
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
          <h1>Pedir acceso</h1>
          {result ? (
            <>
              <p role="status">
                {result.status === 'INVITED'
                  ? 'Te enviamos una invitación de Microsoft a tu correo. Acéptala y luego entra a UCO Kudos.'
                  : 'Ya tienes acceso. Entra con tu cuenta de Microsoft.'}
              </p>
              <Link className="btn btn-primary" to="/inicio">
                Entrar con Microsoft
              </Link>
            </>
          ) : (
            <>
              <p className="muted">
                Escribe tu correo institucional. Te enviaremos una invitación para activar tu acceso.
              </p>
              <form onSubmit={submit}>
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
                {error && <p role="alert">{error}</p>}
                <button type="submit" disabled={sending}>
                  {sending ? 'Enviando...' : 'Pedir acceso'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
