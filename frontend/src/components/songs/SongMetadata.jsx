
export default function SongMetadata({ song }) {
  const metadata = [
    {
      label: 'Key',
      value: song.musical_key || '—',
    },
    {
      label: 'Capo',
      value: song.capo
        ? `Fret ${song.capo}`
        : 'None',
    },
    {
      label: 'Difficulty',
      value: song.difficulty_display,
    },
    {
      label: 'Tuning',
      value: song.tuning,
    },
  ]

  return (
    <dl
      className="
        grid grid-cols-2 gap-x-6 gap-y-5
        border-y border-line py-5
        sm:grid-cols-4
      "
    >
      {metadata.map(item => (
        <div key={item.label}>
          <dt className="text-xs text-muted">
            {item.label}
          </dt>

          <dd className="mt-1.5 text-sm font-medium">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
