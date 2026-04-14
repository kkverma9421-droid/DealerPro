'use server'

import { createServerClient } from '@/lib/supabase/server'

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
  area_sqft:     number | null
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