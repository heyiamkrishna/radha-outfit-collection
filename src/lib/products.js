import { createClient } from '@/lib/supabase/server'

/**
 * Get products for the shop page.
 *
 * Supported filters:
 * - search
 * - gender
 * - trending
 */
export async function getShopProducts({
  search = '',
  gender = null,
  trending = false,
} = {}) {
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      description,
      base_price,
      compare_price,
      gender,
      badge,
      is_active,
      created_at,
      product_images (
        id,
        image_url,
        alt_text,
        sort_order
      )
    `)
    .eq('is_active', true)

  /*
   * SEARCH
   */
  if (search.trim()) {
    query = query.ilike(
      'name',
      `%${search.trim()}%`
    )
  }

  /*
   * GENDER
   */
  if (gender) {
    query = query.eq(
      'gender',
      gender.toUpperCase()
    )
  }

  /*
   * TRENDING
   */
  if (trending) {
    query = query.eq(
      'badge',
      'TRENDING'
    )
  }

  /*
   * NEWEST PRODUCTS FIRST
   */
  query = query.order(
    'created_at',
    {
      ascending: false,
    }
  )

  const {
    data,
    error,
  } = await query

  if (error) {
    console.error(
      'Shop products error:',
      error
    )

    return []
  }

  /*
   * Sort images so image 0 is actually
   * the first image.
   */
  const products = (data || []).map(
    (product) => ({
      ...product,

      product_images: (
        product.product_images || []
      ).sort(
        (a, b) =>
          (a.sort_order ?? 0) -
          (b.sort_order ?? 0)
      ),
    })
  )

  return products
}