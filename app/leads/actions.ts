'use server'

import { createServerClient } from '@/lib/supabase/server'

export interface LeadFormData {
  client_name:        string
  client_phone:       string
  client_email:       string
  budget_min:         number | null
  budget_max:         number | null
  preferred_location: string
  preferred_type:     string
  property_interest:  string
  stage:              string
  source:             string
  priority:           string
  assigned_to:        string
  follow_up_date:     string
  notes:              string
}

export async function insertLead(
  data: LeadFormData
): Promise<{ id: string; lead_number: string } | { error: string }> {
  const supabase = await createServerClient()

  const { count } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
  const nextNum   = (count ?? 0) + 1
  const lead_number = `DPL-${String(nextNum).padStart(3, '0')}`

  const now = new Date().toISOString()

  const { data: row, error } = await supabase
    .from('leads')
    .insert({
      ...data,
      lead_number,
      budget_min:    data.budget_min  || null,
      budget_max:    data.budget_max  || null,
      created_at:    now,
      updated_at:    now,
    })
    .select('id, lead_number')
    .single()

  if (error) return { error: error.message }
  return { id: row.id, lead_number: row.lead_number }
}

export async function updateLead(
  id:   string,
  data: Partial<LeadFormData>
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('leads')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateLeadStage(
  id:    string,
  stage: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createServerClient()

  const updates: Record<string, string> = {
    stage,
    updated_at: new Date().toISOString(),
  }

  if (stage !== 'new_inquiry') {
    updates.last_contacted = new Date().toISOString()
  }

  const { error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteLead(
  id: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}
