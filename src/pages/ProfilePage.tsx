import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError } from '../api/client'
import { getProfile, updatePhone } from '../api/profile'
import type { Profile } from '../api/types'
import { roleLabel } from '../kudos/roles'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

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

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSaved(false)
    setSaving(true)
    try {
      const updated = await updatePhone(phone.trim())
      setProfile(updated)
      setPhone(updated.phone ?? '')
      setSaved(true)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar el celular')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main>
      <h1>Perfil</h1>
      {!profile && !error && <p>Cargando...</p>}
      {profile && (
        <>
          <p>Nombre: {profile.name}</p>
          <p>Correo: {profile.email}</p>
          <p>Rol: {roleLabel(profile.role)}</p>
          <p>
            Celular: {profile.phone ?? 'Sin registrar'}
            {profile.phone && (profile.phoneVerified ? ' (verificado)' : ' (sin verificar)')}
          </p>
          <form onSubmit={submit}>
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
            <button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar celular'}
            </button>
          </form>
        </>
      )}
      {error && <p role="alert">{error}</p>}
      {saved && <p role="status">Celular actualizado</p>}
    </main>
  )
}
