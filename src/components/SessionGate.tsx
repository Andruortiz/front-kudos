import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ApiError } from '../api/client'
import { getProfile } from '../api/profile'
import LogoutButton from './LogoutButton'

/** Codes that mean the whole session cannot use the app, not just one request. */
const BLOCKING_CODES = ['auth.user.not.registered', 'auth.email.not.allowed', 'user.not.active']

interface Props {
  children: ReactNode
  canLogout: boolean
}

/** Checks once, on entry, that the signed-in person has an account; otherwise it shows why instead of broken pages. */
export default function SessionGate({ children, canLogout }: Props) {
  const [blocked, setBlocked] = useState<string | null>(null)

  useEffect(() => {
    getProfile().catch((e) => {
      if (e instanceof ApiError && BLOCKING_CODES.includes(e.code)) {
        setBlocked(e.message)
      }
    })
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
  return <>{children}</>
}
