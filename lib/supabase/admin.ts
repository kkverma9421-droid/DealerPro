import { createClient } from '@supabase/supabase-js'

/**
 * Server-side admin client that uses the service_role key.
 * This bypasses Row Level Security — only call from Server Actions / Route Handlers.
 * Never import this in client components or expose the key to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      '[DealerPro] SUPABASE_SERVICE_ROLE_KEY is not set in .env.local.\n' +
      'Add: SUPABASE_SERVICE_ROLE_KEY=your-service-role-key'
    )
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  })
}
