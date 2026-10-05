import { createBrowserClient } from '@supabase/ssr'

let supabaseClient

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is missing from .env.local'
    )
  }

  if (!supabaseKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing from .env.local'
    )
  }

  supabaseClient = createBrowserClient(
    supabaseUrl,
    supabaseKey
  )

  return supabaseClient
}