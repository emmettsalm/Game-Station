import { useState, type FormEvent } from 'react'

interface SearchBarProps {
  defaultValue?: string
  placeholder?: string
  onSearch: (keyword: string) => void
}

export default function SearchBar({ defaultValue = '', placeholder = 'ค้นหาเกม...', onSearch }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(value.trim())
  }

  return (
    <form onSubmit={submit} className="join w-full">
      <label className="input input-bordered join-item flex items-center gap-2 w-full transition-colors
                        focus-within:outline-none focus-within:border-primary">
        <input
          type="search"
          className="grow"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <button type="submit" className="btn btn-primary join-item">ค้นหา</button>
    </form>
  )
}
