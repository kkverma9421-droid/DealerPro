'use client'

import { useState, useEffect, useMemo, useRef, useCallback, type ChangeEvent } from 'react'
import Link        from 'next/link'
import AppNavbar   from '@/components/AppNavbar'
import { supabase } from '@/lib/supabase/client'
import { mockLeads } from '@/data/mockLeads'
import type { Lead, LeadStage } from '@/types'

// ─── Stage config ─────────────────────────────────────────────────────────────
const STAGES: {
  value: LeadStage
  label: string
  icon:  string
  bg:    string
  text:  string
  ring:  string
  pill:  string
}[] = [
  { value: 'new_inquiry',     label: 'New',         icon: '📋', bg: 'bg-indigo-50',  text: 'text-indigo-700',  ring: 'border-indigo-200',  pill: 'bg-indigo-500'  },
  { value: 'contacted',       label: 'Contacted',   icon: '📞', bg: 'bg-sky-50',     text: 'text-sky-700',     ring: 'border-sky-200',     pill: 'bg-sky-500'     },
  { value: 'visit_scheduled', label: 'Visit Set',   icon: '📅', bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'border-amber-200',   pill: 'bg-amber-500'   },
  { value: 'negotiation',     label: 'Negotiation', icon: '🤝', bg: 'bg-orange-50',  text: 'text-orange-700',  ring: 'border-orange-200',  pill: 'bg-orange-500'  },
  { value: 'closed',          label: 'Closed',      icon: '✅', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'border-emerald-200', pill: 'bg-emerald-500' },
  { value: 'lost',            label: 'Lost',        icon: '❌', bg: 'bg-red-50',     text: 'text-red-700',     ring: 'border-red-200',     pill: 'bg-red-400'     },
]

const STAGE_MAP = Object.fromEntries(STAGES.map(s => [s.value, s]))

const PRIORITY_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  urgent: { label: 'Urgent', dot: 'bg-red-500',    bg: 'bg-red-50',    text: 'text-red-700'    },
  high:   { label: 'High',   dot: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' },
  medium: { label: 'Medium', dot: 'bg-sky-500',    bg: 'bg-sky-50',    text: 'text-sky-700'    },
  low:    { label: 'Low',    dot: 'bg-slate-400',  bg: 'bg-slate-50',  text: 'text-slate-600'  },
}

const SOURCES        = ['WhatsApp', 'Website', 'Referral', 'Walk-in', 'Instagram', 'Facebook', 'JustDial', 'LinkedIn', 'Other']
const PROPERTY_TYPES = ['plot', 'apartment', 'villa', 'shop', 'office', 'warehouse', 'builder_floor', 'sco', 'penthouse', 'other']
const PRIORITIES     = ['urgent', 'high', 'medium', 'low']

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatBudget(min?: number, max?: number): string {
  const fmt = (n: number) => {
    if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`
    if (n >= 100_000)    return `₹${(n / 100_000).toFixed(0)}L`
    return `₹${n.toLocaleString('en-IN')}`
  }
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min)        return `${fmt(min)}+`
  if (max)        return `Up to ${fmt(max)}`
  return '—'
}

function relativeDate(dateStr?: string): string {
  if (!dateStr) return ''
  const d    = new Date(dateStr)
  const now  = new Date()
  const diff = Math.floor((d.getTime() - now.getTime()) / 86400000)
  if (diff < -1)  return `${Math.abs(diff)}d ago`
  if (diff === -1) return 'Yesterday'
  if (diff === 0)  return 'Today'
  if (diff === 1)  return 'Tomorrow'
  return `In ${diff}d`
}

function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

function capitalize(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ─── Stage stat pill ─────────────────────────────────────────────────────────
function StageStat({ stage, count, active, onClick }: {
  stage: typeof STAGES[number]; count: number; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap
        ${active
          ? `${stage.bg} ${stage.text} ring-1 ${stage.ring} shadow-sm`
          : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
        }
      `}
    >
      <span>{stage.icon}</span>
      <span>{stage.label}</span>
      <span className={`
        min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-extrabold
        ${active ? `${stage.pill} text-white` : 'bg-slate-100 text-slate-600'}
      `}>
        {count}
      </span>
    </button>
  )
}

// ─── Lead card (pipeline view) ───────────────────────────────────────────────
function LeadCard({ lead, onClick, onStageChange }: {
  lead: Lead
  onClick: () => void
  onStageChange: (id: string, stage: LeadStage) => void
}) {
  const pri     = PRIORITY_CONFIG[lead.priority] ?? PRIORITY_CONFIG.medium
  const overdue = isOverdue(lead.follow_up_date)

  const phone  = lead.client_phone?.replace(/\D/g, '') ?? ''
  const waLink = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(`Hi ${lead.client_name}, this is regarding your property enquiry (${lead.lead_number}). How can we help you further?`)}`
    : ''

  const stageIndex = STAGES.findIndex(s => s.value === lead.stage)
  const canAdvance = stageIndex < STAGES.length - 2
  const nextStage  = canAdvance ? STAGES[stageIndex + 1] : null

  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{lead.client_name}</p>
          <p className="text-[10px] text-slate-400 font-semibold">{lead.lead_number}</p>
        </div>
        <span className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${pri.bg} ${pri.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} />
          {pri.label}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
          {formatBudget(lead.budget_min, lead.budget_max)}
        </span>
        {lead.preferred_type && (
          <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded capitalize">
            {capitalize(lead.preferred_type)}
          </span>
        )}
      </div>

      {lead.preferred_location && (
        <p className="text-[11px] text-slate-500 mb-2 truncate">📍 {lead.preferred_location}</p>
      )}

      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[10px] text-slate-400 font-medium">via {lead.source}</span>
        {lead.follow_up_date && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            overdue ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'
          }`}>
            📅 {relativeDate(lead.follow_up_date)}
          </span>
        )}
      </div>

      {lead.notes && (
        <p className="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">{lead.notes}</p>
      )}

      <div
        className="flex items-center gap-1.5 pt-2.5 border-t border-slate-50"
        onClick={e => e.stopPropagation()}
      >
        {lead.client_phone && (
          <>
            <a href={`tel:${lead.client_phone}`}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition">
              📞 Call
            </a>
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition">
                💬 WhatsApp
              </a>
            )}
          </>
        )}
        {nextStage && (
          <button
            onClick={() => onStageChange(lead.id, nextStage.value)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition"
          >
            → {nextStage.label}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Lead row (list view) ────────────────────────────────────────────────────
function LeadRow({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const stageCfg = STAGE_MAP[lead.stage] ?? STAGE_MAP.new_inquiry
  const pri      = PRIORITY_CONFIG[lead.priority] ?? PRIORITY_CONFIG.medium
  const overdue  = isOverdue(lead.follow_up_date)

  return (
    <tr onClick={onClick}
      className="hover:bg-emerald-50/40 transition cursor-pointer border-b border-slate-50 last:border-0">
      <td className="py-3 px-4">
        <p className="text-sm font-bold text-slate-800">{lead.client_name}</p>
        <p className="text-[10px] text-slate-400 font-medium">{lead.lead_number}</p>
      </td>
      <td className="py-3 px-3">
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${stageCfg.bg} ${stageCfg.text}`}>
          {stageCfg.icon} {stageCfg.label}
        </span>
      </td>
      <td className="py-3 px-3">
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${pri.bg} ${pri.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} /> {pri.label}
        </span>
      </td>
      <td className="py-3 px-3 text-xs font-semibold text-emerald-700">
        {formatBudget(lead.budget_min, lead.budget_max)}
      </td>
      <td className="py-3 px-3 text-xs text-slate-500 max-w-[140px] truncate">
        {lead.preferred_location || '—'}
      </td>
      <td className="py-3 px-3 text-[11px] text-slate-400">{lead.source}</td>
      <td className="py-3 px-3">
        {lead.follow_up_date ? (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            overdue ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'
          }`}>
            {relativeDate(lead.follow_up_date)}
          </span>
        ) : (
          <span className="text-[10px] text-slate-300">—</span>
        )}
      </td>
      <td className="py-3 px-3" onClick={e => e.stopPropagation()}>
        {lead.client_phone && (
          <div className="flex items-center gap-2">
            <a href={`tel:${lead.client_phone}`} className="text-sm hover:scale-110 transition-transform" title="Call">📞</a>
            <a href={`https://wa.me/${lead.client_phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="text-sm hover:scale-110 transition-transform" title="WhatsApp">💬</a>
          </div>
        )}
      </td>
    </tr>
  )
}

// ─── Add / Edit Lead Modal ───────────────────────────────────────────────────
const inputCls  = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder:text-slate-300 transition'
const selectCls = inputCls

interface LeadModalProps {
  lead?:   Lead | null
  open:    boolean
  onClose: () => void
  onSave:  (data: Partial<Lead>) => void
}

function LeadModal({ lead, open, onClose, onSave }: LeadModalProps) {
  const isEdit = !!lead

  const [form, setForm] = useState({
    client_name:        '',
    client_phone:       '',
    client_email:       '',
    budget_min:         '',
    budget_max:         '',
    preferred_location: '',
    preferred_type:     'plot',
    stage:              'new_inquiry' as LeadStage,
    source:             'WhatsApp',
    priority:           'medium',
    assigned_to:        '',
    follow_up_date:     '',
    notes:              '',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (lead) {
      setForm({
        client_name:        lead.client_name,
        client_phone:       lead.client_phone ?? '',
        client_email:       lead.client_email ?? '',
        budget_min:         lead.budget_min?.toString() ?? '',
        budget_max:         lead.budget_max?.toString() ?? '',
        preferred_location: lead.preferred_location ?? '',
        preferred_type:     lead.preferred_type ?? 'plot',
        stage:              lead.stage,
        source:             lead.source,
        priority:           lead.priority,
        assigned_to:        lead.assigned_to ?? '',
        follow_up_date:     lead.follow_up_date?.split('T')[0] ?? '',
        notes:              lead.notes ?? '',
      })
    } else {
      setForm({
        client_name: '', client_phone: '', client_email: '',
        budget_min: '', budget_max: '', preferred_location: '',
        preferred_type: 'plot', stage: 'new_inquiry', source: 'WhatsApp',
        priority: 'medium', assigned_to: '', follow_up_date: '', notes: '',
      })
    }
    setError(null)
  }, [lead, open])

  const set = useCallback(
    (key: keyof typeof form) =>
      (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value })),
    [],
  )

  function handleSubmit() {
    if (!form.client_name.trim()) { setError('Client name is required'); return }
    setError(null)
    onSave({
      ...form,
      budget_min:    form.budget_min    ? Number(form.budget_min)    : undefined,
      budget_max:    form.budget_max    ? Number(form.budget_max)    : undefined,
      follow_up_date: form.follow_up_date || undefined,
      stage:    form.stage    as LeadStage,
      priority: form.priority as Lead['priority'],
    })
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 px-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto z-10">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-base font-extrabold text-slate-800">{isEdit ? 'Edit Lead' : 'Add New Lead'}</h2>
            {isEdit && <p className="text-[11px] text-slate-400 font-semibold">{lead!.lead_number}</p>}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-lg">
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Client Name <span className="text-red-400">*</span></label>
              <input className={inputCls} placeholder="Full name" value={form.client_name} onChange={set('client_name')} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Phone</label>
              <input className={inputCls} placeholder="+91-98765-43210" type="tel" value={form.client_phone} onChange={set('client_phone')} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Email</label>
            <input className={inputCls} placeholder="email@example.com" type="email" value={form.client_email} onChange={set('client_email')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Budget Min (₹)</label>
              <input type="number" className={inputCls} placeholder="3000000" value={form.budget_min} onChange={set('budget_min')} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Budget Max (₹)</label>
              <input type="number" className={inputCls} placeholder="6000000" value={form.budget_max} onChange={set('budget_max')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Preferred Location</label>
              <input className={inputCls} placeholder="Vrindavan, Mathura…" value={form.preferred_location} onChange={set('preferred_location')} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Property Type</label>
              <select className={selectCls} value={form.preferred_type} onChange={set('preferred_type')}>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{capitalize(t)}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Stage</label>
              <select className={selectCls} value={form.stage} onChange={set('stage')}>
                {STAGES.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Priority</label>
              <select className={selectCls} value={form.priority} onChange={set('priority')}>
                {PRIORITIES.map(p => <option key={p} value={p}>{capitalize(p)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Source</label>
              <select className={selectCls} value={form.source} onChange={set('source')}>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Assigned To</label>
              <input className={inputCls} placeholder="Agent name" value={form.assigned_to} onChange={set('assigned_to')} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Follow-up Date</label>
              <input type="date" className={inputCls} value={form.follow_up_date} onChange={set('follow_up_date')} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Notes</label>
            <textarea className={`${inputCls} resize-none`} rows={3}
              placeholder="Client requirements, visit details, negotiation notes…"
              value={form.notes} onChange={set('notes')} />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <span className="text-red-400 flex-shrink-0 mt-0.5">⚠️</span>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-4 flex items-center justify-between rounded-b-2xl">
          <button onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition">
            Cancel
          </button>
          <button onClick={handleSubmit}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition">
            {isEdit ? 'Save Changes' : '+ Add Lead'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Lead detail panel ───────────────────────────────────────────────────────
function LeadDetailPanel({ lead, onClose, onEdit, onStageChange }: {
  lead: Lead
  onClose: () => void
  onEdit:  () => void
  onStageChange: (id: string, stage: LeadStage) => void
}) {
  const stageCfg = STAGE_MAP[lead.stage] ?? STAGE_MAP.new_inquiry
  const pri      = PRIORITY_CONFIG[lead.priority] ?? PRIORITY_CONFIG.medium
  const overdue  = isOverdue(lead.follow_up_date)

  const phone  = lead.client_phone?.replace(/\D/g, '') ?? ''
  const waLink = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(`Hi ${lead.client_name}, this is regarding your property enquiry (${lead.lead_number}). How can we help you further?`)}`
    : ''

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-12 px-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto z-10">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <p className="text-[10px] font-bold text-slate-400">{lead.lead_number}</p>
            <h2 className="text-lg font-extrabold text-slate-800">{lead.client_name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit}
              className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition">
              ✏️ Edit
            </button>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-lg">
              ×
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${stageCfg.bg} ${stageCfg.text}`}>
              {stageCfg.icon} {stageCfg.label}
            </span>
            <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${pri.bg} ${pri.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} /> {pri.label}
            </span>
            {lead.follow_up_date && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${overdue ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                📅 Follow-up: {relativeDate(lead.follow_up_date)}
              </span>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Contact</h3>
            <div className="space-y-2">
              {lead.client_phone && (
                <div className="flex items-center gap-3">
                  <span className="text-sm">📞</span>
                  <span className="text-sm text-slate-700 font-medium">{lead.client_phone}</span>
                </div>
              )}
              {lead.client_email && (
                <div className="flex items-center gap-3">
                  <span className="text-sm">📧</span>
                  <span className="text-sm text-slate-700 font-medium">{lead.client_email}</span>
                </div>
              )}
              {lead.assigned_to && (
                <div className="flex items-center gap-3">
                  <span className="text-sm">👤</span>
                  <span className="text-sm text-slate-700 font-medium">Assigned: {lead.assigned_to}</span>
                </div>
              )}
            </div>
            {lead.client_phone && (
              <div className="flex gap-2 mt-3">
                <a href={`tel:${lead.client_phone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition">
                  📞 Call
                </a>
                {waLink && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition">
                    💬 WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Requirements</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Budget</p>
                <p className="text-sm font-bold text-emerald-700">{formatBudget(lead.budget_min, lead.budget_max)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Type</p>
                <p className="text-sm font-semibold text-slate-700 capitalize">{capitalize(lead.preferred_type ?? '—')}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Location</p>
                <p className="text-sm font-semibold text-slate-700">{lead.preferred_location || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Source</p>
                <p className="text-sm font-semibold text-slate-700">{lead.source}</p>
              </div>
            </div>
            {lead.property_interest && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Interested Property</p>
                <Link href={`/property/${lead.property_interest}`}
                  className="text-sm font-bold text-emerald-600 hover:text-emerald-700 underline decoration-dashed underline-offset-2">
                  View Property →
                </Link>
              </div>
            )}
          </div>

          {lead.notes && (
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Notes</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{lead.notes}</p>
            </div>
          )}

          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Move to Stage</h3>
            <div className="flex flex-wrap gap-1.5">
              {STAGES.map(s => {
                const isCurrent = s.value === lead.stage
                return (
                  <button
                    key={s.value}
                    onClick={() => { if (!isCurrent) onStageChange(lead.id, s.value) }}
                    disabled={isCurrent}
                    className={`
                      flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition
                      ${isCurrent
                        ? `${s.pill} text-white cursor-default`
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }
                    `}
                  >
                    {s.icon} {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 space-y-1 pt-2 border-t border-slate-100">
            <p>Created: {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p>Updated: {new Date(lead.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            {lead.last_contacted && (
              <p>Last contacted: {new Date(lead.last_contacted).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const [leads,   setLeads]   = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [isMock,  setIsMock]  = useState(false)

  const [viewMode,     setViewMode]     = useState<'pipeline' | 'list'>('pipeline')
  const [search,       setSearch]       = useState('')
  const [stageFilter,  setStageFilter]  = useState<LeadStage | 'all'>('all')
  const [prioFilter,   setPrioFilter]   = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')

  const [modalOpen,   setModalOpen]   = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [detailLead,  setDetailLead]  = useState<Lead | null>(null)

  useEffect(() => {
    async function fetchLeads() {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        setLeads(data as Lead[])
        setIsMock(false)
      } else {
        setLeads(mockLeads)
        setIsMock(true)
      }
      setLoading(false)
    }
    fetchLeads()
  }, [])

  const stats = useMemo(() => {
    const byStage: Record<string, number> = {}
    STAGES.forEach(s => { byStage[s.value] = 0 })
    leads.forEach(l => { byStage[l.stage] = (byStage[l.stage] ?? 0) + 1 })
    const overdueCount = leads.filter(l =>
      l.follow_up_date && isOverdue(l.follow_up_date) && l.stage !== 'closed' && l.stage !== 'lost'
    ).length
    return { byStage, total: leads.length, overdueCount }
  }, [leads])

  const filtered = useMemo(() => {
    let r = [...leads]
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(l =>
        l.client_name.toLowerCase().includes(q) ||
        l.lead_number.toLowerCase().includes(q) ||
        (l.client_phone ?? '').includes(q) ||
        (l.preferred_location ?? '').toLowerCase().includes(q) ||
        (l.notes ?? '').toLowerCase().includes(q)
      )
    }
    if (stageFilter  !== 'all') r = r.filter(l => l.stage    === stageFilter)
    if (prioFilter   !== 'all') r = r.filter(l => l.priority === prioFilter)
    if (sourceFilter !== 'all') r = r.filter(l => l.source   === sourceFilter)
    return r
  }, [leads, search, stageFilter, prioFilter, sourceFilter])

  const pipelineData = useMemo(() => {
    const groups: Record<LeadStage, Lead[]> = {
      new_inquiry: [], contacted: [], visit_scheduled: [],
      negotiation: [], closed: [], lost: [],
    }
    filtered.forEach(l => { if (groups[l.stage]) groups[l.stage].push(l) })
    return groups
  }, [filtered])

  const sources = useMemo(() => [...new Set(leads.map(l => l.source))].sort(), [leads])

  function handleStageChange(id: string, stage: LeadStage) {
    setLeads(prev => prev.map(l =>
      l.id === id
        ? { ...l, stage, updated_at: new Date().toISOString(),
            last_contacted: stage !== 'new_inquiry' ? new Date().toISOString() : l.last_contacted }
        : l
    ))
    setDetailLead(prev => prev?.id === id ? { ...prev, stage, updated_at: new Date().toISOString() } : prev)
    if (!isMock) {
      supabase.from('leads').update({ stage, updated_at: new Date().toISOString() }).eq('id', id)
    }
  }

  function handleSaveLead(data: Partial<Lead>) {
    if (editingLead) {
      setLeads(prev => prev.map(l =>
        l.id === editingLead.id ? { ...l, ...data, updated_at: new Date().toISOString() } : l
      ))
      if (!isMock) {
        supabase.from('leads').update({ ...data, updated_at: new Date().toISOString() }).eq('id', editingLead.id)
      }
    } else {
      const newLead: Lead = {
        id:          `lead-${Date.now()}`,
        lead_number: `DPL-${String(leads.length + 1).padStart(3, '0')}`,
        client_name: data.client_name ?? '',
        client_phone:       data.client_phone,
        client_email:       data.client_email,
        budget_min:         data.budget_min,
        budget_max:         data.budget_max,
        preferred_location: data.preferred_location,
        preferred_type:     data.preferred_type,
        stage:    (data.stage    ?? 'new_inquiry') as LeadStage,
        source:    data.source   ?? 'WhatsApp',
        priority: (data.priority ?? 'medium') as Lead['priority'],
        assigned_to:    data.assigned_to,
        follow_up_date: data.follow_up_date,
        notes:          data.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setLeads(prev => [newLead, ...prev])
    }
  }

  const hasFilters = search.trim() !== '' || stageFilter !== 'all' || prioFilter !== 'all' || sourceFilter !== 'all'

  function clearFilters() {
    setSearch(''); setStageFilter('all'); setPrioFilter('all'); setSourceFilter('all')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar
        right={
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-700 font-medium transition">Dashboard</Link>
            <Link href="/analytics" className="text-sm text-slate-500 hover:text-slate-700 font-medium transition">Analytics</Link>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Lead Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isMock ? 'Sample leads' : `${leads.length} leads`}
              {stats.overdueCount > 0 && (
                <span className="text-red-500 font-semibold ml-2">
                  · {stats.overdueCount} overdue follow-up{stats.overdueCount > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isMock && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-full">
                Sample Data
              </span>
            )}
            <button
              onClick={() => { setEditingLead(null); setModalOpen(true) }}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all hover:-translate-y-0.5"
              style={{ boxShadow: '0 4px 14px rgba(16,185,129,0.25)' }}
            >
              + New Lead
            </button>
          </div>
        </div>

        {/* Stage stats */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-4 px-4 sm:mx-0 sm:px-0">
          <StageStat
            stage={{ value: 'new_inquiry' as LeadStage, label: 'All', icon: '📊', bg: 'bg-slate-100', text: 'text-slate-700', ring: 'border-slate-300', pill: 'bg-slate-600' }}
            count={stats.total}
            active={stageFilter === 'all'}
            onClick={() => setStageFilter('all')}
          />
          {STAGES.map(s => (
            <StageStat
              key={s.value}
              stage={s}
              count={stats.byStage[s.value] ?? 0}
              active={stageFilter === s.value}
              onClick={() => setStageFilter(stageFilter === s.value ? 'all' : s.value)}
            />
          ))}
        </div>

        {/* Search + Filters + View Toggle */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-5 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">🔍</span>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search leads by name, phone, location…"
                className="w-full pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder:text-slate-300 transition"
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-lg leading-none">×</button>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Priority</span>
              <select value={prioFilter} onChange={e => setPrioFilter(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition cursor-pointer">
                <option value="all">All</option>
                {PRIORITIES.map(p => <option key={p} value={p}>{capitalize(p)}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Source</span>
              <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition cursor-pointer">
                <option value="all">All Sources</option>
                {sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 self-end">
              <button
                onClick={() => setViewMode('pipeline')}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition ${viewMode === 'pipeline' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
              >
                Pipeline
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
              >
                List
              </button>
            </div>

            {hasFilters && (
              <button onClick={clearFilters}
                className="px-3 py-2 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition whitespace-nowrap self-end">
                ✕ Clear
              </button>
            )}
          </div>

          {hasFilters && (
            <div className="mt-3 pt-3 border-t border-slate-50">
              <span className="text-[11px] font-semibold text-slate-400">
                Showing {filtered.length} of {leads.length} leads
              </span>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Pipeline view */}
        {!loading && viewMode === 'pipeline' && (
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            {STAGES.map(stage => {
              if (stageFilter !== 'all' && stage.value !== stageFilter) return null
              const stageLeads = pipelineData[stage.value]
              return (
                <div
                  key={stage.value}
                  className={`flex-shrink-0 rounded-2xl border p-3 ${stage.ring} bg-slate-50/50`}
                  style={{ width: stageFilter === 'all' ? '260px' : '100%', maxWidth: stageFilter === 'all' ? '260px' : '600px' }}
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{stage.icon}</span>
                      <span className={`text-xs font-bold ${stage.text}`}>{stage.label}</span>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${stage.pill} text-white`}>
                      {stageLeads.length}
                    </span>
                  </div>
                  <div className={`space-y-2.5 ${stageFilter !== 'all' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 space-y-0' : ''}`}>
                    {stageLeads.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-xs text-slate-400">No leads</p>
                      </div>
                    ) : (
                      stageLeads.map(lead => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          onClick={() => setDetailLead(lead)}
                          onStageChange={handleStageChange}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* List view */}
        {!loading && viewMode === 'list' && (
          filtered.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center">
              <p className="text-5xl mb-3">💼</p>
              <h3 className="text-lg font-extrabold text-slate-800">
                {hasFilters ? 'No leads match your filters' : 'No leads yet'}
              </h3>
              <p className="text-sm text-slate-500 mt-1.5">
                {hasFilters ? 'Try adjusting your filters.' : 'Add your first lead to get started.'}
              </p>
              <div className="flex items-center justify-center gap-3 mt-5">
                {hasFilters && (
                  <button onClick={clearFilters}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition">
                    Clear Filters
                  </button>
                )}
                <button onClick={() => { setEditingLead(null); setModalOpen(true) }}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition">
                  + New Lead
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Client', 'Stage', 'Priority', 'Budget', 'Location', 'Source', 'Follow-up', 'Actions'].map(h => (
                        <th key={h} className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wide py-3 px-3 first:px-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(lead => (
                      <LeadRow key={lead.id} lead={lead} onClick={() => setDetailLead(lead)} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        <div className="text-center mt-8 pb-4">
          <p className="text-xs text-slate-400">DealerPro v1.0 · Lead CRM</p>
        </div>
      </div>

      <LeadModal
        lead={editingLead}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingLead(null) }}
        onSave={handleSaveLead}
      />

      {detailLead && (
        <LeadDetailPanel
          lead={detailLead}
          onClose={() => setDetailLead(null)}
          onEdit={() => { setDetailLead(null); setEditingLead(detailLead); setModalOpen(true) }}
          onStageChange={handleStageChange}
        />
      )}
    </div>
  )
}
