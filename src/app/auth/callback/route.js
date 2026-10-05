import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  // Parse the URL to get the secure code and the 'next' route
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successfully authenticated, send them to the previous page!
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If something goes wrong, send them back to login
  return NextResponse.redirect(`${origin}/auth/login?error=Authentication_Failed`)
}