import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { listCategories } from '../api/categories'
import { publishKudo } from '../api/kudos'
import type { Category, PublishKudoResponse, Recipient } from '../api/types'
import RecipientPicker from '../components/RecipientPicker'
import { validateAttachments } from '../kudos/attachmentRules'

export default function PublishKudoPage() {
  const [recipient, setRecipient] = useState<Recipient | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [published, setPublished] = useState<PublishKudoResponse | null>(null)
  const idempotencyKey = useRef(crypto.randomUUID())

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'No se pudieron cargar las categorías'))
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!recipient) {
      setError('Elige un destinatario')
      return
    }
    const attachmentError = validateAttachments(files)
    if (attachmentError) {
      setError(attachmentError)
      return
    }
    setError(null)
    setSending(true)
    try {
      const response = await publishKudo(
        { recipientId: recipient.id, categoryId, content },
        files,
        idempotencyKey.current,
      )
      setPublished(response)
      idempotencyKey.current = crypto.randomUUID()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ocurrió un error inesperado')
    } finally {
      setSending(false)
    }
  }

  if (published) {
    return (
      <main>
        <h1>Kudo publicado</h1>
        <ul aria-label="Estado de los envíos">
          {published.notifications.map((notification) => (
            <li key={notification.channel}>
              {notification.channel}: {notification.status}
            </li>
          ))}
        </ul>
        <Link to="/">Volver al inicio</Link>
      </main>
    )
  }

  return (
    <main>
      <h1>Enviar Kudo</h1>
      <form onSubmit={submit}>
        <RecipientPicker selected={recipient} onSelect={setRecipient} />
        <label>
          Categoría
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            <option value="">Elige una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mensaje
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} required />
        </label>
        <label>
          Adjuntos (imágenes o PDF, hasta 5 y 10 MB en total)
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={sending}>
          {sending ? 'Enviando...' : 'Enviar Kudo'}
        </button>
      </form>
    </main>
  )
}
