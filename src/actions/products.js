'use server'

import { createClient } from '@/lib/supabase/server'

// ============================================
// GET ALL PRODUCTS
// ============================================
export async function getProducts({
  limit = 24,
  category = null,
  search = null,
  sort = 'newest',
  featured = false,
  trending = false,
} = {}) {
  const supabase = await createClient()

  let selectQuery = `
    id,
    name,
    slug,
    base_price,
    compare_price,
    created_at,
    product_images (
      id,
      image_url,
      is_primary,
      alt_text
    ),
    categories (
      id,
      name,
      slug
    )
  `

  // Category filter requires INNER JOIN
  if (category) {
    selectQuery = `
      id,
      name,
      slug,
      base_price,
      compare_price,
      created_at,
      product_images (
        id,
        image_url,
        is_primary,
        alt_text
      ),
      categories!inner (
        id,
        name,
        slug
      )
    `
  }

  let query = supabase
    .from('products')
    .select(selectQuery)
    .eq('is_active', true)

  // Filters
  if (category) {
    query = query.eq('categories.slug', category)
  }

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  if (featured) {
    query = query.eq('is_featured', true)
  }

  if (trending) {
    query = query.eq('is_trending', true)
  }

  // Sorting
  switch (sort) {
    case 'price-low':
      query = query.order('base_price', {
        ascending: true,
      })
      break

    case 'price-high':
      query = query.order('base_price', {
        ascending: false,
      })
      break

    case 'oldest':
      query = query.order('created_at', {
        ascending: true,
      })
      break

    case 'newest':
    default:
      query = query.order('created_at', {
        ascending: false,
      })
      break
  }

  // Limit DB response
  query = query.limit(limit)

  const { data, error } = await query

  if (error) {
    console.error(
      '❌ getProducts Supabase Error:',
      error.message
    )

    return []
  }

  // Sort primary image first
  return (data || []).map((product) => ({
    ...product,

    product_images: [...(product.product_images || [])].sort(
      (a, b) =>
        Number(b.is_primary) - Number(a.is_primary)
    ),
  }))
}

// ============================================
// GET SINGLE PRODUCT BY SLUG
// ============================================
export async function getProductBySlug(slug) {
  if (!slug) {
    console.error('❌ getProductBySlug: slug is required')
    return null
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      description,
      base_price,
      compare_price,
      created_at,

      categories (
        id,
        name,
        slug
      ),

      product_images (
        id,
        image_url,
        is_primary,
        alt_text
      ),

      product_variants (
        id,
        size,
        color,
        stock_quantity
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error(
      '❌ getProductBySlug Supabase Error:',
      error.message
    )

    return null
  }

  if (!data) {
    console.warn(
      `⚠️ Product not found for slug: ${slug}`
    )

    return null
  }

  // Primary image first
  if (Array.isArray(data.product_images)) {
    data.product_images.sort(
      (a, b) =>
        Number(b.is_primary) - Number(a.is_primary)
    )
  }

  // Ensure variants is always an array
  if (!Array.isArray(data.product_variants)) {
    data.product_variants = []
  }

  return data
}