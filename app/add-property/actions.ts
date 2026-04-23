'use server'

import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient }   from '@/lib/supabase/admin'

export interface PropertyFormData {
  title:         string
  city:          string
  locality:      string
  price:         number
  property_type: string
  category:      string
  owner_name:    string
  owner_phone:   string
  status:        string
  featured:      boolean
  description:   string
  area:          number | null
  bedrooms:      number | null
  bathrooms:     number | null
  latitude:      number | null
  longitude:     number | null
}

export async function insertProperty(
  data: PropertyFormData
): Promise<{ id: string; property_id: string } | { error: string }> {
  const supabase = await createServerClient()

  const { data: idRow, error: fnErr } = await supabase.rpc('generate_property_id')
  if (fnErr) console.warn('[DealerPro] generate_property_id failed:', fnErr.message)
  const property_id = idRow ?? `DP${Date.now()}`

  const { data: row, error } = await supabase
    .from('properties')
    .insert({
      ...data,
      property_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id, property_id')
    .single()

  if (error) return { error: error.message }
  return { id: row.id, property_id: row.property_id }
}

// ─── Image upload + DB save (admin client bypasses RLS) ───────────────────────
export interface UploadResult {
  uploaded: number
  failed:   number
  errors:   string[]
}

/**
 * Receives files as FormData entries keyed `file_0`, `file_1`, …
 * Uses the service-role admin client so Storage RLS never blocks the upload.
 */
export async function uploadPropertyImagesAction(
  formData:   FormData,
  propertyId: string,
): Promise<UploadResult> {
  const admin     = createAdminClient()
  const urls:     string[] = []
  const errors:   string[] = []
  const timestamp = Date.now()  // single stamp avoids same-millisecond path collisions
  let i = 0

  while (formData.has(`file_${i}`)) {
    const file = formData.get(`file_${i}`) as File
    const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `${propertyId}/${timestamp}_${i}.${ext}`

    const { error: uploadErr } = await admin.storage
      .from('property-images')
      .upload(path, file, { cacheControl: '3600', upsert: true })

    if (uploadErr) {
      errors.push(`Image ${i + 1}: ${uploadErr.message}`)
    } else {
      const { data } = admin.storage.from('property-images').getPublicUrl(path)
      urls.push(data.publicUrl)
    }
    i++
  }

  if (urls.length > 0) {
    const rows = urls.map((image_url, idx) => ({
      property_id:  propertyId,
      image_url,
      sort_order:   idx,
      is_primary:   idx === 0,
      storage_path: image_url.split('/property-images/')[1] ?? '',
    }))

    const { error: dbErr } = await admin.from('property_images').insert(rows)
    if (dbErr) errors.push(`Could not save image records: ${dbErr.message}`)
  }

  return { uploaded: urls.length, failed: i - urls.length, errors }
}