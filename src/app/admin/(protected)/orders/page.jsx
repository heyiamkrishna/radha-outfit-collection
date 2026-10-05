import Link from 'next/link'
import {
  ArrowRight,
  Package,
  Clock3,
  Truck,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  IndianRupee,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

function formatDate(value) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getStatusStyle(status) {
  const value = String(status || '').toLowerCase()

  if (value === 'delivered') {
    return {
      icon: CheckCircle2,
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-100',
    }
  }

  if (
    value === 'cancelled' ||
    value === 'canceled'
  ) {
    return {
      icon: XCircle,
      className:
        'bg-red-50 text-red-700 border-red-100',
    }
  }

  if (
    value === 'dispatched' ||
    value === 'shipped'
  ) {
    return {
      icon: Truck,
      className:
        'bg-blue-50 text-blue-700 border-blue-100',
    }
  }

  if (
    value === 'processing' ||
    value === 'confirmed'
  ) {
    return {
      icon: Package,
      className:
        'bg-amber-50 text-amber-700 border-amber-100',
    }
  }

  return {
    icon: Clock3,
    className:
      'bg-neutral-100 text-neutral-700 border-neutral-200',
  }
}

async function getOrders() {
  const supabase = await createClient()

  /*
   * IMPORTANT:
   * Keep this query conservative.
   * Do not request columns that previously caused
   * schema errors.
   */

  const {
    data,
    error,
  } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', {
      ascending: false,
    })

  if (error) {
    console.error(
      'ADMIN ORDERS ERROR:',
      JSON.stringify(error, null, 2)
    )

    return {
      orders: [],
      error: error.message,
    }
  }

  return {
    orders: data || [],
    error: null,
  }
}

export default async function OrdersPage() {
  const {
    orders,
    error,
  } = await getOrders()

  const totalOrders = orders.length

  const pendingOrders = orders.filter(
    (order) =>
      ['placed', 'pending'].includes(
        String(order.status || '').toLowerCase()
      )
  ).length

  const processingOrders = orders.filter(
    (order) =>
      String(order.status || '').toLowerCase() ===
      'processing'
  ).length

  const deliveredOrders = orders.filter(
    (order) =>
      String(order.status || '').toLowerCase() ===
      'delivered'
  ).length

  const totalRevenue = orders.reduce(
    (sum, order) =>
      sum +
      Number(
        order.total_amount ??
          order.total ??
          order.grand_total ??
          0
      ),
    0
  )

  return (
    <main className="min-h-screen bg-[#f7f8f6] px-4 py-6 text-neutral-950 sm:px-6 lg:px-8">

      {/* HEADER */}

      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
              Store Management
            </p>

            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              Orders
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              Manage customer orders, payment information,
              fulfillment status and order details.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 shadow-sm">
            <ShoppingBag
              size={16}
              className="text-neutral-500"
            />

            <span className="text-xs font-bold">
              {totalOrders} orders
            </span>
          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-sm font-bold text-red-700">
              Unable to load orders
            </p>

            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* STATS */}

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-5">

          <StatCard
            label="Total Orders"
            value={totalOrders}
            icon={ShoppingBag}
          />

          <StatCard
            label="Pending"
            value={pendingOrders}
            icon={Clock3}
          />

          <StatCard
            label="Processing"
            value={processingOrders}
            icon={Package}
          />

          <StatCard
            label="Delivered"
            value={deliveredOrders}
            icon={CheckCircle2}
          />

          <StatCard
            label="Revenue"
            value={formatCurrency(totalRevenue)}
            icon={IndianRupee}
            wide
          />

        </section>

        {/* ORDERS */}

        <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">

          <div className="border-b border-neutral-100 px-5 py-5 md:px-7">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-black">
                  Recent Orders
                </h2>

                <p className="mt-1 text-xs text-neutral-400">
                  Latest customer purchases
                </p>
              </div>

              <div className="hidden rounded-full bg-neutral-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-500 sm:block">
                Live data
              </div>

            </div>

          </div>

          {orders.length === 0 ? (
            <EmptyOrders />
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div className="hidden overflow-x-auto md:block">

                <table className="w-full">

                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50/70 text-left">
                      <th className="px-7 py-4 text-[10px] font-black uppercase tracking-wider text-neutral-400">
                        Order
                      </th>

                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-neutral-400">
                        Customer
                      </th>

                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-neutral-400">
                        Status
                      </th>

                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-neutral-400">
                        Total
                      </th>

                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-neutral-400">
                        Date
                      </th>

                      <th className="px-7 py-4" />
                    </tr>
                  </thead>

                  <tbody>

                    {orders.map((order) => (
                      <OrderRow
                        key={order.id}
                        order={order}
                      />
                    ))}

                  </tbody>

                </table>

              </div>

              {/* MOBILE CARDS */}

              <div className="divide-y divide-neutral-100 md:hidden">

                {orders.map((order) => (
                  <MobileOrderCard
                    key={order.id}
                    order={order}
                  />
                ))}

              </div>
            </>
          )}

        </section>

      </div>
    </main>
  )
}

/* =========================
   STAT CARD
========================= */

function StatCard({
  label,
  value,
  icon: Icon,
  wide,
}) {
  return (
    <div
      className={`rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md ${
        wide ? 'col-span-2 lg:col-span-1' : ''
      }`}
    >

      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
        <Icon
          size={17}
          className="text-neutral-700"
        />
      </div>

      <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xl font-black">
        {value}
      </p>

    </div>
  )
}

/* =========================
   DESKTOP ROW
========================= */

function OrderRow({ order }) {
  const status = getStatusStyle(
    order.status
  )

  const StatusIcon = status.icon

  const total = Number(
    order.total_amount ??
      order.total ??
      order.grand_total ??
      0
  )

  const customer =
    order.customer_name ||
    order.name ||
    order.full_name ||
    order.email ||
    'Guest Customer'

  return (
    <tr className="group border-b border-neutral-100 last:border-0 transition hover:bg-neutral-50/70">

      <td className="px-7 py-5">

        <div>
          <p className="font-mono text-xs font-black">
            #{String(order.id).slice(0, 8)}
          </p>

          <p className="mt-1 text-[10px] text-neutral-400">
            {order.payment_method ||
              'Payment'}
          </p>
        </div>

      </td>

      <td className="px-5 py-5">

        <div>
          <p className="text-sm font-bold">
            {customer}
          </p>

          {order.email && (
            <p className="mt-1 max-w-[220px] truncate text-xs text-neutral-400">
              {order.email}
            </p>
          )}
        </div>

      </td>

      <td className="px-5 py-5">

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${status.className}`}
        >
          <StatusIcon size={12} />

          {order.status || 'Placed'}
        </span>

      </td>

      <td className="px-5 py-5">

        <p className="text-sm font-black">
          {formatCurrency(total)}
        </p>

      </td>

      <td className="px-5 py-5">

        <p className="text-xs font-medium text-neutral-500">
          {formatDate(order.created_at)}
        </p>

      </td>

      <td className="px-7 py-5 text-right">

        <Link
          href={`/admin/orders/${order.id}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white transition hover:border-black hover:bg-black hover:text-white"
        >
          <ArrowRight size={15} />
        </Link>

      </td>

    </tr>
  )
}

/* =========================
   MOBILE CARD
========================= */

function MobileOrderCard({ order }) {
  const status = getStatusStyle(
    order.status
  )

  const StatusIcon = status.icon

  const total = Number(
    order.total_amount ??
      order.total ??
      order.grand_total ??
      0
  )

  const customer =
    order.customer_name ||
    order.name ||
    order.full_name ||
    order.email ||
    'Guest Customer'

  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="block p-5 transition active:bg-neutral-50"
    >

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="font-mono text-xs font-black">
            #{String(order.id).slice(0, 8)}
          </p>

          <p className="mt-2 truncate text-sm font-bold">
            {customer}
          </p>

          <p className="mt-1 text-[11px] text-neutral-400">
            {formatDate(order.created_at)}
          </p>

        </div>

        <ArrowRight
          size={17}
          className="mt-1 shrink-0 text-neutral-400"
        />

      </div>

      <div className="mt-5 flex items-center justify-between">

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-wider ${status.className}`}
        >
          <StatusIcon size={11} />

          {order.status || 'Placed'}
        </span>

        <span className="text-sm font-black">
          {formatCurrency(total)}
        </span>

      </div>

    </Link>
  )
}

/* =========================
   EMPTY
========================= */

function EmptyOrders() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
        <ShoppingBag
          size={25}
          className="text-neutral-400"
        />
      </div>

      <h3 className="mt-5 text-lg font-black">
        No orders yet
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-400">
        Customer orders will appear here automatically
        when they are created.
      </p>

    </div>
  )
}