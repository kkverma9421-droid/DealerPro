import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[DealerPro] Supabase env vars missing — running in offline/demo mode.\n' +
    'Add to .env.local:\n' +
    '  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\n' +
    '  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n' +
    'App will display mock/sample data until a real DB is connected.'
  )
}

// Never throws at module load time when env vars are absent.
// All network calls will fail gracefully; consumers fall back to mock data.
export const supabase = createSupabaseClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseKey ?? 'placeholder-anon-key'
)
