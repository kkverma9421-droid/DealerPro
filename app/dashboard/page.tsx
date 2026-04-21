'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter }     from 'next/navigation'
import Link              from 'next/link'
import { supabase }      from '@/lib/supabase/client'
import PropertyCard      from '@/components/PropertyCard'
import AppNavbar         from '@/components/AppNavbar'
import { mockProperties } from '@/data/mockProperties'
import type { Property, PropertyStatus } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtPrice(price: number): string {
  if (price >= 10_000_000) return `₹${(price / 10_000_000).toFixed(1)} Cr`
  if (price >= 100_000)    return `₹${(price / 100_000).toFixed(1)} L`
  return `₹${price.toLocaleString('en-IN')}`
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, icon, valueClass = 'text-slate-800',
}: {
  label: string; value: number; icon: string; valueClass?: string
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>
        <span className={`text-2xl font-extrabold tabular-nums ${valueClass}`}>{value}</span>
      </div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
    </div>
  )
}

// ─── Filter constants ─────────────────────────────────────────────────────────
const STATUS_TABS = [
  { value: 'all',         label: 'All',         icon: '🏠' },
  { value: 'available',   label: 'Available',   icon: '✅' },
  { value: 'hold',        label: 'On Hold',     icon: '⏳' },
  { value: 'requirement', label: 'Requirement', icon: '🔍' },
] as const

const TYPE_OPTIONS = [
  { value: 'all',           label: 'All Types' },
  { value: 'plot',          label: 'Plot' },
  { value: 'apartment',     label: 'Apartment' },
  { value: 'villa',         label: 'Villa' },
  { value: 'shop',          label: 'Shop' },
  { value: 'office',        label: 'Office' },
  { value: 'builder_floor', label: 'Builder Floor' },
  { value: 'warehouse',     label: 'Warehouse' },
  { value: 'other',         label: 'Other' },
]

// ─── Loading skeletons ────────────────────────────────────────────────────────
function CardSkeleton() {
  return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ search, onClear }: { search: string; onClear: () => void }) {
  return (
    <div className="col-span-full bg-white border border-slate-100 rounded-2xl shadow-sm p-12 text-center">
      <p className="text-5xl mb-4">{search ? '🔍' : '🏚️'}</p>
      <h3 className="text-lg font-extrabold text-slate-800">
        {search ? 'No matching properties' : 'No properties yet'}
      </h3>
      <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()

  const [properties,   setProperties]   = useState<Property[]>([])
  const [loading,      setLoading]      = useState(true)
  const [isMock,       setIsMock]       = useState(false)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all')
  const [typeFilter,   setTypeFilter]   = useState('all')
  const [sortBy,       setSortBy]       = useState<'newest' | 'price_asc' | 'price_desc'>('newest')

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('properties')
        .select('*, property_images(*)')
        .order('created_at', { ascending: false })
        .limit(100)

      if (!error && data && data.length > 0) {
        setProperties(data as Property[])
        setIsMock(false)
      } else {
        setProperties(mockProperties as Property[])
        setIsMock(true)
      }
      setLoading(false)
    }
    load()
  }, [])

  // ── Status update ──────────────────────────────────────────────────────────
  function handleStatusChange(id: string, status: PropertyStatus) {
    if (isMock) return
    supabase
      .from('properties')
      .update({ status })
      .eq('id', id)
      .then(() => setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p)))
  }

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => ({
    total:       properties.length,
    available:   properties.filter(p => p.status === 'available').length,
    hold:        properties.filter(p => p.status === 'hold').length,
    requirement: properties.filter(p => p.status === 'requirement').length,
  }), [properties])

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = properties.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (typeFilter   !== 'all' && p.property_type !== typeFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          p.title.toLowerCase().includes(q)      ||
          p.locality.toLowerCase().includes(q)   ||
          p.city.toLowerCase().includes(q)       ||
          p.owner_name.toLowerCase().includes(q)
        )
      }
      return true
    })

    if (sortBy === 'price_asc')  list = [...list].sort((a, b) => a.price - b.price)
    if (sortBy === 'price_desc') list = [...list].sort((a, b) => b.price - a.price)
    // 'newest' is default from fetch order

    return list
  }, [properties, statusFilter, typeFilter, search, sortBy])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar
        right={
          <Link
            href="/add-property"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition"
          >
            <span className="text-base leading-none">+</span> Add Property
          </Link>
        }
      />

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Property Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Mathura · Vrindavan · Govardhan · Brij region
            </p>
          </div>
          {isMock && !loading && (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full shrink-0">
              📋 Sample data
            </span>
          )}
        </div>

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
            ))
          ) : (
            <>
              <KpiCard label="Total Listings"  value={kpis.total}       icon="🏠" />
              <KpiCard label="Available"        value={kpis.available}   icon="✅" valueClass="text-emerald-600" />
              <KpiCard label="On Hold"          value={kpis.hold}        icon="⏳" valueClass="text-amber-600" />
              <KpiCard label="Buy Requirement"  value={kpis.requirement} icon="🔍" valueClass="text-blue-600" />
            </>
          )}
        </div>

        {/* ── Search + filter bar ── */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 mb-6 space-y-3">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              🔍
            </span>
            <input
              type="search"
              placeholder="Search title, locality, owner…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status tabs */}
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value as PropertyStatus | 'all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  statusFilter === tab.value
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}

            {/* Separator */}
            <span className="hidden sm:block w-px h-5 bg-slate-200" />

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            >
              {TYPE_OPTIONS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* ── Results count ── */}
        {!loading && (
          <p className="text-xs text-slate-400 mb-4 px-1">
            {filtered.length} {filtered.length === 1 ? 'property' : 'properties'}
            {search && <> for <span className="font-semibold text-slate-600">&ldquo;{search}&rdquo;</span></>}
            {statusFilter !== 'all' && <> · {STATUS_TABS.find(t => t.value === statusFilter)?.label}</>}
          </p>
        )}

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : filtered.length === 0
              ? <EmptyState search={search} onClear={() => setSearch('')} />
              : filtered.map(p => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    onStatusChange={isMock ? undefined : handleStatusChange}
                    onClick={() => router.push(`/property/${p.id}`)}
                  />
                ))
          }
        </div>

        {/* ── Price summary footer (only when live data) ── */}
        {!loading && !isMock && filtered.length > 1 && (
          <div className="mt-6 bg-white border border-slate-100 rounded-2xl shadow-sm px-5 py-4 flex flex-wrap gap-6">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Lowest</p>
              <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                {fmtPrice(Math.min(...filtered.map(p => p.price)))}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Highest</p>
              <p className="text-base font-extrabold text-slate-800 mt-0.5">
                {fmtPrice(Math.max(...filtered.map(p => p.price)))}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Avg Price</p>
              <p className="text-base font-extrabold text-slate-800 mt-0.5">
                {fmtPrice(Math.round(filtered.reduce((s, p) => s + p.price, 0) / filtered.length))}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
