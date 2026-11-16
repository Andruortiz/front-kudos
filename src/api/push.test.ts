import { expect, test } from 'vitest'
import { parseEvents } from './push'

test('reads complete events and keeps the unfinished one for later', () => {
  const { events, rest } = parseEvents('event:kudo\ndata:{"a":1}\n\n: keep-alive\n\nevent:kudo\ndata:{"b"')

  expect(events).toEqual([{ name: 'kudo', data: '{"a":1}' }])
  expect(rest).toBe('event:kudo\ndata:{"b"')
})

test('ignores comments that have no event name', () => {
  expect(parseEvents(': keep-alive\n\n').events).toEqual([])
})
