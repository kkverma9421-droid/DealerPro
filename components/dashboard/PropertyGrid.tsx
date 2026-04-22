import Link from 'next/link'
import DashboardPropertyCard from './PropertyCard'
import type { Property, PropertyStatus } from '@/types'

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ search, onClear }: { search: string; onClear: () => void }) {
  return (
    <div className="col-span-full bg-white border border-[#E8ECF4] rounded-2xl shadow-sm p-12 text-center">
      <p className="text-5xl mb-4">{search ? '🔍' : '🏚️'}</p>
      <h3 className="text-base font-extrabold text-[#0B1120]">
        {search ? 'No matching properties' : 'No properties yet'}
      </h3>
      <p className="text-sm text-[#64748B] mt-2 max-w-xs mx-auto">
        {search
          ? `Nothing found for "${search}". Try a different search.`
          : 'Start building your inventory by adding the first listing.'}
      </p>
      {search ? (
        <button
          onClick={onClear}
          className="mt-5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition"
        >
          Clear search
        </button>
      ) : (
        <Link
          href="/add-property"
          className="inline-block mt-5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition"
        >
          + Add First Property
        </Link>
      )}
    </div>
  )
}

// ─── Grid ─────────────────────────────────────────────────────────────────────
interface PropertyGridProps {
  properties:      Property[]
  loading:         boolean
  isMock:          boolean
  search:          string
  onClearSearch:   () => void
  onStatusChange?: (id: string, status: PropertyStatus) => void
  onPropertyClick: (id: string) => void
}

export default function PropertyGrid({
  properties,
  loading,
  isMock,
  search,
  onClearSearch,
  onStatusChange,
  onPropertyClick,
}: PropertyGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {loading
        ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
        : properties.length === 0
          ? <EmptyState search={search} onClear={onClearSearch} />
          : properties.map(p => (
              <DashboardPropertyCard
                key={p.id}
                property={p}
                onClick={() => onPropertyClick(p.id)}
                onStatusChange={isMock ? undefined : onStatusChange}
              />
            ))
      }
    </div>
  )
}
