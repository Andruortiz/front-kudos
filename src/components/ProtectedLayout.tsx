import { InteractionType } from '@azure/msal-browser'
import { MsalAuthenticationTemplate } from '@azure/msal-react'
import { NavLink, Outlet } from 'react-router-dom'
import { AUTH_ENABLED, LOGIN_SCOPES } from '../auth/msal'
import KudoNotifier from './KudoNotifier'
import LogoutButton from './LogoutButton'
import SessionGate from './SessionGate'

function Shell() {
  return (
    <div className="app-layout">
      <div className="page-content">
        <KudoNotifier />
        <Outlet />
      </div>
      <nav className="bottom-bar" aria-label="Principal">
        <div className="sidebar-logo">UCO Kudos</div>
        <NavLink to="/inicio" className="nav-btn">
          Inicio
        </NavLink>
        <NavLink to="/kudos/new" className="nav-btn">
          + Nuevo Kudo
        </NavLink>
        <NavLink to="/kudos/received" className="nav-btn">
          Recibidos
        </NavLink>
        <NavLink to="/kudos/sent" className="nav-btn">
          Enviados
        </NavLink>
        <NavLink to="/perfil" className="nav-btn">
          Perfil
        </NavLink>
        {AUTH_ENABLED && <LogoutButton />}
      </nav>
    </div>
  )
}

/** Everything behind the login: asks Microsoft for a session, then checks the person has an account. */
export default function ProtectedLayout() {
  const content = (
    <SessionGate canLogout={AUTH_ENABLED}>
      <Shell />
    </SessionGate>
  )
  if (!AUTH_ENABLED) {
    return content
  }
  return (
    <MsalAuthenticationTemplate
      interactionType={InteractionType.Redirect}
      authenticationRequest={{ scopes: LOGIN_SCOPES }}
      loadingComponent={() => (
        <main>
          <p>Iniciando sesión...</p>
        </main>
      )}
      errorComponent={({ error }) => (
        <main>
          <p role="alert">No se pudo iniciar sesión: {error?.errorMessage}</p>
        </main>
      )}
    >
      {content}
    </MsalAuthenticationTemplate>
  )
}
