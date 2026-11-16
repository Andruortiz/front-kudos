import { API_URL, authHeaders } from './client'

export interface KudoPush {
  kudoId: string
  authorName: string
  categoryName: string
  link: string
}

const RETRY_MS = 5000

export function parseEvents(buffer: string): { events: { name: string; data: string }[]; rest: string } {
  const parts = buffer.replace(/\r\n/g, '\n').split('\n\n')
  const rest = parts.pop() ?? ''
  const events = parts.flatMap((block) => {
    const lines = block.split('\n')
    const name = lines.find((l) => l.startsWith('event:'))?.slice(6).trim()
    const data = lines
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).trim())
      .join('\n')
    return name ? [{ name, data }] : []
  })
  return { events, rest }
}

async function readStream(onKudo: (kudo: KudoPush) => void, signal: AbortSignal): Promise<void> {
  const headers = await authHeaders({ Accept: 'text/event-stream' })
  const response = await fetch(`${API_URL}/api/v1/notifications/stream`, { headers, signal })
  if (!response.ok || !response.body) {
    return
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      return
    }
    const parsed = parseEvents(buffer + decoder.decode(value, { stream: true }))
    buffer = parsed.rest
    parsed.events
      .filter((event) => event.name === 'kudo')
      .forEach((event) => onKudo(JSON.parse(event.data) as KudoPush))
  }
}

export async function listenToKudos(onKudo: (kudo: KudoPush) => void, signal: AbortSignal): Promise<void> {
  while (!signal.aborted) {
    try {
      await readStream(onKudo, signal)
    } catch {
      if (signal.aborted) {
        return
      }
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_MS))
  }
}
