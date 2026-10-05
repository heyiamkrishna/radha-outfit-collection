import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_STATUSES = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]

export async function PATCH(
  request,
  { params }
) {
  try {
    const supabase =
      await createClient()

    /*
    ================================================
    AUTH
    ================================================
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

    const { id } =
      await params

    if (!id) {
      return NextResponse.json(
        {
          error:
            'Order ID is required.',
        },
        {
          status: 400,
        }
      )
    }

    const body =
      await request.json()

    const status =
      String(
        body?.status || ''
      ).toUpperCase()

    /*
    ================================================
    VALIDATE STATUS
    ================================================
    */

    if (
      !ALLOWED_STATUSES.includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid order status.',
        },
        {
          status: 400,
        }
      )
    }

    /*
    ================================================
    UPDATE
    ================================================
    */

    const {
      data,
      error,
    } = await supabase
      .from('orders')
      .update({
        status,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        'id',
        id
      )
      .select(`
        id,
        order_number,
        status,
        updated_at
      `)
      .single()

    if (error) {
      console.error(
        'Order status update error:',
        error
      )

      return NextResponse.json(
        {
          error:
            error.message,
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

    return NextResponse.json({
      success: true,
      order: data,
    })
  } catch (error) {
    console.error(
      'PATCH order error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Unable to update order.',
      },
      {
        status: 500,
      }
    )
  }
}