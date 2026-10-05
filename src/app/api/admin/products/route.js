import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  try {
    const body = await request.json()

    const {
      name,
      slug,
      description,
      category_id,
      base_price,
      compare_price,
      status,
      is_active,
      is_featured,
      is_trending,
      badge,
    } = body

    // -----------------------------
    // Validation
    // -----------------------------

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Product name is required.' },
        { status: 400 }
      )
    }

    if (!slug?.trim()) {
      return NextResponse.json(
        { error: 'Product slug is required.' },
        { status: 400 }
      )
    }

    if (
      base_price === undefined ||
      base_price === null ||
      base_price === '' ||
      Number.isNaN(Number(base_price))
    ) {
      return NextResponse.json(
        { error: 'Valid product price is required.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // -----------------------------
    // Check duplicate slug
    // -----------------------------

    const { data: existingProduct, error: slugError } =
      await supabase
        .from('products')
        .select('id')
        .eq('slug', slug.trim())
        .maybeSingle()

    if (slugError) {
      console.error('Slug check error:', slugError)

      return NextResponse.json(
        {
          error: slugError.message,
          details: slugError.details,
          hint: slugError.hint,
          code: slugError.code,
        },
        { status: 400 }
      )
    }

    if (existingProduct) {
      return NextResponse.json(
        {
          error:
            'A product with this slug already exists.',
        },
        { status: 409 }
      )
    }

    // -----------------------------
    // Product data
    // -----------------------------

    const productData = {
      name: name.trim(),

      slug: slug.trim(),

      description:
        description?.trim() || null,

      category_id:
        category_id || null,

      base_price:
        Number(base_price),

      compare_price:
        compare_price === '' ||
        compare_price === undefined ||
        compare_price === null
          ? null
          : Number(compare_price),

      status:
        status || 'ACTIVE',

      is_active:
        is_active !== false,

      is_featured:
        Boolean(is_featured),

      is_trending:
        Boolean(is_trending),

      badge:
        badge?.trim() || null,
    }

    console.log(
      'Creating product:',
      productData
    )

    // -----------------------------
    // Insert
    // -----------------------------

    const {
      data: product,
      error,
    } = await supabase
      .from('products')
      .insert(productData)
      .select('id')
      .single()

    if (error) {
      console.error(
        'Supabase product insert error:',
        error
      )

      return NextResponse.json(
        {
          error:
            error.message ||
            'Failed to create product.',

          details: error.details,

          hint: error.hint,

          code: error.code,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,

        product,
      },
      {
        status: 201,
      }
    )
  } catch (error) {
    console.error(
      'POST /api/admin/products error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error.message ||
          'Unable to create product.',
      },
      {
        status: 500,
      }
    )
  }
}