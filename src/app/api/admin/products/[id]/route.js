import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/*
==================================================
UPDATE PRODUCT
==================================================
*/

export async function PATCH(
  request,
  { params }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          error: 'Product ID is required.',
        },
        { status: 400 }
      )
    }

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
        {
          error:
            'Product name is required.',
        },
        { status: 400 }
      )
    }

    if (!slug?.trim()) {
      return NextResponse.json(
        {
          error:
            'Product slug is required.',
        },
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
        {
          error:
            'Valid product price is required.',
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // -----------------------------
    // Check duplicate slug
    // -----------------------------

    const {
      data: duplicate,
      error: slugError,
    } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug.trim())
      .neq('id', id)
      .maybeSingle()

    if (slugError) {
      console.error(
        'Slug check error:',
        slugError
      )

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

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            'Another product already uses this slug.',
        },
        { status: 409 }
      )
    }

    // -----------------------------
    // Update data
    // -----------------------------

    const updateData = {
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
        Boolean(is_active),

      is_featured:
        Boolean(is_featured),

      is_trending:
        Boolean(is_trending),

      badge:
        badge?.trim() || null,
    }

    console.log(
      'Updating product:',
      id,
      updateData
    )

    // -----------------------------
    // Update
    // -----------------------------

    const {
      data: product,
      error,
    } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select('id')
      .single()

    if (error) {
      console.error(
        'Supabase product update error:',
        error
      )

      return NextResponse.json(
        {
          error:
            error.message ||
            'Failed to update product.',

          details: error.details,

          hint: error.hint,

          code: error.code,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,

      product,
    })
  } catch (error) {
    console.error(
      'PATCH /api/admin/products/[id] error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error.message ||
          'Unable to update product.',
      },
      {
        status: 500,
      }
    )
  }
}

/*
==================================================
DELETE PRODUCT
==================================================
*/

export async function DELETE(
  request,
  { params }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          error:
            'Product ID is required.',
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // -----------------------------
    // Delete product images
    // -----------------------------

    const {
      error: imageError,
    } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', id)

    if (imageError) {
      console.error(
        'Product image delete error:',
        imageError
      )

      return NextResponse.json(
        {
          error:
            imageError.message,

          details:
            imageError.details,

          hint:
            imageError.hint,

          code:
            imageError.code,
        },
        {
          status: 400,
        }
      )
    }

    // -----------------------------
    // Delete product
    // -----------------------------

    const {
      error,
    } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(
        'Product delete error:',
        error
      )

      return NextResponse.json(
        {
          error:
            error.message ||
            'Failed to delete product.',

          details:
            error.details,

          hint:
            error.hint,

          code:
            error.code,
        },
        {
          status: 400,
        }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(
      'DELETE /api/admin/products/[id] error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error.message ||
          'Unable to delete product.',
      },
      {
        status: 500,
      }
    )
  }
}