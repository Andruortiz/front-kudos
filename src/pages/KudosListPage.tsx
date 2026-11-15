import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { listCategories } from '../api/categories'
import { listKudos } from '../api/kudos'
import type { KudoType } from '../api/kudos'
import type { Category, Kudo } from '../api/types'

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
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([listKudos(type), listCategories()])
      .then(([items, cats]) => {
        if (!cancelled) {
          setKudos(items)
          setCategories(cats)
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

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Sin categoría'

  return (
    <main>
      <h1>{TITLES[type]}</h1>
      {error && <p role="alert">{error}</p>}
      {!error && kudos === null && <p>Cargando...</p>}
      {kudos?.length === 0 && <p>Aún no hay Kudos.</p>}
      <ul aria-label={TITLES[type]}>
        {kudos?.map((kudo) => (
          <li key={kudo.id}>
            <strong>{categoryName(kudo.categoryId)}</strong>
            <p>{kudo.content}</p>
            <small>{new Date(kudo.createdAt).toLocaleString('es-CO')}</small>
          </li>
        ))}
      </ul>
    </main>
  )
}
