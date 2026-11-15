import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { listKudos } from '../api/kudos'
import type { KudoType } from '../api/kudos'
import type { Kudo } from '../api/types'
import Avatar from '../components/Avatar'

interface Props {
  type: KudoType
}

const TITLES: Record<KudoType, string> = {
  SENT: 'Kudos enviados',
  RECEIVED: 'Kudos recibidos',
  ALL: 'Mis Kudos',
}

export default function KudosListPage({ type }: Props) {
  const [kudos, setKudos] = useState<Kudo[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listKudos(type)
      .then((items) => {
        if (!cancelled) {
          setKudos(items)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los Kudos')
        }
      })
    return () => {
      cancelled = true
    }
  }, [type])

  return (
    <main>
      <h1>{TITLES[type]}</h1>
      <nav className="tabs" aria-label="Tipo de Kudos">
        <Link to="/kudos/received" className={type === 'RECEIVED' ? 'active' : undefined}>
          Recibidos
        </Link>
        <Link to="/kudos/sent" className={type === 'SENT' ? 'active' : undefined}>
          Enviados
        </Link>
      </nav>
      {error && <p role="alert">{error}</p>}
      {!error && kudos === null && <p className="muted">Cargando...</p>}
      {kudos?.length === 0 && (
        <p className="empty">
          Aún no hay Kudos.
          {type === 'SENT' && (
            <>
              {' '}
              <Link to="/kudos/new">Envía el primero</Link>
            </>
          )}
        </p>
      )}
      <ul className="kudo-list" aria-label={TITLES[type]}>
        {kudos?.map((kudo) => {
          const other = type === 'RECEIVED' ? kudo.authorName : kudo.recipientName
          return (
            <li key={kudo.id} className="kudo-card">
              <Link className="kudo-card__link" to={`/kudos/${kudo.id}`}>
                <div className="kudo-card__top">
                  <span className="chip">{kudo.categoryName ?? 'Sin categoría'}</span>
                  <small className="muted">{new Date(kudo.createdAt).toLocaleDateString('es-CO', { dateStyle: 'medium' })}</small>
                </div>
                <div className="person">
                  <Avatar name={other} />
                  <span>{`${type === 'RECEIVED' ? 'De' : 'Para'} ${other ?? 'Usuario desconocido'}`}</span>
                </div>
                <p className="kudo-card__content">{kudo.content}</p>
              </Link>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
