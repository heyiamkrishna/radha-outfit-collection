'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Pencil,
  ExternalLink,
  RefreshCw,
  Boxes,
} from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'

export default function InventoryTable({
  initialInventory = [],
}) {
  const supabase = createClient()

  const [
    inventory,
    setInventory,
  ] = useState(initialInventory)

  const [search, setSearch] =
    useState('')

  const [filter, setFilter] =
    useState('all')

  const [updatingId, setUpdatingId] =
    useState(null)

  // =========================================================
  // REALTIME
  // =========================================================

  useEffect(() => {
    const channel =
      supabase
        .channel(
          'admin-inventory-realtime'
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'product_variants',
          },
          async (payload) => {
            console.log(
              'INVENTORY REALTIME:',
              payload
            )

            /*
             * Reload the complete inventory.
             *
             * This is safer than trying to manually
             * merge nested product data.
             */

            const { data, error } =
              await supabase
                .from(
                  'product_variants'
                )
                .select(`
                  id,
                  product_id,
                  size,
                  color,
                  stock_quantity,
                  products (
                    id,
                    name,
                    slug,
                    base_price,
                    compare_price,
                    gender,
                    is_active,
                    product_images (
                      image_url,
                      alt_text,
                      sort_order
                    )
                  )
                `)
                .order(
                  'stock_quantity',
                  {
                    ascending: true,
                  }
                )

            if (!error && data) {
              setInventory(data)
            }
          }
        )
        .subscribe((status) => {
          console.log(
            'Inventory realtime:',
            status
          )
        })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // =========================================================
  // CALCULATIONS
  // =========================================================

  const stats = useMemo(() => {
    const totalVariants =
      inventory.length

    const totalStock =
      inventory.reduce(
        (sum, item) =>
          sum +
          Number(
            item.stock_quantity || 0
          ),
        0
      )

    const outOfStock =
      inventory.filter(
        (item) =>
          Number(
            item.stock_quantity || 0
          ) <= 0
      ).length

    const lowStock =
      inventory.filter((item) => {
        const stock = Number(
          item.stock_quantity || 0
        )

        return stock > 0 && stock <= 10
      }).length

    const healthyStock =
      inventory.filter(
        (item) =>
          Number(
            item.stock_quantity || 0
          ) > 10
      ).length

    return {
      totalVariants,
      totalStock,
      outOfStock,
      lowStock,
      healthyStock,
    }
  }, [inventory])

  // =========================================================
  // FILTER
  // =========================================================

  const filteredInventory =
    useMemo(() => {
      const query =
        search.trim().toLowerCase()

      return inventory.filter(
        (item) => {
          const product =
            item.products

          const name =
            product?.name
              ?.toLowerCase() || ''

          const gender =
            product?.gender
              ?.toLowerCase() || ''

          const size =
            item.size
              ?.toLowerCase() || ''

          const color =
            item.color
              ?.toLowerCase() || ''

          const matchesSearch =
            !query ||
            name.includes(query) ||
            gender.includes(query) ||
            size.includes(query) ||
            color.includes(query)

          const stock = Number(
            item.stock_quantity || 0
          )

          let matchesFilter = true

          if (
            filter === 'out'
          ) {
            matchesFilter = stock <= 0
          }

          if (
            filter === 'low'
          ) {
            matchesFilter =
              stock > 0 && stock <= 10
          }

          if (
            filter === 'healthy'
          ) {
            matchesFilter = stock > 10
          }

          return (
            matchesSearch &&
            matchesFilter
          )
        }
      )
    }, [
      inventory,
      search,
      filter,
    ])

  // =========================================================
  // UPDATE STOCK
  // =========================================================

  async function updateStock(
    variantId,
    value
  ) {
    const stock = Math.max(
      0,
      Number(value) || 0
    )

    setUpdatingId(variantId)

    const {
      error,
    } = await supabase
      .from('product_variants')
      .update({
        stock_quantity: stock,
      })
      .eq('id', variantId)

    if (error) {
      console.error(
        'STOCK UPDATE ERROR:',
        error
      )

      toast.error(
        error.message ||
          'Unable to update stock.'
      )
    } else {
      toast.success(
        'Stock updated successfully'
      )

      /*
       * Realtime subscription will also
       * update the table automatically.
       */

      setInventory(
        (current) =>
          current.map(
            (item) =>
              item.id === variantId
                ? {
                    ...item,
                    stock_quantity:
                      stock,
                  }
                : item
          )
      )
    }

    setUpdatingId(null)
  }

  // =========================================================
  // IMAGE
  // =========================================================

  function getImage(product) {
    const images =
      product?.product_images || []

    if (!images.length) {
      return null
    }

    const sorted = [
      ...images,
    ].sort(
      (a, b) =>
        Number(
          a.sort_order || 0
        ) -
        Number(
          b.sort_order || 0
        )
    )

    return (
      sorted[0]?.image_url ||
      null
    )
  }

  // =========================================================
  // STOCK STATUS
  // =========================================================

  function getStockStatus(stock) {
    if (stock <= 0) {
      return {
        label: 'Out of Stock',
        className:
          'bg-red-50 text-red-600 border-red-100',
        icon: XCircle,
      }
    }

    if (stock <= 10) {
      return {
        label: 'Low Stock',
        className:
          'bg-amber-50 text-amber-700 border-amber-100',
        icon: AlertTriangle,
      }
    }

    return {
      label: 'Healthy',
      className:
        'bg-green-50 text-green-700 border-green-100',
      icon: CheckCircle2,
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

        {/* TOTAL */}

        <StatCard
          icon={Boxes}
          label="Variants"
          value={
            stats.totalVariants
          }
          description="Product variants"
        />

        {/* STOCK */}

        <StatCard
          icon={Package}
          label="Total Stock"
          value={
            stats.totalStock.toLocaleString(
              'en-IN'
            )
          }
          description="Units available"
        />

        {/* LOW */}

        <StatCard
          icon={AlertTriangle}
          label="Low Stock"
          value={
            stats.lowStock
          }
          description="Need attention"
        />

        {/* OUT */}

        <StatCard
          icon={XCircle}
          label="Out of Stock"
          value={
            stats.outOfStock
          }
          description="Unavailable variants"
        />
      </div>

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="mb-5 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          {/* SEARCH */}

          <div className="relative w-full lg:max-w-md">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search products, size or color..."
              className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          {/* FILTERS */}

          <div className="flex gap-2 overflow-x-auto">

            <FilterButton
              active={
                filter === 'all'
              }
              onClick={() =>
                setFilter('all')
              }
            >
              All
            </FilterButton>

            <FilterButton
              active={
                filter === 'healthy'
              }
              onClick={() =>
                setFilter('healthy')
              }
            >
              Healthy
            </FilterButton>

            <FilterButton
              active={
                filter === 'low'
              }
              onClick={() =>
                setFilter('low')
              }
            >
              Low Stock
            </FilterButton>

            <FilterButton
              active={
                filter === 'out'
              }
              onClick={() =>
                setFilter('out')
              }
            >
              Out
            </FilterButton>
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE CARDS
      ===================================================== */}

      <div className="space-y-3 md:hidden">

        {filteredInventory.map(
          (item) => {
            const product =
              item.products

            const stock =
              Number(
                item.stock_quantity || 0
              )

            const status =
              getStockStatus(
                stock
              )

            const StatusIcon =
              status.icon

            const image =
              getImage(product)

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
              >

                <div className="flex gap-3">

                  {/* IMAGE */}

                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    {image ? (
                      <img
                        src={image}
                        alt={
                          product?.name ||
                          'Product'
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package
                          size={18}
                          className="text-neutral-300"
                        />
                      </div>
                    )}
                  </div>

                  {/* INFO */}

                  <div className="min-w-0 flex-1">

                    <div className="flex justify-between gap-2">

                      <div>
                        <h3 className="line-clamp-2 text-sm font-black text-neutral-900">
                          {product?.name ||
                            'Unknown Product'}
                        </h3>

                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {product?.gender ||
                            'General'}
                        </p>
                      </div>

                      <Link
                        href={`/product/${product?.slug || ''}`}
                        target="_blank"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100"
                      >
                        <ExternalLink
                          size={13}
                        />
                      </Link>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">

                      {item.size && (
                        <span className="rounded-md bg-neutral-100 px-2 py-1 text-[9px] font-bold">
                          {item.size}
                        </span>
                      )}

                      {item.color && (
                        <span className="rounded-md bg-neutral-100 px-2 py-1 text-[9px] font-bold">
                          {item.color}
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-black uppercase ${status.className}`}
                      >
                        <StatusIcon
                          size={10}
                        />

                        {status.label}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">

                      <span className="text-sm font-black">
                        {stock}
                        <span className="ml-1 text-[9px] font-medium text-neutral-400">
                          units
                        </span>
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={stock}
                        disabled={
                          updatingId ===
                          item.id
                        }
                        onChange={(event) =>
                          updateStock(
                            item.id,
                            event
                              .target
                              .value
                          )
                        }
                        className="h-9 w-20 rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-center text-xs font-black outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        )}

        {filteredInventory.length ===
          0 && (
          <EmptyInventory />
        )}
      </div>

      {/* =====================================================
          DESKTOP TABLE
      ===================================================== */}

      <div className="hidden overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm md:block">

        {/* TABLE HEADER */}

        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">

          <div>
            <h2 className="text-sm font-black text-neutral-900">
              Inventory Items
            </h2>

            <p className="mt-1 text-[10px] text-neutral-400">
              Showing{' '}
              {filteredInventory.length}{' '}
              of {inventory.length}{' '}
              variants
            </p>
          </div>

          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-green-600">
            <RefreshCw
              size={12}
              className="animate-spin"
              style={{
                animationDuration:
                  '3s',
              }}
            />

            Realtime
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/70">

                <th className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-wider text-neutral-400">
                  Product
                </th>

                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-wider text-neutral-400">
                  Variant
                </th>

                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-wider text-neutral-400">
                  Price
                </th>

                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-wider text-neutral-400">
                  Stock
                </th>

                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-wider text-neutral-400">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-[9px] font-black uppercase tracking-wider text-neutral-400">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredInventory.map(
                (item) => {
                  const product =
                    item.products

                  const stock =
                    Number(
                      item.stock_quantity ||
                        0
                    )

                  const status =
                    getStockStatus(
                      stock
                    )

                  const StatusIcon =
                    status.icon

                  const image =
                    getImage(
                      product
                    )

                  return (
                    <tr
                      key={item.id}
                      className="group border-b border-neutral-100 transition hover:bg-neutral-50/60"
                    >

                      {/* PRODUCT */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-neutral-100">

                            {image ? (
                              <img
                                src={image}
                                alt={
                                  product?.name ||
                                  'Product'
                                }
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Package
                                  size={
                                    16
                                  }
                                  className="text-neutral-300"
                                />
                              </div>
                            )}

                          </div>

                          <div className="min-w-0">

                            <p className="line-clamp-2 max-w-[280px] text-xs font-black text-neutral-900">
                              {product?.name ||
                                'Unknown Product'}
                            </p>

                            <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                              {product?.gender ||
                                'General'}
                            </p>

                          </div>
                        </div>
                      </td>

                      {/* VARIANT */}

                      <td className="px-4 py-4">

                        <div className="flex flex-wrap gap-1.5">

                          {item.size && (
                            <span className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-[9px] font-bold">
                              {item.size}
                            </span>
                          )}

                          {item.color && (
                            <span className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-[9px] font-bold">
                              {item.color}
                            </span>
                          )}

                          {!item.size &&
                            !item.color && (
                              <span className="text-[10px] text-neutral-400">
                                Default
                              </span>
                            )}

                        </div>
                      </td>

                      {/* PRICE */}

                      <td className="px-4 py-4">

                        <span className="text-xs font-black">
                          ₹
                          {Number(
                            product?.base_price ||
                              0
                          ).toLocaleString(
                            'en-IN'
                          )}
                        </span>

                      </td>

                      {/* STOCK */}

                      <td className="px-4 py-4">

                        <div className="flex items-center gap-2">

                          <input
                            type="number"
                            min="0"
                            value={stock}
                            disabled={
                              updatingId ===
                              item.id
                            }
                            onChange={(
                              event
                            ) =>
                              updateStock(
                                item.id,
                                event
                                  .target
                                  .value
                              )
                            }
                            className="h-9 w-20 rounded-lg border border-neutral-200 bg-neutral-50 px-2 text-center text-xs font-black outline-none transition focus:border-black focus:bg-white"
                          />

                          {updatingId ===
                            item.id && (
                            <Loader2
                              size={13}
                              className="animate-spin text-neutral-400"
                            />
                          )}
                        </div>

                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-4">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[8px] font-black uppercase tracking-wider ${status.className}`}
                        >
                          <StatusIcon
                            size={11}
                          />

                          {status.label}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <Link
                            href={`/product/${product?.slug || ''}`}
                            target="_blank"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition hover:border-black hover:text-black"
                            title="View product"
                          >
                            <ExternalLink
                              size={14}
                            />
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              const input =
                                document.querySelector(
                                  `input[data-variant-id="${item.id}"]`
                                )

                              input?.focus()
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 transition hover:border-black hover:text-black"
                            title="Edit stock"
                          >
                            <Pencil
                              size={14}
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

        {filteredInventory.length ===
          0 && (
          <EmptyInventory />
        )}
      </div>
    </div>
  )
}

// ===========================================================
// STAT CARD
// ===========================================================

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div className="group rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-5">

      <div className="flex items-start justify-between">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 transition group-hover:bg-black group-hover:text-white">
          <Icon size={16} />
        </div>

      </div>

      <p className="mt-5 text-[9px] font-black uppercase tracking-[0.15em] text-neutral-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black tracking-tight text-neutral-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-neutral-400">
        {description}
      </p>
    </div>
  )
}

// ===========================================================
// FILTER BUTTON
// ===========================================================

function FilterButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-wider transition ${
        active
          ? 'bg-black text-white'
          : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
      }`}
    >
      {children}
    </button>
  )
}

// ===========================================================
// EMPTY
// ===========================================================

function EmptyInventory() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
        <Package
          size={23}
          className="text-neutral-400"
        />
      </div>

      <h3 className="mt-4 text-sm font-black text-neutral-900">
        No inventory found
      </h3>

      <p className="mt-1 max-w-sm text-xs text-neutral-400">
        Try changing your search or inventory filter.
      </p>
    </div>
  )
}