import { supabase } from '@/lib/supabase/client'

export async function uploadPropertyImage(
  file: File,
  propertyId: string,
  index: number
): Promise<string | null> {
  const ext  = file.name.split('.').pop() ?? 'jpg'
  const path = `${propertyId}/${Date.now()}_${index}.${ext}`

  const { error } = await supabase.storage
    .from('property-images')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) {
    console.error('[Storage] Upload failed:', error.message)
    return null
  }

  const { data } = supabase.storage
    .from('property-images')
    .getPublicUrl(path)

  return data.publicUrl
}

export async function savePropertyImages(
  propertyId: string,
  urls: string[]
): Promise<void> {
  if (!urls.length) return

  const rows = urls.map((image_url, i) => ({
    property_id:  propertyId,
    image_url,
    sort_order:   i,
    is_primary:   i === 0,
    storage_path: image_url.split('/property-images/')[1] ?? '',
  }))

  const { error } = await supabase.from('property_images').insert(rows)
  if (error) console.error('[DB] property_images insert failed:', error.message)
}