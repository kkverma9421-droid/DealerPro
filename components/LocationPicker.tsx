'use client'

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from 'react'
import { searchCities, searchLocalities, BRIJ_CITIES } from '@/data/brijLocations'

// ─── Generic searchable dropdown ──────────────────────────────────────────────
interface DropdownProps {
  label:       string
  placeholder: string
  value:       string
  options:     string[]
  onChange:    (value: string) => void
  disabled?:   boolean
  required?:   boolean
  hint?:       string
  icon?:       string
}

function SearchableDropdown({
  label, placeholder, value, options,
  onChange, disabled, required, hint, icon = '📍',
}: DropdownProps) {
  const [open,  setOpen]  = useState(false)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(-1)

  const wrapRef   = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const listRef   = useRef<HTMLUListElement>(null)

  // Filter options by query
  const filtered = query.trim()
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
        setCursor(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Scroll active item into view
  useEffect(() => {
    if (cursor >= 0 && listRef.current) {
      const el = listRef.current.children[cursor] as HTMLElement
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [cursor])

  function handleOpen() {
    if (disabled) return
    setOpen(true)
    setQuery('')
    setCursor(-1)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleSelect(option: string) {
    onChange(option)
    setOpen(false)
    setQuery('')
    setCursor(-1)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor(c => Math.min(c + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor(c => Math.max(c - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (cursor >= 0 && filtered[cursor]) handleSelect(filtered[cursor])
      else if (filtered.length === 1)      handleSelect(filtered[0])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
      setCursor(-1)
    }
  }

  return (
    <div ref={wrapRef} className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`
          w-full flex items-center gap-2.5 px-3.5 py-2.5
          border rounded-xl text-sm text-left transition-all
          ${open
            ? 'border-emerald-400 ring-2 ring-emerald-100'
            : 'border-slate-200 hover:border-slate-300'}
          ${disabled
            ? 'bg-slate-50 text-slate-400 cursor-not-allowed'
            : 'bg-white text-slate-800 cursor-pointer'}
        `}
      >
        <span className="text-base flex-shrink-0">{icon}</span>
        <span className={`flex-1 truncate ${!value ? 'text-slate-300' : ''}`}>
          {value || placeholder}
        </span>
        <span className={`text-slate-400 text-xs transition-transform ${open ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
          style={{ maxWidth: '100%' }}>

          {/* Search input */}
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
              <span className="text-slate-400 text-sm">🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setCursor(-1) }}
                onKeyDown={handleKeyDown}
                placeholder={`Search ${label.toLowerCase()}…`}
                className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300"
              />
              {query && (
                <button onClick={() => { setQuery(''); setCursor(-1) }}
                  className="text-slate-300 hover:text-slate-500 text-base">
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <ul
            ref={listRef}
            className="max-h-52 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-400 text-center">
                No results for "{query}"
              </li>
            ) : (
              filtered.map((option, i) => {
                const isActive   = option === value
                const isCursor   = i === cursor
                const highlighted = query
                  ? option.replace(
                      new RegExp(`(${query})`, 'gi'),
                      '<mark class="bg-emerald-100 text-emerald-700 rounded px-0.5">$1</mark>'
                    )
                  : option
                return (
                  <li
                    key={option}
                    onMouseDown={() => handleSelect(option)}
                    onMouseEnter={() => setCursor(i)}
                    className={`
                      flex items-center gap-2.5 px-4 py-2.5 text-sm cursor-pointer transition-colors
                      ${isCursor  ? 'bg-emerald-50'         : ''}
                      ${isActive  ? 'text-emerald-700 font-semibold' : 'text-slate-700'}
                      ${!isCursor && !isActive ? 'hover:bg-slate-50' : ''}
                    `}
                  >
                    {isActive && <span className="text-emerald-500 text-xs flex-shrink-0">✓</span>}
                    <span dangerouslySetInnerHTML={{ __html: highlighted }} />
                  </li>
                )
              })
            )}
          </ul>

          {/* Count badge */}
          {filtered.length > 0 && (
            <div className="px-4 py-1.5 border-t border-slate-100 text-[10px] text-slate-400">
              {filtered.length} option{filtered.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  )
}

// ─── Public API ────────────────────────────────────────────────────────────────
export interface LocationValue {
  city:     string
  locality: string
}

interface LocationPickerProps {
  value:    LocationValue
  onChange: (val: LocationValue) => void
  required?: boolean
}

export function LocationPicker({ value, onChange, required }: LocationPickerProps) {
  const cityOptions     = BRIJ_CITIES.map(c => c.name)
  const localityOptions = value.city ? searchLocalities(value.city, '') : []

  function handleCityChange(city: string) {
    // Reset locality when city changes
    onChange({ city, locality: '' })
  }

  function handleLocalityChange(locality: string) {
    onChange({ ...value, locality })
  }

  return (
    <div className="grid grid-cols-2 gap-4 relative">
      {/* City */}
      <div className="relative">
        <SearchableDropdown
          label="City / Town"
          placeholder="Select city…"
          icon="🏙"
          value={value.city}
          options={cityOptions}
          onChange={handleCityChange}
          required={required}
        />
      </div>

      {/* Locality — updates when city changes */}
      <div className="relative">
        <SearchableDropdown
          label="Locality / Area"
          placeholder={value.city ? 'Select locality…' : 'Select city first'}
          icon="📍"
          value={value.locality}
          options={localityOptions}
          onChange={handleLocalityChange}
          disabled={!value.city}
          hint={value.city ? `${localityOptions.length} areas in ${value.city}` : undefined}
        />
      </div>
    </div>
  )
}

// ─── Single city-only picker (for dashboard filter) ───────────────────────────
interface CityFilterProps {
  value:    string
  onChange: (city: string) => void
}

export function CityFilter({ value, onChange }: CityFilterProps) {
  const cityOptions = ['', ...BRIJ_CITIES.map(c => c.name)]

  return (
    <div className="relative w-44">
      <SearchableDropdown
        label=""
        placeholder="All Cities"
        icon="🏙"
        value={value}
        options={BRIJ_CITIES.map(c => c.name)}
        onChange={v => onChange(v)}
      />
    </div>
  )
}