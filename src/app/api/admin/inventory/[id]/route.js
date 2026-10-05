import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/*
==================================================
GET INVENTORY
==================================================
*/

export async function GET() {
  try {
    const supabase = await createClient()

    /*
    -----------------------------------------------
    AUTH
    -----------------------------------------------
    */

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        {
          status: 401,
        }
      )
    }

    /*
    -----------------------------------------------
    LOAD PRODUCT VARIANTS
    -----------------------------------------------
    */

    const {
      data,
      error,
    } = await supabase
      .from('product_variants')
      .select(`
        id,
        product_id,
        sku,
        size,
        color,
        stock_quantity,
        price,
        created_at,
        updated_at,
        products (
          id,
          name,
          slug,
          base_price,
          compare_price,
          status,
          is_active
        )
      `)
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Inventory GET error:',
        error
      )

      return NextResponse.json(
        {
          error:
            error.message ||
            'Unable to load inventory.',

          code:
            error.code,

          details:
            error.details,

          hint:
            error.hint,
        },
        {
          status: 500,
        }
      )
    }

    /*
    -----------------------------------------------
    REMOVE ORPHAN VARIANTS
    -----------------------------------------------

    A variant without a product should never
    appear in admin inventory.
    */

    const variants = (data || []).filter(
      (variant) =>
        variant.product_id &&
        variant.products
    )

    /*
    -----------------------------------------------
    RESPONSE
    -----------------------------------------------
    */

    return NextResponse.json(
      {
        success: true,
        variants,
      },
      {
        status: 200,
        headers: {
          'Cache-Control':
            'no-store, max-age=0',
        },
      }
    )
  } catch (error) {
    console.error(
      'Inventory API error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Unable to load inventory.',
      },
      {
        status: 500,
      }
    )
  }
}