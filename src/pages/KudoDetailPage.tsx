import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { downloadAttachment, getKudo } from '../api/kudos'
import type { AttachmentInfo, KudoDetail } from '../api/types'
import Avatar from '../components/Avatar'

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function KudoDetailPage() {
  const { id = '' } = useParams()
  const [kudo, setKudo] = useState<KudoDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getKudo(id)
      .then((loaded) => {
        if (!cancelled) {
          setKudo(loaded)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : 'No se pudo cargar el Kudo')
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  function download(attachment: AttachmentInfo) {
    setError(null)
    downloadAttachment(id, attachment).catch((e) =>
      setError(e instanceof ApiError ? e.message : 'No se pudo descargar el adjunto'),
    )
  }

  return (
    <main>
      <h1>Kudo</h1>
      {error && <p role="alert">{error}</p>}
      {!error && !kudo && <p className="muted">Cargando...</p>}
      {kudo && (
        <article className="kudo-detail">
          <div className="kudo-card__top">
            <span className="chip">{kudo.categoryName ?? 'Sin categoría'}</span>
            <small className="muted">{new Date(kudo.createdAt).toLocaleString('es-CO')}</small>
          </div>
          <div className="kudo-detail__people">
            <div className="person">
              <Avatar name={kudo.authorName} />
              <span>{`De: ${kudo.authorName ?? 'Usuario desconocido'}`}</span>
            </div>
            <div className="person">
              <Avatar name={kudo.recipientName} />
              <span>{`Para: ${kudo.recipientName ?? 'Usuario desconocido'}`}</span>
            </div>
          </div>
          <p className="kudo-detail__content">{kudo.content}</p>
          {kudo.attachments.length > 0 && (
            <ul className="attachments" aria-label="Adjuntos">
              {kudo.attachments.map((attachment) => (
                <li key={attachment.id}>
                  <button type="button" className="link" onClick={() => download(attachment)}>
                    {attachment.name} ({formatSize(attachment.size)})
                  </button>
                </li>
              ))}
            </ul>
          )}
        </article>
      )}
      <nav className="tabs" aria-label="Volver">
        <Link to="/kudos/received">Recibidos</Link>
        <Link to="/kudos/sent">Enviados</Link>
      </nav>
    </main>
  )
}
