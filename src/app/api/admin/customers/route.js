import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

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

    /*
    ================================================
    GET CUSTOMER PROFILES
    ================================================
    */

    const {
      data: profiles,
      error: profileError,
    } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        phone,
        avatar_url,
        role,
        is_active,
        created_at,
        updated_at
      `)
      .eq('role', 'CUSTOMER')
      .order('created_at', {
        ascending: false,
      })

    if (profileError) {
      console.error(
        'Customer profiles error:',
        profileError
      )

      return NextResponse.json(
        {
          error: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          code: profileError.code,
        },
        {
          status: 500,
        }
      )
    }

    /*
    ================================================
    GET ORDERS
    ================================================
    */

    const {
      data: orders,
      error: orderError,
    } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        order_number,
        total_amount,
        status,
        created_at
      `)
      .order('created_at', {
        ascending: false,
      })

    if (orderError) {
      console.error(
        'Customer orders error:',
        orderError
      )

      return NextResponse.json(
        {
          error: orderError.message,
          details: orderError.details,
          hint: orderError.hint,
          code: orderError.code,
        },
        {
          status: 500,
        }
      )
    }

    /*
    ================================================
    CREATE ORDER STATS
    ================================================
    */

    const orderStats = new Map()

    for (const order of orders || []) {
      if (!order.user_id) {
        continue
      }

      const existing =
        orderStats.get(order.user_id) || {
          order_count: 0,
          total_spent: 0,
        }

      existing.order_count += 1

      existing.total_spent += Number(
        order.total_amount || 0
      )

      orderStats.set(
        order.user_id,
        existing
      )
    }

    /*
    ================================================
    MERGE
    ================================================
    */

    const customers = (
      profiles || []
    ).map((profile) => {
      const stats =
        orderStats.get(profile.id) || {
          order_count: 0,
          total_spent: 0,
        }

      return {
        ...profile,

        /*
         * Supabase Auth email is not stored
         * in your profiles table.
         *
         * We leave it empty here rather than
         * inventing email data.
         */
        email: null,

        order_count:
          stats.order_count,

        total_spent:
          stats.total_spent,
      }
    })

    return NextResponse.json({
      customers,
    })
  } catch (error) {
    console.error(
      'GET /api/admin/customers error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Unable to load customers.',
      },
      {
        status: 500,
      }
    )
  }
}