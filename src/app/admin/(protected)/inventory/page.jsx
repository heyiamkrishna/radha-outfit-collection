'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Eye,
  Pencil,
  X,
  Save,
  Boxes,
  Users,
  Shirt,
  Baby,
  UserRound,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function InventoryPage() {
  const supabase = createClient()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [search, setSearch] = useState('')
  const [gender, setGender] = useState('ALL')
  const [status, setStatus] = useState('ALL')

  const [editingProduct, setEditingProduct] = useState(null)
  const [stockValue, setStockValue] = useState('')

  const [saving, setSaving] = useState(false)

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  async function getInventory(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          base_price,
          compare_price,
          badge,
          gender,
          is_active,
          created_at,
          product_images (
            image_url,
            alt_text,
            sort_order
          )
        `)
        .order('created_at', {
          ascending: false,
        })

      if (error) {
        console.error(
          'INVENTORY FETCH ERROR:',
          JSON.stringify(error, null, 2)
        )

        toast.error(
          error.message || 'Unable to load inventory.'
        )

        setProducts([])
        return
      }

      const normalized = (data || []).map((product) => {
        const images = Array.isArray(product.product_images)
          ? [...product.product_images].sort(
              (a, b) =>
                Number(a?.sort_order || 0) -
                Number(b?.sort_order || 0)
            )
          : []

        return {
          ...product,
          product_images: images,
          image_url:
            images[0]?.image_url ||
            '/placeholder-product.jpg',

          // Your current schema does not guarantee stock
          // on products. Keep it safe.
          stock_quantity:
            product.stock_quantity ??
            product.stock ??
            null,
        }
      })

      setProducts(normalized)
    } catch (error) {
      console.error(
        'INVENTORY EXCEPTION:',
        error
      )

      toast.error(
        error?.message ||
          'Unexpected inventory error.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    getInventory()

    // =======================================================
    // REALTIME
    // =======================================================

    const channel = supabase
      .channel('admin-inventory-realtime')

      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          getInventory(true)
        }
      )

      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_images',
        },
        () => {
          getInventory(true)
        }
      )

      .subscribe((status) => {
        console.log(
          'Inventory realtime status:',
          status
        )
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // =========================================================
  // FILTERED PRODUCTS
  // =========================================================

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchValue =
        search.trim().toLowerCase()

      const matchesSearch =
        !searchValue ||
        product.name
          ?.toLowerCase()
          .includes(searchValue) ||
        product.slug
          ?.toLowerCase()
          .includes(searchValue)

      const matchesGender =
        gender === 'ALL' ||
        String(product.gender || '')
          .toUpperCase() === gender

      let matchesStatus = true

      if (status === 'ACTIVE') {
        matchesStatus =
          product.is_active === true
      }

      if (status === 'INACTIVE') {
        matchesStatus =
          product.is_active === false
      }

      return (
        matchesSearch &&
        matchesGender &&
        matchesStatus
      )
    })
  }, [
    products,
    search,
    gender,
    status,
  ])

  // =========================================================
  // STATS
  // =========================================================

  const totalProducts = products.length

  const activeProducts = products.filter(
    (product) =>
      product.is_active === true
  ).length

  const trendingProducts = products.filter(
    (product) =>
      product.badge === 'TRENDING'
  ).length

  const inactiveProducts = products.filter(
    (product) =>
      product.is_active === false
  ).length

  // =========================================================
  // EDIT STOCK
  // =========================================================

  function openStockEditor(product) {
    setEditingProduct(product)

    setStockValue(
      product.stock_quantity == null
        ? ''
        : String(product.stock_quantity)
    )
  }

  function closeStockEditor() {
    setEditingProduct(null)
    setStockValue('')
  }

  async function saveStock() {
    if (!editingProduct) return

    const parsedStock =
      Number(stockValue)

    if (
      !Number.isFinite(parsedStock) ||
      parsedStock < 0
    ) {
      toast.error(
        'Enter a valid stock quantity.'
      )
      return
    }

    try {
      setSaving(true)

      /*
       * IMPORTANT:
       *
       * This assumes your products table has:
       *
       * stock_quantity
       *
       * If your products table does not have this
       * column, Supabase will return an error instead
       * of silently failing.
       */

      const { error } = await supabase
        .from('products')
        .update({
          stock_quantity:
            Math.floor(parsedStock),
        })
        .eq(
          'id',
          editingProduct.id
        )

      if (error) {
        console.error(
          'STOCK UPDATE ERROR:',
          JSON.stringify(error, null, 2)
        )

        toast.error(
          error.message ||
            'Unable to update stock.'
        )

        return
      }

      toast.success(
        'Stock updated successfully.'
      )

      closeStockEditor()

      await getInventory(true)
    } catch (error) {
      console.error(
        'STOCK UPDATE EXCEPTION:',
        error
      )

      toast.error(
        error?.message ||
          'Unable to update stock.'
      )
    } finally {
      setSaving(false)
    }
  }

  // =========================================================
  // GENDER ICON
  // =========================================================

  function GenderIcon({ value }) {
    const genderValue =
      String(value || '')
        .toUpperCase()

    if (genderValue === 'MEN') {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
          <UserRound
            size={17}
          />
        </div>
      )
    }

    if (genderValue === 'WOMEN') {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
          <Users
            size={17}
          />
        </div>
      )
    }

    if (genderValue === 'KIDS') {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
          <Baby
            size={17}
          />
        </div>
      )
    }

    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
        <Shirt
          size={17}
        />
      </div>
    )
  }

  // =========================================================
  // STOCK STATUS
  // =========================================================

  function StockStatus({ product }) {
    const stock =
      product.stock_quantity

    if (stock == null) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-500">
          Stock not set
        </span>
      )
    }

    if (stock === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-red-600">
          <AlertTriangle size={12} />
          Out of stock
        </span>
      )
    }

    if (stock <= 5) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-orange-600">
          <AlertTriangle size={12} />
          Low stock
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-green-600">
        <CheckCircle2 size={12} />
        In stock
      </span>
    )
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] p-4 md:p-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8 h-10 w-64 animate-pulse rounded-xl bg-white" />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-3xl bg-white"
                />
              )
            )}
          </div>

          <div className="mt-6 h-[500px] animate-pulse rounded-3xl bg-white" />

        </div>
      </div>
    )
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-neutral-900">

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">
              <Boxes size={13} />
              Admin / Inventory
            </div>

            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              Inventory
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              Manage your clothing products,
              stock availability and active
              catalog in real time.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              getInventory(true)
            }
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 text-sm font-bold shadow-sm transition hover:border-black hover:shadow-md disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? 'animate-spin'
                  : ''
              }
            />

            {refreshing
              ? 'Refreshing...'
              : 'Refresh'}
          </button>

        </div>

        {/* ================================================= */}
        {/* STATS */}
        {/* ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon={Package}
            title="Total Products"
            value={totalProducts}
            description="All products"
          />

          <StatCard
            icon={CheckCircle2}
            title="Active"
            value={activeProducts}
            description="Visible in shop"
          />

          <StatCard
            icon={TrendingUp}
            title="Trending"
            value={trendingProducts}
            description="Trending products"
          />

          <StatCard
            icon={AlertTriangle}
            title="Inactive"
            value={inactiveProducts}
            description="Hidden products"
          />

        </div>

        {/* ================================================= */}
        {/* FILTER BAR */}
        {/* ================================================= */}

        <div className="mt-6 rounded-3xl border border-neutral-200/70 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 lg:flex-row">

            {/* SEARCH */}

            <div className="relative flex-1">

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
                placeholder="Search products..."
                className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-black focus:bg-white"
              />

            </div>

            {/* GENDER */}

            <select
              value={gender}
              onChange={(event) =>
                setGender(
                  event.target.value
                )
              }
              className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-bold outline-none transition focus:border-black"
            >
              <option value="ALL">
                All Genders
              </option>
              <option value="MEN">
                Men
              </option>
              <option value="WOMEN">
                Women
              </option>
              <option value="KIDS">
                Kids
              </option>
              <option value="UNISEX">
                Unisex
              </option>
            </select>

            {/* STATUS */}

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
              className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm font-bold outline-none transition focus:border-black"
            >
              <option value="ALL">
                All Status
              </option>
              <option value="ACTIVE">
                Active
              </option>
              <option value="INACTIVE">
                Inactive
              </option>
            </select>

          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">

            <span>
              Showing{' '}
              <strong className="text-neutral-900">
                {filteredProducts.length}
              </strong>{' '}
              products
            </span>

            <span className="hidden sm:block">
              Live inventory sync enabled
            </span>

          </div>

        </div>

        {/* ================================================= */}
        {/* INVENTORY TABLE */}
        {/* ================================================= */}

        <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-200/70 bg-white shadow-sm">

          {/* DESKTOP TABLE */}

          <div className="hidden overflow-x-auto md:block">

            <table className="w-full min-w-[850px]">

              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/70">

                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Product
                  </th>

                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Collection
                  </th>

                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Price
                  </th>

                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Stock
                  </th>

                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredProducts.map(
                  (product) => (
                    <tr
                      key={product.id}
                      className="group border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60"
                    >

                      {/* PRODUCT */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-4">

                          <img
                            src={
                              product.image_url
                            }
                            alt={
                              product.name
                            }
                            className="h-16 w-14 rounded-xl bg-neutral-100 object-cover"
                          />

                          <div className="min-w-0">

                            <p className="max-w-[300px] truncate text-sm font-black">
                              {product.name}
                            </p>

                            <p className="mt-1 max-w-[300px] truncate text-[11px] text-neutral-400">
                              {product.slug}
                            </p>

                            {product.badge ===
                              'TRENDING' && (
                              <span className="mt-2 inline-flex rounded-full bg-black px-2 py-1 text-[8px] font-black uppercase tracking-wider text-white">
                                Trending
                              </span>
                            )}

                          </div>

                        </div>

                      </td>

                      {/* GENDER */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <GenderIcon
                            value={
                              product.gender
                            }
                          />

                          <span className="text-xs font-black uppercase">
                            {product.gender ||
                              'General'}
                          </span>

                        </div>

                      </td>

                      {/* PRICE */}

                      <td className="px-6 py-4">

                        <p className="text-sm font-black">
                          ₹
                          {Number(
                            product.base_price ||
                              0
                          ).toLocaleString(
                            'en-IN'
                          )}
                        </p>

                        {Number(
                          product.compare_price ||
                            0
                        ) >
                          Number(
                            product.base_price ||
                              0
                          ) && (
                          <p className="mt-1 text-xs text-neutral-400 line-through">
                            ₹
                            {Number(
                              product.compare_price
                            ).toLocaleString(
                              'en-IN'
                            )}
                          </p>
                        )}

                      </td>

                      {/* STOCK */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <span className="min-w-[45px] text-sm font-black">
                            {product.stock_quantity ??
                              '—'}
                          </span>

                          <StockStatus
                            product={
                              product
                            }
                          />

                        </div>

                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">

                        {product.is_active ? (
                          <span className="inline-flex rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-green-600">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-500">
                            Inactive
                          </span>
                        )}

                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <Link
                            href={`/product/${product.slug}`}
                            target="_blank"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white transition hover:border-black"
                          >
                            <Eye
                              size={15}
                            />
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              openStockEditor(
                                product
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white transition hover:border-black"
                          >
                            <Pencil
                              size={15}
                            />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

          {/* ================================================= */}
          {/* MOBILE CARDS */}
          {/* ================================================= */}

          <div className="divide-y divide-neutral-100 md:hidden">

            {filteredProducts.map(
              (product) => (
                <div
                  key={product.id}
                  className="p-4"
                >

                  <div className="flex gap-4">

                    <img
                      src={
                        product.image_url
                      }
                      alt={
                        product.name
                      }
                      className="h-24 w-20 shrink-0 rounded-2xl bg-neutral-100 object-cover"
                    />

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-2">

                        <div className="min-w-0">

                          <h3 className="line-clamp-2 text-sm font-black">
                            {product.name}
                          </h3>

                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            {product.gender ||
                              'General'}
                          </p>

                        </div>

                        {product.badge ===
                          'TRENDING' && (
                          <span className="shrink-0 rounded-full bg-black px-2 py-1 text-[8px] font-black uppercase text-white">
                            Trending
                          </span>
                        )}

                      </div>

                      <div className="mt-3 flex items-center justify-between">

                        <div>

                          <p className="text-sm font-black">
                            ₹
                            {Number(
                              product.base_price ||
                                0
                            ).toLocaleString(
                              'en-IN'
                            )}
                          </p>

                          <p className="mt-1 text-xs text-neutral-400">
                            Stock:{' '}
                            <strong className="text-neutral-900">
                              {product.stock_quantity ??
                                'Not set'}
                            </strong>
                          </p>

                        </div>

                        <StockStatus
                          product={
                            product
                          }
                        />

                      </div>

                    </div>

                  </div>

                  <div className="mt-4 flex gap-2">

                    <Link
                      href={`/product/${product.slug}`}
                      className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 text-xs font-black"
                    >
                      <Eye size={14} />
                      View
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        openStockEditor(
                          product
                        )
                      }
                      className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-black text-xs font-black text-white"
                    >
                      <Pencil size={14} />
                      Edit Stock
                    </button>

                  </div>

                </div>
              )
            )}

          </div>

          {/* EMPTY */}

          {filteredProducts.length ===
            0 && (
            <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
                <Package
                  size={25}
                  className="text-neutral-400"
                />
              </div>

              <h3 className="mt-5 text-lg font-black">
                No products found
              </h3>

              <p className="mt-2 max-w-sm text-sm text-neutral-500">
                Try changing your search
                or inventory filters.
              </p>

            </div>
          )}

        </div>

      </div>

      {/* =================================================== */}
      {/* STOCK EDIT MODAL */}
      {/* =================================================== */}

      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                  Inventory
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Update Stock
                </h2>

              </div>

              <button
                type="button"
                onClick={
                  closeStockEditor
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 transition hover:bg-neutral-200"
              >
                <X size={17} />
              </button>

            </div>

            <div className="p-6">

              <div className="flex items-center gap-4 rounded-2xl bg-neutral-50 p-4">

                <img
                  src={
                    editingProduct.image_url
                  }
                  alt={
                    editingProduct.name
                  }
                  className="h-16 w-14 rounded-xl object-cover"
                />

                <div className="min-w-0">

                  <p className="line-clamp-2 text-sm font-black">
                    {
                      editingProduct.name
                    }
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    {
                      editingProduct.gender
                    }
                  </p>

                </div>

              </div>

              <label className="mt-6 block">

                <span className="mb-2 block text-xs font-black uppercase tracking-wider">
                  Stock Quantity
                </span>

                <input
                  type="number"
                  min="0"
                  value={stockValue}
                  onChange={(event) =>
                    setStockValue(
                      event.target.value
                    )
                  }
                  placeholder="Enter quantity"
                  className="h-14 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-lg font-black outline-none transition focus:border-black focus:bg-white"
                />

              </label>

              <div className="mt-6 flex gap-3">

                <button
                  type="button"
                  onClick={
                    closeStockEditor
                  }
                  className="h-12 flex-1 rounded-2xl border border-neutral-200 text-sm font-black transition hover:border-black"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    saveStock
                  }
                  disabled={saving}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-black text-sm font-black text-white transition hover:bg-neutral-800 disabled:opacity-50"
                >

                  {saving ? (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={16} />
                  )}

                  {saving
                    ? 'Saving...'
                    : 'Save Stock'}

                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  icon: Icon,
  title,
  value,
  description,
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-neutral-200/70 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100 transition group-hover:scale-110">
          <Icon size={19} />
        </div>

        <span className="text-[9px] font-black uppercase tracking-wider text-neutral-300">
          Live
        </span>

      </div>

      <div className="mt-5">

        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">
          {title}
        </p>

        <p className="mt-1 text-3xl font-black tracking-tight">
          {value}
        </p>

        <p className="mt-1 text-xs text-neutral-400">
          {description}
        </p>

      </div>

    </div>
  )
}