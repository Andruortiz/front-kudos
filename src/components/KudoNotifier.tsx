import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listenToKudos } from '../api/push'
import type { KudoPush } from '../api/push'

export default function KudoNotifier() {
  const [kudo, setKudo] = useState<KudoPush | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void listenToKudos(setKudo, controller.signal)
    return () => controller.abort()
  }, [])

  if (!kudo) {
    return null
  }
  return (
    <div role="status" className="kudo-toast">
      <Link to={`/kudos/${kudo.kudoId}`} onClick={() => setKudo(null)}>
        {kudo.authorName} te envió un kudo de {kudo.categoryName}
      </Link>
      <button type="button" aria-label="Cerrar aviso" onClick={() => setKudo(null)}>
        ×
      </button>
    </div>
  )
}
