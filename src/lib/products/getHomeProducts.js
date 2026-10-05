import { createClient } from '@/lib/supabase/server'

export async function getHomeProducts() {
  const supabase = await createClient()

  const select = `
    id,
    name,
    slug,
    base_price,
    compare_price,
    badge,
    category_id,
    product_images (
      image_url,
      sort_order
    )
  `

  const [trendingResult, menResult, womenResult, kidsResult] =
    await Promise.all([
      supabase
        .from('products')
        .select(select)
        .eq('status', 'ACTIVE')
        .eq('badge', 'TRENDING')
        .order('created_at', { ascending: false })
        .limit(4),

      supabase
        .from('products')
        .select(select)
        .eq('status', 'ACTIVE')
        .eq('gender', 'MEN')
        .order('created_at', { ascending: false })
        .limit(4),

      supabase
        .from('products')
        .select(select)
        .eq('status', 'ACTIVE')
        .eq('gender', 'WOMEN')
        .order('created_at', { ascending: false })
        .limit(4),

      supabase
        .from('products')
        .select(select)
        .eq('status', 'ACTIVE')
        .eq('gender', 'KIDS')
        .order('created_at', { ascending: false })
        .limit(4),
    ])

  if (trendingResult.error) {
    console.error('Trending products error:', trendingResult.error)
  }

  if (menResult.error) {
    console.error('Men products error:', menResult.error)
  }

  if (womenResult.error) {
    console.error('Women products error:', womenResult.error)
  }

  if (kidsResult.error) {
    console.error('Kids products error:', kidsResult.error)
  }

  const sortImages = (products) =>
    (products || []).map((product) => ({
      ...product,
      product_images: [...(product.product_images || [])].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
      ),
    }))

  return {
    trending: sortImages(trendingResult.data),
    men: sortImages(menResult.data),
    women: sortImages(womenResult.data),
    kids: sortImages(kidsResult.data),
  }
}