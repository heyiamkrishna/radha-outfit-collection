'use server'

import { createClient } from '@/lib/supabase/server'

export async function getHeroSlides() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  console.log('HERO DATA:', data)
  console.log('HERO ERROR:', error)

  return data || []
}