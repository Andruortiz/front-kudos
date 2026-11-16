import { NavLink, Outlet } from 'react-router-dom'
import { AUTH_ENABLED } from '../auth/msal'
import AuthRequired from './AuthRequired'
import KudoNotifier from './KudoNotifier'
import LogoutButton from './LogoutButton'
import SessionGate from './SessionGate'

function Shell() {
  return (
    <div className="app-layout">
      <header className="topbar">
        <span className="topbar__brand">UCO Kudos</span>
        <nav aria-label="Principal">
          <NavLink to="/inicio" className="nav-btn">
            Inicio
          </NavLink>
          <NavLink to="/kudos/received" className="nav-btn">
            Recibidos
          </NavLink>
          <NavLink to="/kudos/sent" className="nav-btn">
            Enviados
          </NavLink>
          <NavLink to="/kudos/new" className="nav-btn">
            Enviar
          </NavLink>
          <NavLink to="/perfil" className="nav-btn">
            Perfil
          </NavLink>
          {AUTH_ENABLED && <LogoutButton />}
        </nav>
      </header>
      <div className="page-content">
        <KudoNotifier />
        <Outlet />
      </div>
    </div>
  )
}

export default function ProtectedLayout() {
  return (
    <AuthRequired>
      <SessionGate canLogout={AUTH_ENABLED}>
        <Shell />
      </SessionGate>
    </AuthRequired>
  )
}
