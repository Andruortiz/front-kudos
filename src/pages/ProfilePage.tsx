import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError } from '../api/client'
import { confirmPhoneCode, getProfile, requestPhoneCode, updatePhone } from '../api/profile'
import type { Profile } from '../api/types'
import { roleLabel } from '../kudos/roles'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    getProfile()
      .then((loaded) => {
        if (!cancelled) {
          setProfile(loaded)
          setPhone(loaded.phone ?? '')
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : 'No se pudo cargar el perfil')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function run(action: () => Promise<void>, failure: string) {
    setError(null)
    setMessage(null)
    setBusy(true)
    try {
      await action()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : failure)
    } finally {
      setBusy(false)
    }
  }

  function savePhone(event: FormEvent) {
    event.preventDefault()
    return run(async () => {
      const updated = await updatePhone(phone.trim())
      setProfile(updated)
      setPhone(updated.phone ?? '')
      setCodeSent(false)
      setCode('')
      setMessage('Celular actualizado')
    }, 'No se pudo guardar el celular')
  }

  function sendCode() {
    return run(async () => {
      await requestPhoneCode()
      setCodeSent(true)
      setMessage('Te enviamos un código por SMS')
    }, 'No se pudo enviar el código')
  }

  function confirmCode(event: FormEvent) {
    event.preventDefault()
    return run(async () => {
      setProfile(await confirmPhoneCode(code.trim()))
      setCodeSent(false)
      setCode('')
      setMessage('Celular verificado')
    }, 'No se pudo verificar el código')
  }

  return (
    <main>
      <h1>Perfil</h1>
      {!profile && !error && <p>Cargando...</p>}
      {profile && (
        <>
          {!profile.phoneVerified && <p className="notice">Verifica tu celular para poder enviar Kudos</p>}
          <p>Nombre: {profile.name}</p>
          <p>Correo: {profile.email}</p>
          <p>Rol: {roleLabel(profile.role)}</p>
          <p>
            Celular: {profile.phone ?? 'Sin registrar'}
            {profile.phone && (profile.phoneVerified ? ' (verificado)' : ' (sin verificar)')}
          </p>
          <form onSubmit={savePhone}>
            <label>
              Celular (formato internacional)
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+573001234567"
                required
              />
            </label>
            <button type="submit" disabled={busy}>
              Guardar celular
            </button>
          </form>
          {profile.phone && !profile.phoneVerified && (
            <>
              <button type="button" disabled={busy} onClick={sendCode}>
                {codeSent ? 'Reenviar código' : 'Enviar código de verificación'}
              </button>
              {codeSent && (
                <form onSubmit={confirmCode}>
                  <label>
                    Código de 6 dígitos
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      required
                    />
                  </label>
                  <button type="submit" disabled={busy}>
                    Verificar celular
                  </button>
                </form>
              )}
            </>
          )}
        </>
      )}
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </main>
  )
}
