'use client'

import type { PropertyStatus } from '@/types'

const STATUS_TABS = [
  { value: 'all',         label: 'All'       },
  { value: 'available',   label: 'Available' },
  { value: 'hold',        label: 'On Hold'   },
  { value: 'requirement', label: 'Req'       },
  { value: 'sold',        label: 'Sold'      },
] as const

const TYPE_OPTIONS = [
  { value: 'all',           label: 'All Types'     },
  { value: 'plot',          label: 'Plot'          },
  { value: 'apartment',     label: 'Apartment'     },
  { value: 'villa',         label: 'Villa'         },
  { value: 'shop',          label: 'Shop'          },
  { value: 'office',        label: 'Office'        },
  { value: 'builder_floor', label: 'Builder Floor' },
  { value: 'warehouse',     label: 'Warehouse'     },
  { value: 'other',         label: 'Other'         },
]

export type SortOption = 'newest' | 'price_asc' | 'price_desc'

export type StatusFilterValue = PropertyStatus | 'all'

interface FilterBarProps {
  search:       string
  statusFilter: StatusFilterValue
  typeFilter:   string
  sortBy:       SortOption
  count:        number
  onSearch:     (v: string) => void
  onStatus:     (v: StatusFilterValue) => void
  onType:       (v: string) => void
  onSort:       (v: SortOption) => void
}

export default function FilterBar({
  search, statusFilter, typeFilter, sortBy, count,
  onSearch, onStatus, onType, onSort,
}: FilterBarProps) {
  return (
    <div
      className="sticky top-0 z-40 bg-[#F0F2F7] border-b border-[#E8ECF4]"
      style={{
        padding: '12px 16px 10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Search */}
      <div className="relative mb-2.5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none select-none">
          🔍
        </span>
        <input
          type="search"
          placeholder="Search title, locality, owner…"
          value={search}
          onChange={e => onSearch(e.target.value)}
          style={{ borderRadius: 12, border: '1.5px solid #E8ECF4' }}
          className="w-full pl-9 pr-4 py-2.5 text-[13px] font-medium bg-white text-[#0B1120] placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition"
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Status pills */}
        {STATUS_TABS.map(t => (
          <button
            key={t.value}
            onClick={() => onStatus(t.value as StatusFilterValue)}
            style={{
              borderRadius: 20,
              padding: '6px 12px',
              background: statusFilter === t.value ? '#0B1120' : '#fff',
              color:      statusFilter === t.value ? '#fff'    : '#64748B',
              fontWeight: statusFilter === t.value ? 700       : 600,
              fontSize: 12,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'background 0.15s, color 0.15s',
              boxShadow: statusFilter === t.value ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}

        <span className="hidden sm:block w-px h-4 bg-[#E8ECF4] shrink-0" />

        {/* Type select */}
        <select
          value={typeFilter}
          onChange={e => onType(e.target.value)}
          style={{ borderRadius: 20, border: '1.5px solid #E8ECF4', padding: '6px 10px' }}
          className="text-[11px] font-semibold bg-white text-[#64748B] focus:outline-none focus:border-emerald-400 cursor-pointer shrink-0 appearance-none"
        >
          {TYPE_OPTIONS.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Sort select */}
        <select
          value={sortBy}
          onChange={e => onSort(e.target.value as SortOption)}
          style={{ borderRadius: 20, border: '1.5px solid #E8ECF4', padding: '6px 10px' }}
          className="text-[11px] font-semibold bg-white text-[#64748B] focus:outline-none focus:border-emerald-400 cursor-pointer shrink-0 appearance-none"
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
        </select>

        {/* Count chip */}
        <span className="ml-auto shrink-0 text-[11px] font-semibold text-[#94A3B8] whitespace-nowrap">
          {count} {count === 1 ? 'property' : 'properties'}
          {search && (
            <> for <span className="text-[#64748B] font-bold">"{search}"</span></>
          )}
        </span>
      </div>
    </div>
  )
}
