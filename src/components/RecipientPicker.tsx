import { useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import { listRecipients } from '../api/recipients'
import type { Recipient } from '../api/types'
import { roleLabel } from '../kudos/roles'

export const MIN_SEARCH_LENGTH = 3

interface Props {
  selected: Recipient | null
  onSelect: (recipient: Recipient | null) => void
  debounceMs?: number
}

export default function RecipientPicker({ selected, onSelect, debounceMs = 300 }: Props) {
  const [text, setText] = useState('')
  const [options, setOptions] = useState<Recipient[]>([])
  const [error, setError] = useState<string | null>(null)
  const tooShort = text.trim().length > 0 && text.trim().length < MIN_SEARCH_LENGTH

  useEffect(() => {
    if (selected || tooShort) {
      return
    }
    const query = text.trim()
    let cancelled = false
    const timer = setTimeout(
      () => {
        listRecipients(query)
          .then((items) => {
            if (!cancelled) {
              setOptions(items)
              setError(null)
            }
          })
          .catch((e) => {
            if (!cancelled) {
              setOptions([])
              setError(e instanceof ApiError ? e.message : 'No se pudo cargar la lista')
            }
          })
      },
      query === '' ? 0 : debounceMs,
    )
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [text, tooShort, selected, debounceMs])

  if (selected) {
    return (
      <div>
        <p>
          Destinatario: {selected.name} ({roleLabel(selected.role)})
        </p>
        <button type="button" onClick={() => onSelect(null)}>
          Cambiar destinatario
        </button>
      </div>
    )
  }

  return (
    <div>
      <label>
        Destinatario
        <input
          type="search"
          value={text}
          placeholder="Escribe un nombre o correo"
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      {tooShort && <p>Escribe al menos {MIN_SEARCH_LENGTH} letras para buscar</p>}
      {error && <p role="alert">{error}</p>}
      {!tooShort && options.length === 0 && !error && <p>Sin resultados</p>}
      <ul aria-label="Destinatarios">
        {options.map((option) => (
          <li key={option.id}>
            <button type="button" onClick={() => onSelect(option)}>
              {option.name} · {roleLabel(option.role)} · {option.email}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
