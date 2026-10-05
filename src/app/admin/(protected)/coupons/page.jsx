import Link from 'next/link'
import {
  TicketPercent,
  Plus,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Trash2,
  Copy,
  CalendarDays,
  Percent,
  IndianRupee,
  ArrowUpRight,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function CouponsPage({ searchParams }) {
  const supabase = await createClient()

  const params = await searchParams

  const search =
    typeof params?.search === 'string'
      ? params.search.trim()
      : ''

  const status =
    typeof params?.status === 'string'
      ? params.status
      : 'all'

  // =========================================================
  // FETCH COUPONS
  // =========================================================

  let couponQuery = supabase
    .from('coupons')
    .select('*')
    .order('created_at', {
      ascending: false,
    })

  if (search) {
    couponQuery = couponQuery.ilike(
      'code',
      `%${search}%`
    )
  }

  const {
    data: coupons,
    error: couponError,
  } = await couponQuery

  if (couponError) {
    console.error(
      'ADMIN COUPONS ERROR:',
      JSON.stringify(couponError, null, 2)
    )
  }

  const safeCoupons = Array.isArray(coupons)
    ? coupons
    : []

  // =========================================================
  // FIND POSSIBLE USAGE TABLE
  // =========================================================
  //
  // Your project previously mentioned coupon_usages.
  //
  // We use it if available.
  //
  // If the table doesn't exist, the page still works and
  // simply shows 0 usage.
  // =========================================================

  let usageRows = []

  const {
    data: usageData,
    error: usageError,
  } = await supabase
    .from('coupon_usages')
    .select('*')

  if (!usageError && Array.isArray(usageData)) {
    usageRows = usageData
  }

  // =========================================================
  // USAGE COUNT HELPER
  // =========================================================

  const getUsageCount = (coupon) => {
    if (!coupon?.id) return 0

    return usageRows.filter((usage) => {
      return (
        usage?.coupon_id === coupon.id ||
        usage?.coupon_code?.toUpperCase() ===
          String(coupon.code || '').toUpperCase()
      )
    }).length
  }

  // =========================================================
  // STATUS HELPER
  // =========================================================

  const isCouponActive = (coupon) => {
    if (coupon?.is_active === false) {
      return false
    }

    if (
      coupon?.expires_at &&
      new Date(coupon.expires_at) < new Date()
    ) {
      return false
    }

    if (
      coupon?.valid_until &&
      new Date(coupon.valid_until) < new Date()
    ) {
      return false
    }

    return true
  }

  // =========================================================
  // FILTER STATUS
  // =========================================================

  const filteredCoupons = safeCoupons.filter(
    (coupon) => {
      const active = isCouponActive(coupon)

      if (status === 'active') {
        return active
      }

      if (status === 'inactive') {
        return !active
      }

      return true
    }
  )

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalCoupons =
    safeCoupons.length

  const activeCoupons =
    safeCoupons.filter(isCouponActive).length

  const inactiveCoupons =
    totalCoupons - activeCoupons

  const totalUses =
    safeCoupons.reduce(
      (total, coupon) =>
        total + getUsageCount(coupon),
      0
    )

  // =========================================================
  // FORMATTERS
  // =========================================================

  const formatDate = (date) => {
    if (!date) return '—'

    const parsed = new Date(date)

    if (Number.isNaN(parsed.getTime())) {
      return '—'
    }

    return parsed.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  const getDiscountText = (coupon) => {
    const type =
      String(
        coupon?.discount_type ||
          coupon?.type ||
          ''
      ).toLowerCase()

    const value = Number(
      coupon?.discount_value ??
        coupon?.discount ??
        coupon?.value ??
        0
    )

    if (type.includes('percent')) {
      return `${value}% OFF`
    }

    if (
      type.includes('fixed') ||
      type.includes('amount')
    ) {
      return `₹${value.toLocaleString(
        'en-IN'
      )} OFF`
    }

    // Fallback if your DB only has discount_value
    if (value > 0) {
      return `${value}% OFF`
    }

    return 'Discount'
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="min-h-screen bg-[#f7f8f6] text-neutral-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-neutral-200/80 bg-white">
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white shadow-lg">
                  <TicketPercent
                    size={22}
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                    Coupons
                  </h1>

                  <p className="mt-1 text-sm text-neutral-500">
                    Manage discounts and monitor coupon usage
                  </p>
                </div>

              </div>
            </div>

            <Link
              href="/admin/coupons/new"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-black px-5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-neutral-800"
            >
              <Plus size={18} />
              Create Coupon
            </Link>

          </div>

        </div>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

        {/* ===================================================
            STATISTICS
        =================================================== */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL */}

          <StatCard
            title="Total Coupons"
            value={totalCoupons}
            icon={
              <TicketPercent
                size={20}
              />
            }
            description="All created coupons"
          />

          {/* ACTIVE */}

          <StatCard
            title="Active Coupons"
            value={activeCoupons}
            icon={
              <CheckCircle2
                size={20}
              />
            }
            description="Currently available"
            positive
          />

          {/* INACTIVE */}

          <StatCard
            title="Inactive"
            value={inactiveCoupons}
            icon={
              <XCircle
                size={20}
              />
            }
            description="Expired or disabled"
          />

          {/* USAGE */}

          <StatCard
            title="Total Uses"
            value={totalUses}
            icon={
              <Users size={20} />
            }
            description="Coupon redemptions"
          />

        </section>

        {/* ===================================================
            FILTER BAR
        =================================================== */}

        <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">

          <form
            action="/admin/coupons"
            method="GET"
            className="flex flex-col gap-3 lg:flex-row"
          >

            {/* SEARCH */}

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search coupon code..."
                className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-black focus:bg-white"
              />

            </div>

            {/* STATUS */}

            <select
              name="status"
              defaultValue={status}
              className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-bold outline-none focus:border-black"
            >
              <option value="all">
                All Coupons
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

            <button
              type="submit"
              className="h-12 rounded-2xl bg-black px-6 text-sm font-bold text-white transition hover:bg-neutral-800"
            >
              Filter
            </button>

          </form>

        </section>

        {/* ===================================================
            COUPON LIST
        =================================================== */}

        <section className="mt-6">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-black">
                Coupon List
              </h2>

              <p className="mt-1 text-xs text-neutral-500">
                {filteredCoupons.length}{' '}
                coupon
                {filteredCoupons.length === 1
                  ? ''
                  : 's'} found
              </p>
            </div>

          </div>

          {filteredCoupons.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
                <TicketPercent
                  size={26}
                  className="text-neutral-400"
                />
              </div>

              <h3 className="mt-5 text-lg font-black">
                No coupons found
              </h3>

              <p className="mt-2 text-sm text-neutral-500">
                Create your first coupon to start offering discounts.
              </p>

              <Link
                href="/admin/coupons/new"
                className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm font-bold text-white"
              >
                Create Coupon
              </Link>

            </div>

          ) : (

            <>
              {/* DESKTOP TABLE */}

              <div className="hidden overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm md:block">

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[900px]">

                    <thead className="border-b border-neutral-200 bg-neutral-50">

                      <tr className="text-left text-[10px] font-black uppercase tracking-widest text-neutral-500">

                        <th className="px-6 py-4">
                          Coupon
                        </th>

                        <th className="px-6 py-4">
                          Discount
                        </th>

                        <th className="px-6 py-4">
                          Status
                        </th>

                        <th className="px-6 py-4">
                          Usage
                        </th>

                        <th className="px-6 py-4">
                          Expiry
                        </th>

                        <th className="px-6 py-4 text-right">
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-neutral-100">

                      {filteredCoupons.map(
                        (coupon) => {

                          const active =
                            isCouponActive(
                              coupon
                            )

                          const uses =
                            getUsageCount(
                              coupon
                            )

                          return (
                            <tr
                              key={
                                coupon.id
                              }
                              className="group transition hover:bg-neutral-50"
                            >

                              {/* COUPON */}

                              <td className="px-6 py-5">

                                <div className="flex items-center gap-3">

                                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
                                    <TicketPercent
                                      size={18}
                                    />
                                  </div>

                                  <div>

                                    <div className="flex items-center gap-2">

                                      <span className="font-black tracking-wide">
                                        {coupon.code ||
                                          'NO CODE'}
                                      </span>

                                      <Copy
                                        size={13}
                                        className="cursor-pointer text-neutral-300 transition hover:text-black"
                                      />

                                    </div>

                                    <p className="mt-1 text-xs text-neutral-400">
                                      Created{' '}
                                      {formatDate(
                                        coupon.created_at
                                      )}
                                    </p>

                                  </div>

                                </div>

                              </td>

                              {/* DISCOUNT */}

                              <td className="px-6 py-5">

                                <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-black">
                                  <Percent
                                    size={12}
                                  />

                                  {getDiscountText(
                                    coupon
                                  )}
                                </span>

                              </td>

                              {/* STATUS */}

                              <td className="px-6 py-5">

                                {active ? (

                                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">

                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                    Active

                                  </span>

                                ) : (

                                  <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-600">

                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

                                    Inactive

                                  </span>

                                )}

                              </td>

                              {/* USAGE */}

                              <td className="px-6 py-5">

                                <div className="flex items-center gap-2">

                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
                                    <Users
                                      size={14}
                                    />
                                  </div>

                                  <div>
                                    <p className="text-sm font-black">
                                      {uses}
                                    </p>

                                    <p className="text-[10px] text-neutral-400">
                                      uses
                                    </p>
                                  </div>

                                </div>

                              </td>

                              {/* EXPIRY */}

                              <td className="px-6 py-5">

                                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">

                                  <CalendarDays
                                    size={15}
                                    className="text-neutral-400"
                                  />

                                  {formatDate(
                                    coupon.expires_at ||
                                      coupon.valid_until
                                  )}

                                </div>

                              </td>

                              {/* ACTION */}

                              <td className="px-6 py-5 text-right">

                                <div className="flex justify-end gap-2">

                                  <Link
                                    href={`/admin/coupons/${coupon.id}`}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition hover:border-black hover:text-black"
                                  >
                                    <ArrowUpRight
                                      size={15}
                                    />
                                  </Link>

                                  <button
                                    type="button"
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 text-red-400 transition hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2
                                      size={15}
                                    />
                                  </button>

                                </div>

                              </td>

                            </tr>
                          )
                        }
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

              {/* MOBILE CARDS */}

              <div className="space-y-3 md:hidden">

                {filteredCoupons.map(
                  (coupon) => {

                    const active =
                      isCouponActive(
                        coupon
                      )

                    const uses =
                      getUsageCount(
                        coupon
                      )

                    return (
                      <div
                        key={coupon.id}
                        className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100">
                              <TicketPercent
                                size={18}
                              />
                            </div>

                            <div>
                              <h3 className="font-black">
                                {coupon.code}
                              </h3>

                              <p className="mt-1 text-xs text-neutral-400">
                                {getDiscountText(
                                  coupon
                                )}
                              </p>
                            </div>

                          </div>

                          {active ? (

                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                              ACTIVE
                            </span>

                          ) : (

                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-600">
                              INACTIVE
                            </span>

                          )}

                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">

                          <div className="rounded-2xl bg-neutral-50 p-3">

                            <p className="text-[9px] font-black uppercase tracking-wider text-neutral-400">
                              Used
                            </p>

                            <p className="mt-1 text-lg font-black">
                              {uses}
                            </p>

                          </div>

                          <div className="rounded-2xl bg-neutral-50 p-3">

                            <p className="text-[9px] font-black uppercase tracking-wider text-neutral-400">
                              Expires
                            </p>

                            <p className="mt-1 text-xs font-bold">
                              {formatDate(
                                coupon.expires_at ||
                                  coupon.valid_until
                              )}
                            </p>

                          </div>

                        </div>

                        <Link
                          href={`/admin/coupons/${coupon.id}`}
                          className="mt-4 flex h-11 items-center justify-center rounded-xl border border-neutral-200 text-xs font-black transition hover:border-black"
                        >
                          View Coupon
                          <ArrowUpRight
                            size={14}
                            className="ml-2"
                          />
                        </Link>

                      </div>
                    )
                  }
                )}

              </div>
            </>
          )}

        </section>

      </div>
    </main>
  )
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  title,
  value,
  icon,
  description,
  positive = false,
}) {
  return (
    <div className="group rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs font-bold text-neutral-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-neutral-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
            positive
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-neutral-100 text-neutral-700'
          }`}
        >
          {icon}
        </div>

      </div>

    </div>
  )
}