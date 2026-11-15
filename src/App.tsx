import {NavLink, Route, Routes} from 'react-router-dom'
import HomePage from './pages/HomePage'
import KudosListPage from './pages/KudosListPage'
import PublishKudoPage from './pages/PublishKudoPage'

export default function App() {
  return (


      <div className="app-layout">
          <div className="page-content">
              <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/kudos/new" element={<PublishKudoPage />} />
                  <Route path="/kudos/sent" element={<KudosListPage key="SENT" type="SENT" />} />
                  <Route path="/kudos/received" element={<KudosListPage key="RECEIVED" type="RECEIVED" />} />
                  <Route path="*" element={<main><h1>Página no encontrada</h1></main>} />
              </Routes>
          </div>


          <nav className="bottom-bar">
              <NavLink to="/" end className="nav-btn">
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
              <NavLink to={`/kudos/perfil`} className="nav-btn">
                  Perfil
              </NavLink>
          </nav>
      </div>

  )
}
