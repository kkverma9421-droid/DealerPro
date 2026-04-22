'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import AppNavbar      from '@/components/AppNavbar'
import { supabase }   from '@/lib/supabase/client'
import { mockProperties } from '@/data/mockProperties'
import { mockLeads }      from '@/data/mockLeads'
import type { Property, Lead, LeadStage } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtPrice(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)} Cr`
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(0)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

function fmtCompact(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1)}Cr`
  if (n >= 100_000)    return `${(n / 100_000).toFixed(0)}L`
  return n.toLocaleString('en-IN')
}

// ─── Bar chart ────────────────────────────────────────────────────────────────
function BarChart({
  data,
  maxValue,
  color = 'bg-emerald-400',
  labelKey = 'label',
  valueKey = 'value',
}: {
  data: Record<string, unknown>[]
  maxValue: number
  color?: string
  labelKey?: string
  valueKey?: string
}) {
  return (
    <div className="space-y-2">
      {data.map((item, i) => {
        const label = String(item[labelKey] ?? '')
        const value = Number(item[valueKey] ?? 0)
        const pct   = maxValue > 0 ? (value / maxValue) * 100 : 0
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 font-medium w-28 shrink-0 truncate capitalize">{label}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full ${color} rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-slate-600 w-8 text-right shrink-0">{value}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Donut chart (pure CSS) ───────────────────────────────────────────────────
function DonutSlice({ offset, value, total, color }: {
  offset: number; value: number; total: number; color: string
}) {
  const pct = total > 0 ? (value / total) * 100 : 0
  const r   = 40
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const gap  = circ - dash
  return (
    <circle
      cx="50" cy="50" r={r}
      fill="none"
      stroke={color}
      strokeWidth="18"
      strokeDasharray={`${dash} ${gap}`}
      strokeDashoffset={-offset}
      style={{ transition: 'stroke-dasharray 0.5s ease' }}
    />
  )
}

function DonutChart({ slices }: { slices: { label: string; value: number; hex: string }[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0)
  let offset  = 0
  const r     = 40
  const circ  = 2 * Math.PI * r

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-28 h-28 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {slices.map((s, i) => {
            const pct  = total > 0 ? (s.value / total) * 100 : 0
            const dash = (pct / 100) * circ
            const gap  = circ - dash
            const el = (
              <circle
                key={i}
                cx="50" cy="50" r={r}
                fill="none"
                stroke={s.hex}
                strokeWidth="18"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset}
              />
            )
            offset += dash
            return el
          })}
          {total === 0 && (
            <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="18" />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold text-slate-800">{total}</span>
          <span className="text-[9px] text-slate-400 font-semibold uppercase">Total</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {slices.map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.hex }} />
            <span className="text-[11px] text-slate-500 font-medium capitalize">{s.label}</span>
            <span className="text-[11px] font-bold text-slate-700 ml-auto pl-4">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, accent }: {
  icon: string; label: string; value: string | number; sub?: string; accent?: string
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-extrabold" style={{ color: accent ?? '#1e293b' }}>{value}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-1 font-medium">{sub}</p>}
    </div>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
      <h2 className="text-sm font-extrabold text-slate-700 mb-4">{title}</h2>
      {children}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [leads,      setLeads]      = useState<Lead[]>([])
  const [loading,    setLoading]    = useState(true)
  const [isMock,     setIsMock]     = useState(false)

  useEffect(() => {
    async function load() {
      const [pRes, lRes] = await Promise.all([
        supabase.from('properties').select('*').order('created_at', { ascending: false }),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
      ])
      if (!pRes.error && pRes.data && pRes.data.length > 0) {
        setProperties(pRes.data as Property[])
        setLeads((lRes.data ?? []) as Lead[])
        setIsMock(false)
      } else {
        setProperties(mockProperties as Property[])
        setLeads(mockLeads)
        setIsMock(true)
      }
      setLoading(false)
    }
    load()
  }, [])

  // ── Derived analytics ───────────────────────────────────────────────────────
  const analytics = useMemo(() => {
    // Property stats
    const totalValue   = properties.reduce((s, p) => s + p.price, 0)
    const avgPrice     = properties.length ? totalValue / properties.length : 0
    const featured     = properties.filter(p => p.featured).length

    const byStatus = [
      { label: 'Available',   value: properties.filter(p => p.status === 'available').length,   hex: '#10b981' },
      { label: 'Hold',        value: properties.filter(p => p.status === 'hold').length,        hex: '#f59e0b' },
      { label: 'Sold',        value: properties.filter(p => p.status === 'sold').length,        hex: '#ef4444' },
      { label: 'Buy Req',     value: properties.filter(p => p.status === 'requirement').length, hex: '#3b82f6' },
    ]

    const typeCount: Record<string, number> = {}
    properties.forEach(p => { typeCount[p.property_type] = (typeCount[p.property_type] ?? 0) + 1 })
    const byType = Object.entries(typeCount)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
    const maxType = Math.max(...byType.map(x => x.value), 1)

    const cityCount: Record<string, number> = {}
    properties.forEach(p => { cityCount[p.city] = (cityCount[p.city] ?? 0) + 1 })
    const byCity = Object.entries(cityCount)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
    const maxCity = Math.max(...byCity.map(x => x.value), 1)

    // Lead stats
    const activeLeads = leads.filter(l => l.stage !== 'closed' && l.stage !== 'lost')
    const closedLeads = leads.filter(l => l.stage === 'closed')
    const lostLeads   = leads.filter(l => l.stage === 'lost')
    const overdueLeads = activeLeads.filter(l => l.follow_up_date && new Date(l.follow_up_date) < new Date())

    const conversionRate = leads.length > 0
      ? Math.round((closedLeads.length / leads.length) * 100)
      : 0

    const avgBudget = activeLeads.filter(l => l.budget_max).length > 0
      ? activeLeads.filter(l => l.budget_max).reduce((s, l) => s + (l.budget_max ?? 0), 0) /
        activeLeads.filter(l => l.budget_max).length
      : 0

    const STAGE_ORDER: LeadStage[] = ['new_inquiry', 'contacted', 'visit_scheduled', 'negotiation', 'closed', 'lost']
    const STAGE_LABELS: Record<LeadStage, string> = {
      new_inquiry:     'New',
      contacted:       'Contacted',
      visit_scheduled: 'Visit Set',
      negotiation:     'Negotiation',
      closed:          'Closed',
      lost:            'Lost',
    }
    const STAGE_HEX: Record<LeadStage, string> = {
      new_inquiry:     '#6366f1',
      contacted:       '#0ea5e9',
      visit_scheduled: '#f59e0b',
      negotiation:     '#f97316',
      closed:          '#10b981',
      lost:            '#ef4444',
    }
    const byStage = STAGE_ORDER.map(s => ({
      label: STAGE_LABELS[s],
      value: leads.filter(l => l.stage === s).length,
      hex:   STAGE_HEX[s],
    }))

    const sourceCount: Record<string, number> = {}
    leads.forEach(l => { sourceCount[l.source] = (sourceCount[l.source] ?? 0) + 1 })
    const bySource = Object.entries(sourceCount)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
    const maxSource = Math.max(...bySource.map(x => x.value), 1)

    const prioCount: Record<string, number> = {}
    leads.forEach(l => { prioCount[l.priority] = (prioCount[l.priority] ?? 0) + 1 })
    const byPriority = [
      { label: 'Urgent', value: prioCount.urgent ?? 0, hex: '#ef4444' },
      { label: 'High',   value: prioCount.high   ?? 0, hex: '#f97316' },
      { label: 'Medium', value: prioCount.medium  ?? 0, hex: '#0ea5e9' },
      { label: 'Low',    value: prioCount.low     ?? 0, hex: '#94a3b8' },
    ]

    return {
      totalValue, avgPrice, featured,
      byStatus, byType, maxType, byCity, maxCity,
      totalLeads: leads.length, activeLeads: activeLeads.length,
      closedLeads: closedLeads.length, lostLeads: lostLeads.length,
      overdueLeads: overdueLeads.length, conversionRate, avgBudget,
      byStage, bySource, maxSource, byPriority,
    }
  }, [properties, leads])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppNavbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[...Array(8)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[...Array(6)].map((_, i) => <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar
        right={
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 font-medium transition">Dashboard</Link>
            <Link href="/leads"     className="text-sm text-slate-500 hover:text-slate-700 font-medium transition">Leads</Link>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Analytics</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isMock ? 'Sample data — connect Supabase for live analytics' : 'Live data from your database'}
            </p>
          </div>
          {isMock && (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-full">
              Sample Data
            </span>
          )}
        </div>

        {/* ── Property KPIs ── */}
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Properties</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <KpiCard icon="🏠" label="Total Listings" value={properties.length} accent="#1e293b" />
          <KpiCard icon="💰" label="Portfolio Value" value={fmtCompact(analytics.totalValue)} sub="Combined listing price" accent="#10b981" />
          <KpiCard icon="📊" label="Avg Price" value={fmtPrice(analytics.avgPrice)} accent="#6366f1" />
          <KpiCard icon="⭐" label="Featured" value={analytics.featured} sub={`of ${properties.length} listings`} accent="#f59e0b" />
        </div>

        {/* ── Property charts ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <Section title="Status Breakdown">
            <DonutChart slices={analytics.byStatus} />
          </Section>

          <Section title="Listings by Type">
            <BarChart data={analytics.byType} maxValue={analytics.maxType} color="bg-indigo-400" />
          </Section>

          <Section title="Listings by City">
            <BarChart data={analytics.byCity} maxValue={analytics.maxCity} color="bg-emerald-400" />
          </Section>
        </div>

        {/* ── Lead KPIs ── */}
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Lead Pipeline</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <KpiCard icon="💼" label="Total Leads"   value={analytics.totalLeads}  accent="#1e293b" />
          <KpiCard icon="🔥" label="Active"         value={analytics.activeLeads} sub="In pipeline" accent="#6366f1" />
          <KpiCard icon="✅" label="Closed Deals"   value={analytics.closedLeads} accent="#10b981" />
          <KpiCard icon="📈" label="Conversion"     value={`${analytics.conversionRate}%`} sub="Leads → Closed" accent="#10b981" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <KpiCard icon="❌" label="Lost Leads"     value={analytics.lostLeads}   accent="#ef4444" />
          <KpiCard icon="⚠️" label="Overdue Follow-ups" value={analytics.overdueLeads} accent={analytics.overdueLeads > 0 ? '#ef4444' : '#64748b'} />
          <KpiCard icon="💰" label="Avg Lead Budget" value={analytics.avgBudget > 0 ? fmtPrice(analytics.avgBudget) : '—'} sub="Max budget of active leads" accent="#f59e0b" />
          <KpiCard icon="📋" label="Stages Active"   value={analytics.byStage.filter(s => s.value > 0 && s.label !== 'Closed' && s.label !== 'Lost').length} sub="of 4 pipeline stages" accent="#0ea5e9" />
        </div>

        {/* ── Lead charts ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <Section title="Leads by Stage">
            <DonutChart slices={analytics.byStage} />
          </Section>

          <Section title="Leads by Source">
            <BarChart data={analytics.bySource} maxValue={analytics.maxSource} color="bg-sky-400" />
          </Section>

          <Section title="Leads by Priority">
            <DonutChart slices={analytics.byPriority} />
          </Section>
        </div>

        {/* ── Conversion funnel ── */}
        <Section title="Conversion Funnel">
          <div className="flex items-end gap-2 h-36">
            {analytics.byStage.map((s, i) => {
              const maxVal = Math.max(...analytics.byStage.map(x => x.value), 1)
              const heightPct = s.value > 0 ? Math.max((s.value / maxVal) * 100, 8) : 4
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-slate-700">{s.value}</span>
                  <div
                    className="w-full rounded-t-lg transition-all duration-500"
                    style={{ height: `${heightPct}%`, background: s.hex, opacity: s.value === 0 ? 0.25 : 1 }}
                  />
                  <span className="text-[9px] text-slate-400 font-semibold text-center leading-tight">{s.label}</span>
                </div>
              )
            })}
          </div>
        </Section>

        <p className="text-center text-xs text-slate-400 mt-8 pb-4">DealerPro v1.0 · Analytics</p>
      </div>
    </div>
  )
}
