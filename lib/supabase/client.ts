// lib/supabase/client.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[DealerPro] Missing Supabase env vars.\n' +
    'Add to .env.local:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key'
  )
}

// Named export — used everywhere as: import { supabase } from '@/lib/supabase/client'
export const supabase = createSupabaseClient(supabaseUrl, supabaseKey)