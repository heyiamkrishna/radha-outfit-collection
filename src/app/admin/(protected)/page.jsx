import Link from 'next/link'
import {
  Plus,
  Package,
  TrendingUp,
  Eye,
  Pencil,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import ProductTable from '@/components/admin/products/ProductTable'

export const dynamic = 'force-dynamic'

async function getProducts() {
  const supabase = await createClient()

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
      'Admin products error:',
      JSON.stringify(error, null, 2)
    )

    return {
      products: [],
      error: error.message,
    }
  }

  return {
    products: data || [],
    error: null,
  }
}

export default async function ProductsPage() {
  const {
    products,
    error,
  } = await getProducts()

  const safeProducts = Array.isArray(products)
    ? products
    : []

  const activeProducts = safeProducts.filter(
    (product) => product.is_active === true
  )

  const trendingProducts = safeProducts.filter(
    (product) => product.badge === 'TRENDING'
  )

  const totalValue = safeProducts.reduce(
    (total, product) =>
      total + Number(product.base_price || 0),
    0
  )

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-neutral-900">

      {/* HEADER */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                Admin / Store
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">
                Products
              </h1>

              <p className="mt-1 text-sm text-neutral-500">
                Manage your clothing catalog and product visibility.
              </p>
            </div>

            <Link
              href="/admin/products/new"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-neutral-800"
            >
              <Plus size={17} />
              Add Product
            </Link>

          </div>

        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-bold text-red-700">
              Unable to load products
            </p>

            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* STATS */}
        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={<Package size={19} />}
            label="Total Products"
            value={safeProducts.length}
          />

          <StatCard
            icon={<Eye size={19} />}
            label="Active Products"
            value={activeProducts.length}
          />

          <StatCard
            icon={<TrendingUp size={19} />}
            label="Trending"
            value={trendingProducts.length}
          />

          <StatCard
            icon={<span className="text-sm font-black">₹</span>}
            label="Catalog Value"
            value={`₹${totalValue.toLocaleString('en-IN')}`}
          />

        </section>

        {/* PRODUCT TABLE */}
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">

          <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-base font-black text-neutral-950">
                  Product Catalog
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  {safeProducts.length} products in your catalog
                </p>
              </div>

              <Link
                href="/shop"
                target="_blank"
                className="hidden items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-bold text-neutral-700 transition hover:border-black hover:text-black sm:flex"
              >
                <Eye size={14} />
                View Store
              </Link>

            </div>
          </div>

          {safeProducts.length === 0 ? (
            <EmptyProducts />
          ) : (
            <ProductTable products={safeProducts} />
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
  icon,
  label,
  value,
}) {
  return (
    <div className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 transition group-hover:bg-black group-hover:text-white">
          {icon}
        </div>

      </div>

      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black tracking-tight text-neutral-950">
        {value}
      </p>

    </div>
  )
}


/* =========================
   EMPTY STATE
========================= */

function EmptyProducts() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
        <Package
          size={27}
          className="text-neutral-400"
        />
      </div>

      <h3 className="mt-5 text-lg font-black text-neutral-950">
        No products yet
      </h3>

      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        Add your first product to start building your
        Radha Outfit Collection catalog.
      </p>

      <Link
        href="/admin/products/new"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
      >
        <Plus size={16} />
        Add Product
      </Link>

    </div>
  )
}