'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { supabase }      from '@/lib/supabase/client'
import { mockProperties } from '@/data/mockProperties'
import type { Property, PropertyStatus } from '@/types'

import Sidebar           from '@/components/layout/Sidebar'
import Header            from '@/components/layout/Header'
import FilterBar, { type SortOption, type StatusFilterValue } from '@/components/dashboard/FilterBar'
import PropertyGrid      from '@/components/dashboard/PropertyGrid'
import MobileBottomNav   from '@/components/MobileBottomNav'
import { fmtPrice }      from '@/lib/format'

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  icon,
  accent = '#0B1120',
  sub,
}: {
  label:   string
  value:   number | string
  icon:    string
  accent?: string
  sub?:    string
}) {
  return (
    <div
      className="bg-white rounded-2xl p-3 sm:p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] cursor-default"
      style={{ border: '1.5px solid #E8ECF4' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = accent + '55')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#E8ECF4')}
    >
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-[20px] sm:text-[22px] leading-none">{icon}</span>
        <span
          style={{ color: accent }}
          className="text-[24px] sm:text-[28px] font-extrabold tabular-nums leading-none"
        >
          {value}
        </span>
      </div>
      <p className="text-[10px] sm:text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.6px] leading-tight">{label}</p>
      {sub && <p className="text-[10px] sm:text-[11px] text-[#64748B] mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Skeleton for KPI row ─────────────────────────────────────────────────────
function KpiSkeleton() {
  return <div className="h-[72px] sm:h-[84px] bg-slate-100 rounded-2xl animate-pulse" />
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()

  const [properties,   setProperties]   = useState<Property[]>([])
  const [loading,      setLoading]      = useState(true)
  const [isMock,       setIsMock]       = useState(false)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all')
  const [typeFilter,   setTypeFilter]   = useState('all')
  const [sortBy,       setSortBy]       = useState<SortOption>('newest')

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
    supabase
      .from('properties')
      .update({ status })
      .eq('id', id)
      .then(() =>
        setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p))
      )
  }

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => ({
    total:       properties.length,
    available:   properties.filter(p => p.status === 'available').length,
    hold:        properties.filter(p => p.status === 'hold').length,
    requirement: properties.filter(p => p.status === 'requirement').length,
    sold:        properties.filter(p => p.status === 'sold').length,
  }), [properties])

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = properties.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (typeFilter !== 'all' && p.property_type !== typeFilter) return false
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

    return list
  }, [properties, statusFilter, typeFilter, search, sortBy])

  // ── Price summary ──────────────────────────────────────────────────────────
  const priceStats = useMemo(() => {
    if (loading || isMock || filtered.length < 2) return null
    const prices = filtered.map(p => p.price)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((s, v) => s + v, 0) / prices.length),
    }
  }, [filtered, loading, isMock])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[#F0F2F7] font-sans">

      {/* ── Desktop sidebar (md and above) ── */}
      <div className="hidden md:block">
        <Sidebar activeKey="dashboard" />
      </div>

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Desktop header (md and above) */}
        <div className="hidden md:block">
          <Header
            title="Property Dashboard"
            subtitle="Mathura · Vrindavan · Govardhan · Brij region"
          />
        </div>

        {/* Mobile top bar (below md) */}
        <div className="md:hidden bg-white border-b border-[#E8ECF4] px-4 py-2.5 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <span className="text-xl leading-none">🏠</span>
            <div className="leading-tight">
              <span className="text-[16px] font-extrabold text-[#0B1120] group-hover:text-emerald-700 transition-colors">
                Dealer<span className="text-emerald-500">Pro</span>
              </span>
              <p className="text-[9px] text-slate-400 font-medium tracking-wide hidden xs:block">
                by Shri Ram Krishna Group
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/leads"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-bold rounded-xl transition"
            >
              📋 Follow-ups
            </Link>
            <Link
              href="/add-property"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-bold rounded-xl transition"
            >
              + Add
            </Link>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-8">

          {/* KPI section */}
          <div className="px-3 sm:px-4 pt-4 sm:pt-5 pb-0">
            {/* Mock badge */}
            {isMock && !loading && (
              <div className="flex justify-end mb-3">
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                  📋 Sample data — connect Supabase to go live
                </span>
              </div>
            )}

            {/* KPI grid — 2 cols on mobile, 4 on sm+ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
              ) : (
                <>
                  <KpiCard label="Total Listings" value={kpis.total}       icon="🏠" accent="#0B1120" />
                  <KpiCard label="Available"       value={kpis.available}   icon="✅" accent="#00C47A" />
                  <KpiCard label="On Hold"         value={kpis.hold}        icon="⏳" accent="#F59E0B" />
                  <KpiCard label="Buy Requirement" value={kpis.requirement} icon="🔍" accent="#6366F1" />
                </>
              )}
            </div>
          </div>

          {/* Filter bar */}
          <FilterBar
            search={search}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            sortBy={sortBy}
            count={filtered.length}
            onSearch={setSearch}
            onStatus={setStatusFilter}
            onType={setTypeFilter}
            onSort={setSortBy}
          />

          {/* Property grid */}
          <div className="px-3 sm:px-4 py-3 sm:py-4">
            <PropertyGrid
              properties={filtered}
              loading={loading}
              isMock={isMock}
              search={search}
              onClearSearch={() => setSearch('')}
              onStatusChange={handleStatusChange}
              onPropertyClick={id => router.push(`/property/${id}`)}
            />
          </div>

          {/* Price summary footer */}
          {priceStats && (
            <div className="mx-3 sm:mx-4 mb-4 bg-white border border-[#E8ECF4] rounded-2xl shadow-sm px-4 sm:px-5 py-3 sm:py-4 flex flex-wrap gap-4 sm:gap-6">
              <div>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide">Lowest</p>
                <p className="text-sm sm:text-base font-extrabold text-emerald-600 mt-0.5">{fmtPrice(priceStats.min)}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide">Highest</p>
                <p className="text-sm sm:text-base font-extrabold text-[#0B1120] mt-0.5">{fmtPrice(priceStats.max)}</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#94A3B8] uppercase tracking-wide">Avg Price</p>
                <p className="text-sm sm:text-base font-extrabold text-[#0B1120] mt-0.5">{fmtPrice(priceStats.avg)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Property button (mobile only, above bottom nav) */}
      <Link
        href="/add-property"
        className="md:hidden fixed bottom-[72px] right-4 z-40 w-14 h-14 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white text-2xl rounded-full shadow-[0_4px_20px_rgba(0,196,122,0.4)] transition-all active:scale-95"
        aria-label="Add Property"
      >
        +
      </Link>

      {/* Mobile bottom nav */}
      <MobileBottomNav leadsBadge={kpis.requirement} />
    </div>
  )
}
