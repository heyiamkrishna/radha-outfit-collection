import Link from 'next/link'
import {
  Plus,
  Package,
  Search,
  ArrowUpRight,
  Image as ImageIcon,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import ProductTable from '@/components/admin/products/ProductTable'

export const dynamic = 'force-dynamic'

async function getProducts() {
  const supabase = await createClient()

  /*
   * IMPORTANT
   * Do NOT request:
   *   product_images.is_primary
   *
   * Your current product_images schema uses:
   *   image_url
   *   alt_text
   *   sort_order
   */

  const {
    data,
    error,
  } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      description,
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
      'Admin products error:',
      error.message
    )

    return {
      products: [],
      error: error.message,
    }
  }

  const products = (data || []).map(
    (product) => {
      const sortedImages = [
        ...(product.product_images || []),
      ].sort(
        (a, b) =>
          Number(a?.sort_order || 0) -
          Number(b?.sort_order || 0)
      )

      return {
        ...product,

        product_images:
          sortedImages,

        /*
         * Convenience image for ProductTable.
         */
        image_url:
          sortedImages[0]?.image_url ||
          null,
      }
    }
  )

  return {
    products,
    error: null,
  }
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-black tracking-tight text-neutral-950">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs font-medium text-neutral-400">
              {description}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 transition group-hover:bg-black group-hover:text-white">
          <Icon size={19} />
        </div>

      </div>
    </div>
  )
}

function EmptyProducts() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-white px-6 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
        <Package
          size={28}
          className="text-neutral-400"
        />
      </div>

      <h2 className="mt-5 text-xl font-black text-neutral-950">
        No products yet
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
        Your product catalog is empty.
        Create your first product to start
        building your store.
      </p>

      <Link
        href="/admin/products/new"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:-translate-y-0.5 hover:bg-neutral-800"
      >
        <Plus size={16} />
        Add Product
      </Link>

    </div>
  )
}

export default async function ProductsPage() {
  const {
    products,
    error,
  } = await getProducts()

  const safeProducts =
    Array.isArray(products)
      ? products
      : []

  const activeProducts =
    safeProducts.filter(
      (product) =>
        product.is_active === true
    ).length

  const inactiveProducts =
    safeProducts.filter(
      (product) =>
        product.is_active === false
    ).length

  const trendingProducts =
    safeProducts.filter(
      (product) =>
        product.badge === 'TRENDING'
    ).length

  return (
    <div className="min-h-screen bg-[#f7f7f5]">

      {/* PAGE HEADER */}

      <div className="border-b border-neutral-200 bg-white">

        <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8 lg:px-10">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
                <Link
                  href="/admin"
                  className="transition hover:text-black"
                >
                  Dashboard
                </Link>

                <span>/</span>

                <span className="text-neutral-800">
                  Products
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-neutral-950 md:text-4xl">
                Products
              </h1>

              <p className="mt-1 max-w-xl text-sm text-neutral-500">
                Manage your clothing catalog,
                pricing, availability and
                product images.
              </p>

            </div>

            <div className="flex items-center gap-3">

              <Link
                href="/shop"
                target="_blank"
                className="hidden items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs font-black text-neutral-700 transition hover:border-black hover:text-black sm:flex"
              >
                View Store
                <ArrowUpRight size={15} />
              </Link>

              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-neutral-800"
              >
                <Plus size={17} />
                Add Product
              </Link>

            </div>

          </div>

        </div>

      </div>

      {/* MAIN CONTENT */}

      <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-8 lg:px-10">

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">

            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                !
              </div>

              <div>

                <p className="text-sm font-black text-red-800">
                  Unable to load products
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600">
                  {error}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* STATS */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Products"
            value={safeProducts.length}
            description="All catalog products"
            icon={Package}
          />

          <StatCard
            title="Active"
            value={activeProducts}
            description="Visible in storefront"
            icon={Package}
          />

          <StatCard
            title="Trending"
            value={trendingProducts}
            description="Featured products"
            icon={ArrowUpRight}
          />

          <StatCard
            title="Inactive"
            value={inactiveProducts}
            description="Hidden products"
            icon={ImageIcon}
          />

        </section>

        {/* SEARCH / TOOLBAR */}

        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div className="relative w-full max-w-md">

              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                type="text"
                placeholder="Search products..."
                className="h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-sm font-medium outline-none transition placeholder:text-neutral-400 focus:border-black focus:bg-white"
              />

            </div>

            <div className="flex items-center gap-2">

              <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-500">
                {safeProducts.length}{' '}
                Products
              </span>

            </div>

          </div>

        </section>

        {/* PRODUCT TABLE */}

        <section className="mt-6">

          {safeProducts.length === 0 ? (
            <EmptyProducts />
          ) : (
            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">

              <ProductTable
                products={
                  safeProducts
                }
              />

            </div>
          )}

        </section>

      </main>

    </div>
  )
}