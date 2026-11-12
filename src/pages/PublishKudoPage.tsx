import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { publishKudo } from '../api/kudos'
import type { PublishKudoResponse } from '../api/types'
import { validateAttachments } from '../kudos/attachmentRules'

export default function PublishKudoPage() {
  const [recipientId, setRecipientId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [published, setPublished] = useState<PublishKudoResponse | null>(null)
  const idempotencyKey = useRef(crypto.randomUUID())

  async function submit(event: FormEvent) {
    event.preventDefault()
    const attachmentError = validateAttachments(files)
    if (attachmentError) {
      setError(attachmentError)
      return
    }
    setError(null)
    setSending(true)
    try {
      const response = await publishKudo({ recipientId, categoryId, content }, files, idempotencyKey.current)
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
        <label>
          Destinatario
          <input value={recipientId} onChange={(e) => setRecipientId(e.target.value)} required />
        </label>
        <label>
          Categoría
          <input value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required />
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
