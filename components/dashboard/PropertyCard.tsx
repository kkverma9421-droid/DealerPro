'use client'

import Image from 'next/image'
import type { Property, PropertyStatus } from '@/types'

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<PropertyStatus, { label: string; dot: string; bg: string; text: string }> = {
  available:   { label: 'Available', dot: '#00C47A', bg: '#E6FAF3', text: '#007A4D' },
  sold:        { label: 'Sold',      dot: '#EF4444', bg: '#FEE2E2', text: '#B91C1C' },
  hold:        { label: 'On Hold',   dot: '#F59E0B', bg: '#FEF3C7', text: '#92400E' },
  requirement: { label: 'Buy Req',   dot: '#6366F1', bg: '#EEF2FF', text: '#4338CA' },
}

const TYPE_EMOJI: Record<string, string> = {
  apartment:     '🏢',
  villa:         '🏡',
  plot:          '🟫',
  shop:          '🏪',
  office:        '💼',
  warehouse:     '🏭',
  builder_floor: '🏗',
  sco:           '🏬',
  penthouse:     '🌟',
  other:         '🏠',
}

function fmtPrice(price: number): string {
  if (price >= 10_000_000) return `₹${(price / 10_000_000).toFixed(1)} Cr`
  if (price >= 100_000)    return `₹${(price / 100_000).toFixed(1)} L`
  return `₹${price.toLocaleString('en-IN')}`
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: PropertyStatus }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.available
  return (
    <span
      style={{ background: cfg.bg, color: cfg.text }}
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap leading-none"
    >
      <span style={{ background: cfg.dot }} className="w-1.5 h-1.5 rounded-full shrink-0" />
      {cfg.label}
    </span>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface DashboardPropertyCardProps {
  property:        Property
  onClick?:        () => void
  onStatusChange?: (id: string, status: PropertyStatus) => void
  compact?:        boolean
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export default function DashboardPropertyCard({
  property,
  onClick,
  onStatusChange,
  compact = false,
}: DashboardPropertyCardProps) {
  const emoji      = TYPE_EMOJI[property.property_type] ?? '🏠'
  const primaryImg =
    property.property_images?.find(img => img.is_primary)?.image_url ||
    property.property_images?.[0]?.image_url ||
    null

  const waMsg = encodeURIComponent(
    `Hi, I am interested in your property "${property.title}". Please share more details.`
  )
  const waLink    = `https://wa.me/${(property.owner_phone ?? '').replace(/\D/g, '')}?text=${waMsg}`
  const shareLink = waLink

  return (
    <article
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden border border-[#E8ECF4] shadow-[0_1px_4px_rgba(0,0,0,0.06)] cursor-pointer transition-all duration-150 hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 hover:border-emerald-200"
    >
      {/* ── Image ── */}
      <div className={`relative bg-[#F0F2F7] overflow-hidden ${compact ? 'h-[120px]' : 'h-[160px]'}`}>
        {primaryImg ? (
          <Image
            src={primaryImg}
            alt={property.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <span className="text-4xl select-none">{emoji}</span>
          </div>
        )}

        {/* Featured */}
        {property.featured && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-xl">
            ⭐ FEATURED
          </span>
        )}

        {/* Status */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={property.status} />
        </div>

        {/* Share shortcut */}
        <a
          href={shareLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="absolute bottom-2 left-2 bg-[#25D366] text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#1da851]"
        >
          💬 Share
        </a>
      </div>

      {/* ── Body ── */}
      <div className="px-3.5 pt-3 pb-2">
        <div className="text-[9px] text-slate-400 font-bold tracking-widest font-mono mb-0.5">
          {property.property_id}
        </div>

        <h3 className="text-[13px] font-bold text-[#0B1120] leading-snug line-clamp-2 mb-1">
          {property.title}
        </h3>

        <p className="text-[11px] text-[#64748B] mb-2 truncate">
          📍 {property.locality}, {property.city}
        </p>

        <p className="text-[22px] font-extrabold text-emerald-500 mb-2 tracking-tight leading-none">
          {fmtPrice(property.price)}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          <span className="text-[10px] text-[#64748B] bg-slate-50 px-2 py-0.5 rounded-lg font-semibold capitalize">
            {property.property_type.replace(/_/g, ' ')}
          </span>
          {property.area && (
            <span className="text-[10px] text-[#64748B] bg-slate-50 px-2 py-0.5 rounded-lg font-semibold">
              {property.area.toLocaleString()} sqft
            </span>
          )}
          {property.bedrooms && (
            <span className="text-[10px] text-[#64748B] bg-slate-50 px-2 py-0.5 rounded-lg font-semibold">
              {property.bedrooms} BHK
            </span>
          )}
        </div>
      </div>

      {/* ── Status change row ── */}
      {onStatusChange && (
        <div
          className="grid grid-cols-3 gap-1.5 px-3.5 pb-2.5"
          onClick={e => e.stopPropagation()}
        >
          {(['available', 'hold', 'sold'] as PropertyStatus[]).map(s => {
            const cfg    = STATUS_CFG[s]
            const active = property.status === s
            return (
              <button
                key={s}
                onClick={() => onStatusChange(property.id, s)}
                style={{
                  background: active ? cfg.dot : '#f1f5f9',
                  color:      active ? '#fff'  : '#64748b',
                }}
                className="py-1.5 rounded-lg text-[10px] font-bold transition-all"
              >
                {s === 'available' ? '✅' : s === 'hold' ? '⏳' : '🔑'}{' '}
                {cfg.label}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Owner footer ── */}
      <div
        className="flex items-center justify-between border-t border-slate-50 px-3.5 py-2"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-[26px] h-[26px] rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-[11px] font-extrabold shrink-0">
            {property.owner_name.charAt(0).toUpperCase()}
          </div>
          <span className="text-[11px] text-[#64748B] font-medium truncate">
            {property.owner_name.split(' ').slice(0, 2).join(' ')}
          </span>
        </div>

        {property.owner_phone && (
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`tel:${property.owner_phone}`}
              className="text-slate-400 hover:text-emerald-600 transition text-sm"
              aria-label="Call owner"
            >
              📞
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-green-600 transition text-sm"
              aria-label="WhatsApp owner"
            >
              💬
            </a>
          </div>
        )}
      </div>
    </article>
  )
}
