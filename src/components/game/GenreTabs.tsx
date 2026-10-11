import type { Genre } from '../../types/game'

interface GenreTabsProps {
  genres: Genre[]
  active?: string
  onSelect: (slug?: string) => void
}

export default function GenreTabs({ genres, active, onSelect }: GenreTabsProps) {
  const cls = (on: boolean) =>
    `btn btn-sm rounded-full whitespace-nowrap ${on ? 'btn-primary' : 'btn-ghost bg-base-200'}`

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button type="button" className={cls(!active)} onClick={() => onSelect(undefined)}>All</button>
      {genres.map((g) => (
        <button key={g.id} type="button" className={cls(active === g.slug)} onClick={() => onSelect(g.slug)}>
          {g.name}
        </button>
      ))}
    </div>
  )
}
