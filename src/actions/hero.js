'use server'

import { createClient } from '@/lib/supabase/server'

export async function getActiveHeroSlides() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    // This logs the real error to your VS Code terminal instead of an empty {} in the browser
    console.error("Hero Slider Error Details:", JSON.stringify(error, null, 2))
    return []
  }

  return data || []
}