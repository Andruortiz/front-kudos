import { Route, Routes } from 'react-router-dom'
import ProtectedLayout from './components/ProtectedLayout'
import AccessRequestPage from './pages/AccessRequestPage'
import HomePage from './pages/HomePage'
import KudoDetailPage from './pages/KudoDetailPage'
import KudosListPage from './pages/KudosListPage'
import LandingPage from './pages/LandingPage'
import ProfilePage from './pages/ProfilePage'
import PublishKudoPage from './pages/PublishKudoPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/acceso" element={<AccessRequestPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/kudos/new" element={<PublishKudoPage />} />
        <Route path="/kudos/sent" element={<KudosListPage key="SENT" type="SENT" />} />
        <Route path="/kudos/received" element={<KudosListPage key="RECEIVED" type="RECEIVED" />} />
        <Route path="/kudos/:id" element={<KudoDetailPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
      </Route>
      <Route
        path="*"
        element={
          <main>
            <h1>Página no encontrada</h1>
          </main>
        }
      />
    </Routes>
  )
}
