'use client'

import { useState, useEffect } from 'react'
import { useParams }           from 'next/navigation'
import Link                    from 'next/link'
import { supabase }            from '@/lib/supabase/client'
import type { Property, PropertyImage, PropertyStatus } from '@/types'
import { getMockById, isMockId } from '@/data/mockProperties'

// Extends the shared type with fields collected in the form but not yet in types/index.ts
interface PropertyDetail extends Property {
  bathrooms?: number
  category?:  string
}

// ─── Constants ────────────────────────────────────────────────────────────────
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

const STATUS_CONFIG: Record<PropertyStatus, { label: string; bg: string; text: string; ring: string }> = {
  available:   { label: 'Available', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  sold:        { label: 'Sold',      bg: 'bg-red-50',     text: 'text-red-700',     ring: 'ring-red-200'     },
  hold:        { label: 'On Hold',   bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'ring-amber-200'   },
  requirement: { label: 'Buy Req',   bg: 'bg-blue-50',    text: 'text-blue-700',    ring: 'ring-blue-200'    },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(price: number): string {
  if (price >= 10_000_000) return `₹${(price / 10_000_000).toFixed(2)} Cr`
  if (price >= 100_000)    return `₹${(price / 100_000).toFixed(1)} L`
  return `₹${price.toLocaleString('en-IN')}`
}

function capitalize(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-100 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🏠</span>
        <div className="flex flex-col leading-tight">
          <span className="text-lg font-extrabold text-slate-800">
            Dealer<span className="text-emerald-500">Pro</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            by Shri Ram Krishna Group of Properties
          </span>
        </div>
      </div>
      <Link
        href="/dashboard"
        className="text-sm text-slate-500 hover:text-slate-700 font-medium transition"
      >
        ← Dashboard
      </Link>
    </nav>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="animate-pulse">
      {/* Image area */}
      <div className="w-full h-64 sm:h-80 bg-slate-200 rounded-2xl mb-3" />
      <div className="flex gap-2 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-16 h-16 bg-slate-200 rounded-xl flex-shrink-0" />
        ))}
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="h-7 bg-slate-200 rounded-lg w-3/4" />
        <div className="h-4 bg-slate-100 rounded w-1/2" />
        <div className="h-8 bg-slate-200 rounded-lg w-1/3" />
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Image Gallery ────────────────────────────────────────────────────────────
function Gallery({ images, emoji }: { images: PropertyImage[]; emoji: string }) {
  const [active, setActive] = useState(0)

  if (!images.length) {
    return (
      <div className="w-full h-64 sm:h-80 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
        <span className="text-7xl select-none">{emoji}</span>
      </div>
    )
  }

  // Sort: primary first, then by sort_order
  const sorted = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return a.sort_order - b.sort_order
  })

  return (
    <div className="mb-6">
      {/* Primary / active image */}
      <div className="w-full h-64 sm:h-80 bg-slate-100 rounded-2xl overflow-hidden mb-3">
        <img
          src={sorted[active].image_url}
          alt={`Property image ${active + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails — only shown when multiple images */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                i === active
                  ? 'border-emerald-500 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <img
                src={img.image_url}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Detail chip ──────────────────────────────────────────────────────────────
function Chip({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-slate-700 mt-0.5 flex items-center gap-1.5">
        <span>{icon}</span> {value}
      </p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PropertyDetailPage() {
  const params   = useParams()
  const id       = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : ''

  const [property, setProperty] = useState<PropertyDetail | null>(null)
  const [images,   setImages]   = useState<PropertyImage[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return

    async function fetchData() {
      setLoading(true)
      setError(null)

      const [propRes, imgRes] = await Promise.all([
        supabase.from('properties').select('*').eq('id', id).single(),
        supabase.from('property_images').select('*').eq('property_id', id).order('sort_order'),
      ])

      if (propRes.error) {
        if (propRes.error.code === 'PGRST116') {
          // Not in Supabase — try mock data before showing 404
          const mock = getMockById(id)
          if (mock) {
            setProperty(mock as PropertyDetail)
            setImages(mock.property_images ?? [])
          } else {
            setNotFound(true)
          }
        } else if (isMockId(id)) {
          // DB unreachable but ID is a mock id — still show mock data
          const mock = getMockById(id)
          if (mock) {
            setProperty(mock as PropertyDetail)
            setImages(mock.property_images ?? [])
          } else {
            setError(propRes.error.message)
          }
        } else {
          setError(propRes.error.message)
        }
        setLoading(false)
        return
      }

      setProperty(propRes.data as PropertyDetail)
      setImages((imgRes.data ?? []) as PropertyImage[])
      setLoading(false)
    }

    fetchData()
  }, [id])

  // ── Derived values ──────────────────────────────────────────────────────────
  const emoji    = property ? (TYPE_EMOJI[property.property_type] ?? '🏠') : '🏠'
  const statusCfg = property
    ? (STATUS_CONFIG[property.status] ?? STATUS_CONFIG.available)
    : STATUS_CONFIG.available

  const phone    = property?.owner_phone ?? ''
  const waNumber = phone.replace(/\D/g, '')
  const waText   = encodeURIComponent(
    `Hi, I am interested in your property "${property?.title ?? ''}". Please share more details.`
  )
  const waLink   = `https://wa.me/${waNumber}?text=${waText}`

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium transition mb-6"
        >
          ← Back to Dashboard
        </Link>

        {/* Loading skeleton */}
        {loading && <Skeleton />}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-3">
            <span className="text-red-400 text-xl flex-shrink-0">⚠️</span>
            <div>
              <p className="font-bold text-red-700">Failed to load property</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-sm font-bold text-red-600 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* 404 */}
        {!loading && notFound && (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-10 text-center">
            <p className="text-6xl mb-4">🏚️</p>
            <h2 className="text-xl font-extrabold text-slate-800">Property Not Found</h2>
            <p className="text-sm text-slate-500 mt-2">
              This property may have been removed or the link is invalid.
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition"
            >
              ← Back to Dashboard
            </Link>
          </div>
        )}

        {/* Property detail */}
        {!loading && !error && !notFound && property && (
          <div className="space-y-5">

            {/* Gallery */}
            <Gallery images={images} emoji={emoji} />

            {/* Card */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">

              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-slate-50">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                      {property.property_id}
                    </span>
                    <h1 className="text-xl font-extrabold text-slate-800 mt-1.5 leading-snug">
                      {property.title}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                      📍 {property.locality}, {property.city}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`
                      flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full ring-1
                      ${statusCfg.bg} ${statusCfg.text} ${statusCfg.ring}
                    `}
                  >
                    {property.status === 'available' ? '✅' :
                     property.status === 'sold'      ? '🔑' :
                     property.status === 'hold'      ? '⏳' : '🔍'}{' '}
                    {statusCfg.label}
                  </span>
                </div>

                {/* Price */}
                <p className="text-3xl font-extrabold text-emerald-600 mt-4">
                  {formatPrice(property.price)}
                </p>

                {property.featured && (
                  <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                    ⭐ Featured Listing
                  </span>
                )}
              </div>

              {/* Detail chips */}
              <div className="p-5 sm:p-6 border-b border-slate-50">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                  Property Details
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Chip icon="🏷️" label="Type"     value={capitalize(property.property_type)} />
                  <Chip icon="📍" label="City"     value={property.city} />
                  <Chip icon="🗺️" label="Locality" value={property.locality} />

                  {property.area_sqft != null && (
                    <Chip icon="📐" label="Area"      value={`${property.area_sqft.toLocaleString()} sq yd`} />
                  )}
                  {property.bedrooms != null && (
                    <Chip icon="🛏️" label="Bedrooms"  value={`${property.bedrooms} BHK`} />
                  )}
                  {property.bathrooms != null && (
                    <Chip icon="🚿" label="Bathrooms" value={property.bathrooms} />
                  )}
                  {property.category && (
                    <Chip icon="📂" label="Category"  value={capitalize(property.category)} />
                  )}
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div className="p-5 sm:p-6 border-b border-slate-50">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                    Description
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Owner contact */}
              <div className="p-5 sm:p-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                  Owner Contact
                </h2>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-base font-extrabold flex-shrink-0">
                      {property.owner_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {property.owner_name}
                      </p>
                      {phone && (
                        <p className="text-xs text-slate-500 mt-0.5">{phone}</p>
                      )}
                    </div>
                  </div>

                  {phone && (
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <a
                        href={`tel:${phone}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition"
                      >
                        📞 Call
                      </a>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition"
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Meta footer */}
            <p className="text-center text-xs text-slate-400 pb-4">
              Listed on {new Date(property.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
