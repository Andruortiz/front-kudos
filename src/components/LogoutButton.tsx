import { useMsal } from '@azure/msal-react'

export default function LogoutButton() {
  const { instance } = useMsal()
  return (
    <button type="button" className="nav-btn" onClick={() => instance.logoutRedirect()}>
      Salir
    </button>
  )
}
