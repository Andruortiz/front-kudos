/** A round badge with the initials of a name; decorative, so screen readers skip it. */
export default function Avatar({ name }: { name: string | null }) {
  const initials = (name ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
  return (
    <span className="avatar" aria-hidden="true">
      {initials || '?'}
    </span>
  )
}
