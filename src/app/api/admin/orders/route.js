import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: {
        user
      },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized'
        },
        { status: 401 }
      )
    }

    // Check admin profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, is_active')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to verify admin profile',
          details: profileError.message
        },
        { status: 500 }
      )
    }

    if (
      !profile ||
      !['ADMIN', 'SUPER_ADMIN'].includes(profile.role) ||
      profile.is_active === false
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required'
        },
        { status: 403 }
      )
    }

    // Get orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        user_id,
        address_id,
        status,
        payment_method,
        payment_status,
        subtotal,
        discount_amount,
        shipping_amount,
        total_amount,
        coupon_code,
        notes,
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_postal_code,
        shipping_country,
        created_at,
        updated_at,
        profiles (
          id,
          full_name,
          phone,
          avatar_url,
          role,
          is_active
        ),
        order_items (
          id,
          product_id,
          variant_id,
          product_name,
          product_image,
          size,
          color,
          quantity,
          unit_price,
          total_price,
          created_at
        )
      `)
      .order('created_at', {
        ascending: false
      })

    if (ordersError) {
      console.error('Orders query error:', ordersError)

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch orders',
          details: ordersError.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
      count: orders?.length || 0
    })
  } catch (error) {
    console.error('Admin orders API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}