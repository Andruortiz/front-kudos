import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PublishKudoPage from './pages/PublishKudoPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/kudos/new" element={<PublishKudoPage />} />
      <Route path="*" element={<main><h1>Página no encontrada</h1></main>} />
    </Routes>
  )
}
