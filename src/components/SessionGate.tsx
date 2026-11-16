import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ApiError } from '../api/client'
import { getProfile } from '../api/profile'
import { submitRegistration } from '../api/registrations'
import LogoutButton from './LogoutButton'

const BLOCKING_CODES = ['auth.email.not.allowed', 'user.not.active']
const NOT_REGISTERED = 'auth.user.not.registered'

interface Props {
  children: ReactNode
  canLogout: boolean
}

export default function SessionGate({ children, canLogout }: Props) {
  const [blocked, setBlocked] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) {
      return
    }
    started.current = true
    getProfile()
      .catch(async (e) => {
        if (e instanceof ApiError && e.code === NOT_REGISTERED) {
          await submitRegistration()
        } else if (e instanceof ApiError && BLOCKING_CODES.includes(e.code)) {
          throw e
        }
      })
      .then(() => setReady(true))
      .catch((e) => setBlocked(e instanceof ApiError ? e.message : 'No se pudo crear tu cuenta'))
  }, [])

  if (blocked) {
    return (
      <main>
        <h1>No puedes usar UCO Kudos</h1>
        <p role="alert">{blocked}</p>
        {canLogout && <LogoutButton />}
      </main>
    )
  }
  if (!ready) {
    return (
      <main>
        <p>Preparando tu cuenta...</p>
      </main>
    )
  }
  return <>{children}</>
}
