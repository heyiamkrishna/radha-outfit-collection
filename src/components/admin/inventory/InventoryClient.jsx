'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Package,
  AlertTriangle,
  Search,
  XCircle,
  RefreshCw,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

import InventoryTable from './InventoryTable'

export default function InventoryClient() {
  const [variants, setVariants] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [error, setError] =
    useState(null)

  const [search, setSearch] =
    useState('')

  const [filter, setFilter] =
    useState('all')

  /*
  ==================================================
  LOAD INVENTORY
  ==================================================
  */

  const loadInventory =
    useCallback(
      async (
        showLoader = true
      ) => {
        try {
          if (showLoader) {
            setLoading(true)
          } else {
            setRefreshing(true)
          }

          setError(null)

          const response =
            await fetch(
              '/api/admin/inventory',
              {
                method: 'GET',
                cache: 'no-store',
              }
            )

          const result =
            await response.json()

          if (!response.ok) {
            throw new Error(
              result?.error ||
                'Unable to load inventory.'
            )
          }

          setVariants(
            Array.isArray(
              result?.variants
            )
              ? result.variants
              : []
          )
        } catch (error) {
          console.error(
            'Inventory load error:',
            error
          )

          setError(
            error?.message ||
              'Unable to load inventory.'
          )
        } finally {
          setLoading(false)
          setRefreshing(false)
        }
      },
      []
    )

  /*
  ==================================================
  INITIAL LOAD
  ==================================================
  */

  useEffect(() => {
    loadInventory(true)
  }, [loadInventory])

  /*
  ==================================================
  REALTIME
  ==================================================
  */

  useEffect(() => {
    const supabase =
      createClient()

    const channel =
      supabase
        .channel(
          `admin-inventory-${Date.now()}`
        )

        /*
        --------------------------------------------
        PRODUCT VARIANTS
        --------------------------------------------
        */

        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table:
              'product_variants',
          },
          () => {
            loadInventory(false)
          }
        )

        /*
        --------------------------------------------
        PRODUCTS
        --------------------------------------------
        */

        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table:
              'products',
          },
          () => {
            loadInventory(false)
          }
        )

        .subscribe()

    return () => {
      supabase.removeChannel(
        channel
      )
    }
  }, [loadInventory])

  /*
  ==================================================
  STATS
  ==================================================
  */

  const stats =
    useMemo(() => {
      const productIds =
        new Set()

      let totalStock = 0
      let lowStock = 0
      let outOfStock = 0

      variants.forEach(
        (variant) => {
          if (
            variant.product_id
          ) {
            productIds.add(
              variant.product_id
            )
          }

          const stock =
            Number(
              variant.stock_quantity ||
                0
            )

          totalStock += stock

          if (
            stock > 0 &&
            stock <= 5
          ) {
            lowStock++
          }

          if (stock <= 0) {
            outOfStock++
          }
        }
      )

      return {
        products:
          productIds.size,

        variants:
          variants.length,

        totalStock,

        lowStock,

        outOfStock,
      }
    }, [variants])

  /*
  ==================================================
  FILTER
  ==================================================
  */

  const filteredVariants =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase()

      return variants.filter(
        (variant) => {
          const product =
            variant.products

          const productName =
            product?.name
              ?.toLowerCase() || ''

          const sku =
            variant.sku
              ?.toLowerCase() || ''

          const size =
            variant.size
              ?.toLowerCase() || ''

          const color =
            variant.color
              ?.toLowerCase() || ''

          const matchesSearch =
            !searchValue ||
            productName.includes(
              searchValue
            ) ||
            sku.includes(
              searchValue
            ) ||
            size.includes(
              searchValue
            ) ||
            color.includes(
              searchValue
            )

          const stock =
            Number(
              variant.stock_quantity ||
                0
            )

          let matchesFilter =
            true

          if (
            filter ===
            'in-stock'
          ) {
            matchesFilter =
              stock > 5
          }

          if (
            filter ===
            'low-stock'
          ) {
            matchesFilter =
              stock > 0 &&
              stock <= 5
          }

          if (
            filter ===
            'out-of-stock'
          ) {
            matchesFilter =
              stock <= 0
          }

          return (
            matchesSearch &&
            matchesFilter
          )
        }
      )
    }, [
      variants,
      search,
      filter,
    ])

  /*
  ==================================================
  LOADING
  ==================================================
  */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            1,
            2,
            3,
            4,
          ].map(
            (item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-[28px] bg-neutral-200"
              />
            )
          )}
        </div>

        <div className="h-[500px] animate-pulse rounded-[28px] bg-neutral-200" />
      </div>
    )
  }

  /*
  ==================================================
  ERROR
  ==================================================
  */

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-100 bg-red-50 p-6">
        <p className="text-sm font-bold text-red-700">
          Unable to load inventory
        </p>

        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            loadInventory(true)
          }
          className="mt-5 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"
        >
          Try Again
        </button>
      </div>
    )
  }

  /*
  ==================================================
  UI
  ==================================================
  */

  return (
    <div className="space-y-8">

      {/* STATS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Products"
          value={stats.products}
          description={`${stats.variants} inventory variants`}
          icon={
            <Package size={20} />
          }
        />

        <StatCard
          label="Total Stock"
          value={stats.totalStock}
          description="Units available"
          icon={
            <Package size={20} />
          }
        />

        <StatCard
          label="Low Stock"
          value={stats.lowStock}
          description="5 units or less"
          icon={
            <AlertTriangle
              size={20}
            />
          }
        />

        <StatCard
          label="Out of Stock"
          value={stats.outOfStock}
          description="Needs restocking"
          icon={
            <XCircle size={20} />
          }
        />

      </div>

      {/* FILTERS */}

      <div className="rounded-[28px] border border-black/[0.05] bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">

        <div className="flex flex-col gap-3 md:flex-row">

          <div className="flex h-12 flex-1 items-center rounded-2xl bg-neutral-50 px-4">

            <Search
              size={18}
              className="mr-3 text-neutral-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search products, SKU, size, color..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
            />

          </div>

          <div className="flex overflow-x-auto rounded-2xl bg-neutral-50 p-1">

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
                filter ===
                'in-stock'
              }
              onClick={() =>
                setFilter(
                  'in-stock'
                )
              }
            >
              In Stock
            </FilterButton>

            <FilterButton
              active={
                filter ===
                'low-stock'
              }
              onClick={() =>
                setFilter(
                  'low-stock'
                )
              }
            >
              Low Stock
            </FilterButton>

            <FilterButton
              active={
                filter ===
                'out-of-stock'
              }
              onClick={() =>
                setFilter(
                  'out-of-stock'
                )
              }
            >
              Out
            </FilterButton>

          </div>

          <button
            type="button"
            disabled={refreshing}
            onClick={() =>
              loadInventory(false)
            }
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-black/[0.06] bg-white px-5 text-xs font-semibold transition hover:bg-neutral-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? 'animate-spin'
                  : ''
              }
            />

            Refresh
          </button>

        </div>

      </div>

      {/* TABLE */}

      <InventoryTable
        variants={
          filteredVariants
        }
        onRefresh={() =>
          loadInventory(false)
        }
      />

    </div>
  )
}

/*
==================================================
STAT CARD
==================================================
*/

function StatCard({
  label,
  value,
  description,
  icon,
}) {
  return (
    <div className="rounded-[28px] border border-black/[0.05] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-medium text-neutral-400">
            {label}
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight">
            {value}
          </h2>

        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
          {icon}
        </div>

      </div>

      <p className="mt-5 text-xs text-neutral-400">
        {description}
      </p>

    </div>
  )
}

/*
==================================================
FILTER BUTTON
==================================================
*/

function FilterButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'whitespace-nowrap rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white'
          : 'whitespace-nowrap rounded-xl px-5 py-2.5 text-xs font-medium text-neutral-500 transition hover:bg-white'
      }
    >
      {children}
    </button>
  )
}