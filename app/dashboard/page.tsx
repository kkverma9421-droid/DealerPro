'use client'

import { useState, useEffect, useRef, useCallback, type ChangeEvent } from 'react'
import { useRouter }          from 'next/navigation'
import Link                   from 'next/link'
import { insertProperty }     from '../add-property/actions'
import { uploadPropertyImage, savePropertyImages } from '@/lib/supabase/storage'
import { LocationPicker, type LocationValue } from '@/components/LocationPicker'
import { supabase }           from '@/lib/supabase/client'
import PropertyCard           from '@/components/PropertyCard'
import { mockProperties }     from '@/data/mockProperties'
import type { Property, PropertyStatus } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────
const PROPERTY_TYPES = [
  'apartment', 'villa', 'plot', 'shop', 'office',
  'warehouse', 'builder_floor', 'sco', 'penthouse', 'other',
]
const CATEGORIES = ['residential', 'commercial', 'industrial', 'religious_trust']
const STATUSES   = ['available', 'hold', 'requirement']

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(v: string): string {
  const n = Number(v)
  if (!n || isNaN(n)) return ''
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

// ─── UI pieces ────────────────────────────────────────────────────────────────
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
      <Link href="/dashboard"
        className="text-sm text-slate-500 hover:text-slate-700 font-medium transition">
        ← Dashboard
      </Link>
    </nav>
  )
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  )
}

const inputCls  = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder:text-slate-300 transition"
const selectCls = inputCls

function StepBar({ current }: { current: number }) {
  const steps = ['Property Info', 'Details & Images', 'Review']
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${i < current   ? 'bg-emerald-500 text-white' :
                i === current ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' :
                                'bg-slate-100 text-slate-400'}`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-semibold ${i <= current ? 'text-emerald-600' : 'text-slate-400'}`}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px mx-3 ${i < current ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function ImagePreview({ files, onRemove }: { files: File[]; onRemove: (i: number) => void }) {
  if (!files.length) return null
  return (
    <div className="flex flex-wrap gap-3 mt-3">
      {files.map((file, i) => (
        <div key={i} className="relative group">
          <img
            src={URL.createObjectURL(file)}
            alt={`Preview ${i + 1}`}
            className="w-24 h-24 object-cover rounded-xl border border-slate-200"
          />
          {i === 0 && (
            <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
              Primary
            </span>
          )}
          <button type="button" onClick={() => onRemove(i)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold hidden group-hover:flex items-center justify-center">
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Property Listings Section ────────────────────────────────────────────────
function PropertyListings() {
  const router = useRouter()
  const [properties,  setProperties]  = useState<Property[]>([])
  const [propLoading, setPropLoading] = useState(true)
  const [isMock,      setIsMock]      = useState(false)

  useEffect(() => {
    async function fetchProperties() {
      const { data, error } = await supabase
        .from('properties')
        .select('*, property_images(*)')
        .order('created_at', { ascending: false })
        .limit(12)

      if (!error && data && data.length > 0) {
        setProperties(data as Property[])
        setIsMock(false)
      } else {
        // Supabase returned empty or errored — fall back to mock data
        setProperties(mockProperties as Property[])
        setIsMock(true)
      }
      setPropLoading(false)
    }
    fetchProperties()
  }, [])

  function handleStatusChange(id: string, status: PropertyStatus) {
    if (isMock) return   // no-op for mock data
    supabase
      .from('properties')
      .update({ status })
      .eq('id', id)
      .then(() => {
        setProperties(prev =>
          prev.map(p => p.id === id ? { ...p, status } : p)
        )
      })
  }

  if (propLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-700">Recent Properties</h2>
        {isMock && (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            Sample data — no live listings yet
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {properties.map(p => (
          <PropertyCard
            key={p.id}
            property={p}
            onStatusChange={isMock ? undefined : handleStatusChange}
            onClick={() => router.push(`/property/${p.id}`)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AddPropertyPage() {
  const router = useRouter()

  const [step,    setStep]    = useState(0)
  const [files,   setFiles]   = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Location state — managed by LocationPicker
  const [location, setLocation] = useState<LocationValue>({ city: 'Mathura', locality: '' })

  const [form, setForm] = useState({
    title:         '',
    price:         '',
    property_type: 'plot',
    category:      'residential',
    owner_name:    '',
    owner_phone:   '',
    status:        'available',
    featured:      false,
    description:   '',
    area_sqft:     '',
    bedrooms:      '',
    bathrooms:     '',
    latitude:      '',
    longitude:     '',
  })

  const set = useCallback(
    (key: keyof typeof form) =>
      (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value })),
    []
  )

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    setFiles(prev => [...prev, ...Array.from(e.target.files ?? [])].slice(0, 8))
    e.target.value = ''
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  function validateStep0(): string | null {
    if (!form.title.trim())      return 'Property title is required'
    if (!location.city)          return 'City is required'
    if (!location.locality)      return 'Locality is required'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      return 'A valid price is required'
    if (!form.owner_name.trim()) return 'Owner name is required'
    return null
  }

  function handleNext() {
    if (step === 0) {
      const err = validateStep0()
      if (err) { setError(err); return }
    }
    setError(null)
    setStep(s => s + 1)
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const result = await insertProperty({
      title:         form.title.trim(),
      city:          location.city,
      locality:      location.locality,
      price:         Number(form.price),
      property_type: form.property_type,
      category:      form.category,
      owner_name:    form.owner_name.trim(),
      owner_phone:   form.owner_phone.trim(),
      status:        form.status,
      featured:      form.featured,
      description:   form.description.trim(),
      area_sqft:     form.area_sqft  ? Number(form.area_sqft)  : null,
      bedrooms:      form.bedrooms   ? Number(form.bedrooms)   : null,
      bathrooms:     form.bathrooms  ? Number(form.bathrooms)  : null,
      latitude:      form.latitude   ? Number(form.latitude)   : null,
      longitude:     form.longitude  ? Number(form.longitude)  : null,
    })

    if ('error' in result) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (files.length > 0) {
      const urls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const url = await uploadPropertyImage(files[i], result.id, i)
        if (url) urls.push(url)
      }
      await savePropertyImages(result.id, urls)
    }

    setLoading(false)
    router.push(`/property/${result.id}`)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* ── Property listings with mock fallback ── */}
        <PropertyListings />

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-800">Add New Property</h1>
          <p className="text-slate-500 text-sm mt-1">
            Listing properties in Mathura, Vrindavan &amp; Brij region.
          </p>
        </div>

        <StepBar current={step} />

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 md:p-8">

          {/* ── STEP 0: Core Info ── */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-3">
                Property Information
              </h2>

              <Field label="Property Title" required>
                <input className={inputCls}
                  placeholder="e.g. 500 Sq Yard Plot near Prem Mandir Vrindavan"
                  value={form.title} onChange={set('title')} />
              </Field>

              {/* ── Location Picker — city + locality with autocomplete ── */}
              <LocationPicker
                value={location}
                onChange={setLocation}
                required
              />

              <Field label="Price (₹)" required hint="e.g. 5500000 = ₹55 L, 10000000 = ₹1 Cr">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input type="number" className={`${inputCls} pl-7`}
                    placeholder="5500000"
                    value={form.price} onChange={set('price')} min={0} />
                </div>
                {form.price && !isNaN(Number(form.price)) && Number(form.price) > 0 && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    {formatPrice(form.price)}
                  </p>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Property Type" required>
                  <select className={selectCls} value={form.property_type} onChange={set('property_type')}>
                    {PROPERTY_TYPES.map(t => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Category">
                  <select className={selectCls} value={form.category} onChange={set('category')}>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, ' ').replace(/\b\w/g, x => x.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Status">
                  <select className={selectCls} value={form.status} onChange={set('status')}>
                    {STATUSES.map(s => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Featured Listing">
                  <div className="flex items-center gap-3 pt-2">
                    <div onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
                      className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${
                        form.featured ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                        form.featured ? 'left-5' : 'left-1'
                      }`} />
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                      {form.featured ? '⭐ Yes' : 'No'}
                    </span>
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Owner Name" required>
                  <input className={inputCls} placeholder="Full name"
                    value={form.owner_name} onChange={set('owner_name')} />
                </Field>
                <Field label="Owner Phone">
                  <input className={inputCls} placeholder="+91-98765-43210" type="tel"
                    value={form.owner_phone} onChange={set('owner_phone')} />
                </Field>
              </div>
            </div>
          )}

          {/* ── STEP 1: Details + Images ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-3">
                Additional Details &amp; Images
              </h2>

              <Field label="Description">
                <textarea className={`${inputCls} resize-none`} rows={4}
                  placeholder="Describe the property — area, surroundings, amenities, nearby landmarks…"
                  value={form.description} onChange={set('description')} />
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Area (sq yd / ft)">
                  <input type="number" className={inputCls} placeholder="500"
                    value={form.area_sqft} onChange={set('area_sqft')} min={0} />
                </Field>
                <Field label="Bedrooms">
                  <input type="number" className={inputCls} placeholder="3"
                    value={form.bedrooms} onChange={set('bedrooms')} min={0} max={20} />
                </Field>
                <Field label="Bathrooms">
                  <input type="number" className={inputCls} placeholder="2"
                    value={form.bathrooms} onChange={set('bathrooms')} min={0} max={20} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Latitude" hint="Optional — for map pin">
                  <input type="number" step="any" className={inputCls} placeholder="27.5706"
                    value={form.latitude} onChange={set('latitude')} />
                </Field>
                <Field label="Longitude" hint="Optional — for map pin">
                  <input type="number" step="any" className={inputCls} placeholder="77.6716"
                    value={form.longitude} onChange={set('longitude')} />
                </Field>
              </div>

              <Field label="Property Images" hint="First image becomes primary. Max 8 images.">
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                  onClick={() => fileRef.current?.click()}>
                  <p className="text-3xl mb-2">📸</p>
                  <p className="text-sm font-semibold text-slate-600">Click to upload images</p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP — max 8 files</p>
                  <input ref={fileRef} type="file" accept="image/*" multiple
                    className="hidden" onChange={handleFiles} />
                </div>
                <ImagePreview files={files} onRemove={removeFile} />
              </Field>
            </div>
          )}

          {/* ── STEP 2: Review ── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-3">
                Review &amp; Submit
              </h2>

              <div className="bg-slate-50 rounded-xl p-5 space-y-3">
                {[
                  { label: 'Title',       value: form.title },
                  { label: 'City',        value: location.city },
                  { label: 'Locality',    value: location.locality || '—' },
                  { label: 'Price',       value: formatPrice(form.price) || '—' },
                  { label: 'Type',        value: form.property_type.replace(/_/g, ' ') },
                  { label: 'Category',    value: form.category.replace(/_/g, ' ') },
                  { label: 'Status',      value: form.status },
                  { label: 'Owner',       value: form.owner_name },
                  { label: 'Phone',       value: form.owner_phone || '—' },
                  { label: 'Area',        value: form.area_sqft ? `${form.area_sqft} sq yd` : '—' },
                  { label: 'Bedrooms',    value: form.bedrooms  || '—' },
                  { label: 'Featured',    value: form.featured  ? '⭐ Yes' : 'No' },
                  { label: 'Images',      value: `${files.length} selected` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide w-24 flex-shrink-0">
                      {label}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 text-right capitalize">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {files.map((f, i) => (
                    <img key={i} src={URL.createObjectURL(f)} alt=""
                      className={`w-16 h-16 object-cover rounded-xl border-2 ${
                        i === 0 ? 'border-emerald-400' : 'border-slate-200'
                      }`} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="mt-5 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3.5">
              <span className="text-red-400 flex-shrink-0 mt-0.5">⚠️</span>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            {step > 0 ? (
              <button type="button" onClick={() => { setError(null); setStep(s => s - 1) }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition">
                ← Back
              </button>
            ) : (
              <Link href="/dashboard"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition">
                Cancel
              </Link>
            )}

            {step < 2 ? (
              <button type="button" onClick={handleNext}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition">
                Next →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition flex items-center gap-2">
                {loading && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {loading ? 'Submitting…' : '✅ Submit Property'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}