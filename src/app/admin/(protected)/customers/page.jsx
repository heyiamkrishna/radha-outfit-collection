'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Search,
  Users,
  UserPlus,
  Mail,
  Phone,
  RefreshCw,
  Loader2,
  X,
  Eye,
} from 'lucide-react'

export default function AdminCustomersPage() {
  const [supabase] = useState(() => createClient())

  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const [error, setError] = useState('')

  /*
  |--------------------------------------------------------------------------
  | Load Customers
  |--------------------------------------------------------------------------
  */

  const loadCustomers = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) {
          setLoading(true)
        } else {
          setRefreshing(true)
        }

        setError('')

        const {
          data,
          error: fetchError,
        } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            email,
            phone,
            role,
            is_active,
            created_at
          `)
          .eq('role', 'CUSTOMER')
          .order('created_at', {
            ascending: false,
          })

        if (fetchError) {
          console.error('Customers load error:', fetchError)
          setError(fetchError.message)
          setCustomers([])
          return
        }

        setCustomers(data || [])
      } catch (err) {
        console.error('Customers error:', err)

        setError(
          err?.message || 'Unable to load customers.'
        )

        setCustomers([])
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [supabase]
  )

  /*
  |--------------------------------------------------------------------------
  | Initial Load + Realtime
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true

    loadCustomers()

    /*
     * IMPORTANT:
     * Do NOT call .subscribe() before .on()
     *
     * Correct:
     * channel()
     *   .on(...)
     *   .subscribe()
     */

    const channel = supabase
      .channel('admin-customers-realtime')

      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: 'role=eq.CUSTOMER',
        },
        () => {
          if (mounted) {
            loadCustomers({ silent: true })
          }
        }
      )

      .subscribe((status) => {
        console.log(
          'Customers realtime status:',
          status
        )
      })

    return () => {
      mounted = false

      supabase.removeChannel(channel)
    }
  }, [supabase, loadCustomers])

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const filteredCustomers = customers.filter((customer) => {
    const fullName = [
      customer.first_name,
      customer.last_name,
    ]
      .filter(Boolean)
      .join(' ')

    const value = `
      ${fullName}
      ${customer.email || ''}
      ${customer.phone || ''}
    `.toLowerCase()

    return value.includes(search.toLowerCase())
  })

  /*
  |--------------------------------------------------------------------------
  | Stats
  |--------------------------------------------------------------------------
  */

  const totalCustomers = customers.length

  const activeCustomers = customers.filter(
    (customer) => customer.is_active !== false
  ).length

  const inactiveCustomers = customers.filter(
    (customer) => customer.is_active === false
  ).length

  /*
  |--------------------------------------------------------------------------
  | Customer Name
  |--------------------------------------------------------------------------
  */

  function getCustomerName(customer) {
    const name = [
      customer.first_name,
      customer.last_name,
    ]
      .filter(Boolean)
      .join(' ')

    return name || 'Unnamed Customer'
  }

  /*
  |--------------------------------------------------------------------------
  | Format Date
  |--------------------------------------------------------------------------
  */

  function formatDate(date) {
    if (!date) return '—'

    try {
      return new Date(date).toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      )
    } catch {
      return '—'
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">

            <div className="h-10 w-64 rounded-xl bg-neutral-200" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl bg-neutral-200"
                />
              ))}
            </div>

            <div className="h-16 rounded-2xl bg-neutral-200" />

            <div className="h-96 rounded-2xl bg-neutral-200" />

          </div>
        </div>
      </div>
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* =========================================================
            HEADER
        ========================================================== */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
              Radha Outfit Collection
            </p>

            <h1 className="text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl">
              Customers
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Manage your registered customers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadCustomers({ silent: true })}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-800 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={16} />
            )}

            Refresh
          </button>

        </div>

        {/* =========================================================
            ERROR
        ========================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-sm font-bold text-red-700">
                  Customer load error
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-600"
              >
                <X size={18} />
              </button>

            </div>

          </div>
        )}

        {/* =========================================================
            STATS
        ========================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <StatCard
            icon={<Users size={20} />}
            label="Total Customers"
            value={totalCustomers}
          />

          <StatCard
            icon={<UserPlus size={20} />}
            label="Active Customers"
            value={activeCustomers}
          />

          <StatCard
            icon={<Users size={20} />}
            label="Inactive Customers"
            value={inactiveCustomers}
          />

        </div>

        {/* =========================================================
            SEARCH
        ========================================================== */}

        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              type="search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by name, email or phone..."
              className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
            />

          </div>

        </div>

        {/* =========================================================
            EMPTY
        ========================================================== */}

        {filteredCustomers.length === 0 ? (

          <div className="rounded-3xl border border-neutral-200 bg-white px-6 py-20 text-center shadow-sm">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <Users
                size={28}
                className="text-neutral-400"
              />
            </div>

            {search ? (
              <>
                <h2 className="text-xl font-bold text-neutral-900">
                  No customers found
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  Try another search term.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-neutral-900">
                  No customers
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  No customer accounts have been registered yet.
                </p>
              </>
            )}

          </div>

        ) : (

          /* =========================================================
              TABLE
          ========================================================== */

          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">

            {/* Desktop */}

            <div className="hidden overflow-x-auto md:block">

              <table className="w-full">

                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">

                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Joined
                    </th>

                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredCustomers.map(
                    (customer) => (

                      <tr
                        key={customer.id}
                        className="border-b border-neutral-100 transition hover:bg-neutral-50"
                      >

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <Avatar
                              name={getCustomerName(customer)}
                            />

                            <div>
                              <p className="font-semibold text-neutral-900">
                                {getCustomerName(customer)}
                              </p>

                              <p className="text-xs text-neutral-400">
                                ID: {customer.id.slice(0, 8)}
                              </p>
                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-5 text-sm text-neutral-600">
                          {customer.email || '—'}
                        </td>

                        <td className="px-6 py-5 text-sm text-neutral-600">
                          {customer.phone || '—'}
                        </td>

                        <td className="px-6 py-5">

                          <StatusBadge
                            active={
                              customer.is_active !== false
                            }
                          />

                        </td>

                        <td className="px-6 py-5 text-sm text-neutral-500">
                          {formatDate(customer.created_at)}
                        </td>

                        <td className="px-6 py-5 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedCustomer(
                                customer
                              )
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
                            title="View customer"
                          >
                            <Eye size={16} />
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* Mobile */}

            <div className="divide-y divide-neutral-100 md:hidden">

              {filteredCustomers.map(
                (customer) => (

                  <div
                    key={customer.id}
                    className="p-5"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-3">

                        <Avatar
                          name={getCustomerName(customer)}
                        />

                        <div className="min-w-0">

                          <p className="truncate font-semibold text-neutral-900">
                            {getCustomerName(customer)}
                          </p>

                          <p className="truncate text-xs text-neutral-500">
                            {customer.email || 'No email'}
                          </p>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCustomer(
                            customer
                          )
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200"
                      >
                        <Eye size={16} />
                      </button>

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">

                      <div className="rounded-xl bg-neutral-50 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                          Phone
                        </p>

                        <p className="mt-1 truncate font-medium text-neutral-800">
                          {customer.phone || '—'}
                        </p>
                      </div>

                      <div className="rounded-xl bg-neutral-50 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                          Joined
                        </p>

                        <p className="mt-1 font-medium text-neutral-800">
                          {formatDate(
                            customer.created_at
                          )}
                        </p>
                      </div>

                    </div>

                    <div className="mt-3">
                      <StatusBadge
                        active={
                          customer.is_active !== false
                        }
                      />
                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        )}

      </div>

      {/* =========================================================
          CUSTOMER MODAL
      ========================================================== */}

      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedCustomer(null)
            }
          }}
        >

          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">
                  Customer Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-neutral-950">
                  {getCustomerName(
                    selectedCustomer
                  )}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedCustomer(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200"
              >
                <X size={17} />
              </button>

            </div>

            <div className="space-y-4 p-6">

              <DetailRow
                icon={<Mail size={17} />}
                label="Email"
                value={
                  selectedCustomer.email ||
                  'Not provided'
                }
              />

              <DetailRow
                icon={<Phone size={17} />}
                label="Phone"
                value={
                  selectedCustomer.phone ||
                  'Not provided'
                }
              />

              <DetailRow
                icon={<Users size={17} />}
                label="Role"
                value={
                  selectedCustomer.role ||
                  'CUSTOMER'
                }
              />

              <DetailRow
                icon={<UserPlus size={17} />}
                label="Joined"
                value={formatDate(
                  selectedCustomer.created_at
                )}
              />

              <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-4">

                <span className="text-sm text-neutral-500">
                  Account status
                </span>

                <StatusBadge
                  active={
                    selectedCustomer.is_active !== false
                  }
                />

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

/*
|--------------------------------------------------------------------------
| Stat Card
|--------------------------------------------------------------------------
*/

function StatCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">

      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
        {icon}
      </div>

      <p className="text-xs font-medium text-neutral-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-neutral-950">
        {value}
      </p>

    </div>
  )
}

/*
|--------------------------------------------------------------------------
| Avatar
|--------------------------------------------------------------------------
*/

function Avatar({ name }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-xs font-bold text-white">
      {initials || 'U'}
    </div>
  )
}

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
        active
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-red-50 text-red-600'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

/*
|--------------------------------------------------------------------------
| Detail Row
|--------------------------------------------------------------------------
*/

function DetailRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-neutral-100 p-4">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-medium text-neutral-900">
          {value}
        </p>
      </div>

    </div>
  )
}