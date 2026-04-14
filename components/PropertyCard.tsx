'use client'

import type { Property, PropertyStatus } from '@/types'

const STATUS_STYLES: Record<PropertyStatus, { label: string; bg: string; text: string; btnBg: string }> = {
  available:   { label: 'Available', bg: '#f0fdf4', text: '#059669', btnBg: '#10b981' },
  sold:        { label: 'Sold',      bg: '#fef2f2', text: '#dc2626', btnBg: '#ef4444' },
  hold:        { label: 'On Hold',   bg: '#fffbeb', text: '#d97706', btnBg: '#f59e0b' },
  requirement: { label: 'Buy Req',   bg: '#eff6ff', text: '#2563eb', btnBg: '#3b82f6' },
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

function formatPrice(price: number): string {
  if (price >= 10_000_000) return `₹${(price / 10_000_000).toFixed(2)} Cr`
  if (price >= 100_000)    return `₹${(price / 100_000).toFixed(1)} L`
  return `₹${price.toLocaleString('en-IN')}`
}

interface PropertyCardProps {
  property:        Property
  onStatusChange?: (id: string, status: PropertyStatus) => void
  onClick?:        () => void
}

export default function PropertyCard({ property, onStatusChange, onClick }: PropertyCardProps) {
  const status  = STATUS_STYLES[property.status] ?? STATUS_STYLES.available
  const emoji   = TYPE_EMOJI[property.property_type] ?? '🏠'

  const primaryImg =
    property.property_images?.find((img) => img.is_primary)?.image_url ||
    property.property_images?.[0]?.image_url ||
    null

  const waLink = `https://wa.me/${(property.owner_phone ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi, I am interested in your property "${property.title}". Please share more details.`
  )}`

  return (
    <article
      className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-40 bg-slate-100 flex items-center justify-center overflow-hidden">
        {primaryImg ? (
          <img
            src={primaryImg}
            alt={property.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-5xl select-none">{emoji}</span>
        )}

        {property.featured && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
            ⭐ Featured
          </span>
        )}

        <span
          className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: status.bg, color: status.text }}
        >
          {status.label}
        </span>
      </div>

      <div className="p-4">
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
          {property.property_id}
        </span>

        <h3 className="text-sm font-bold text-slate-800 truncate mt-1.5">
          {property.title}
        </h3>

        <p className="text-[11px] text-slate-400 truncate mt-0.5">
          📍 {property.locality}, {property.city}
        </p>

        <p className="text-lg font-extrabold text-emerald-600 mt-2">
          {formatPrice(property.price)}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded capitalize">
            {property.property_type.replace('_', ' ')}
          </span>
          {property.area_sqft && (
            <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
              📐 {property.area_sqft.toLocaleString()} sqft
            </span>
          )}
          {property.bedrooms && (
            <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
              {property.bedrooms} BHK
            </span>
          )}
        </div>
      </div>

      {onStatusChange && (
        <div
          className="grid grid-cols-3 gap-1.5 px-4 pb-3"
          onClick={(e) => e.stopPropagation()}
        >
          {(['available', 'sold', 'hold'] as PropertyStatus[]).map((s) => {
            const cfg    = STATUS_STYLES[s]
            const active = property.status === s
            return (
              <button
                key={s}
                onClick={() => onStatusChange(property.id, s)}
                className="py-1.5 rounded-lg text-[10px] font-bold transition-all"
                style={{
                  background: active ? cfg.btnBg : '#f1f5f9',
                  color:      active ? '#fff'    : '#64748b',
                }}
              >
                {s === 'available' ? '✅' : s === 'sold' ? '🔑' : '⏳'}{' '}
                {cfg.label}
              </button>
            )
          })}
        </div>
      )}

      <div
        className="flex items-center justify-between border-t border-slate-50 px-4 py-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {property.owner_name.charAt(0).toUpperCase()}
          </div>
          <span className="text-[11px] text-slate-600 truncate">
            {property.owner_name}
          </span>
        </div>

        {property.owner_phone && (
          <div className="flex items-center gap-3 flex-shrink-0">
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