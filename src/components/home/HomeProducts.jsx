'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import HomeProductCard from './HomeProductCard'

const SECTION_LIMIT = 4

function ProductSection({
  title,
  href,
  products,
  loading,
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-12">
      <div className="mb-8 flex items-end justify-between border-b border-neutral-200 pb-4 sm:mb-10">
        <div>
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400">
            Radha Collection
          </p>

          <h2 className="font-[family-name:var(--font-syne)] text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl md:text-5xl">
            {title}
          </h2>
        </div>

        <Link
          href={href}
          className="hidden text-xs font-bold uppercase tracking-wide text-neutral-700 transition-opacity hover:opacity-50 sm:block"
        >
          View More →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item}>
              <div className="aspect-[3/4] animate-pulse rounded-2xl bg-neutral-100 sm:rounded-3xl" />

              <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-neutral-100" />

              <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-neutral-100" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6 md:gap-y-10">
          {products.map((product) => (
            <HomeProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-neutral-200 px-6 py-16 text-center">
          <p className="text-sm text-neutral-400">
            No products available yet.
          </p>
        </div>
      )}

      <Link
        href={href}
        className="mt-8 flex w-full items-center justify-center rounded-full border border-neutral-200 py-3 text-xs font-bold uppercase tracking-wide text-neutral-800 sm:hidden"
      >
        View More
      </Link>
    </section>
  )
}

export default function HomeProducts({
  initialTrending = [],
  initialMen = [],
  initialWomen = [],
  initialKids = [],
}) {
  const [trending, setTrending] =
    useState(initialTrending)

  const [men, setMen] =
    useState(initialMen)

  const [women, setWomen] =
    useState(initialWomen)

  const [kids, setKids] =
    useState(initialKids)

  const [loading, setLoading] =
    useState(false)

  const refreshProducts = useCallback(async () => {
    try {
      setLoading(true)

      const response = await fetch(
        '/api/home-products',
        {
          method: 'GET',
          cache: 'no-store',
        }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to refresh products'
        )
      }

      const data = await response.json()

      setTrending(data.trending || [])
      setMen(data.men || [])
      setWomen(data.women || [])
      setKids(data.kids || [])
    } catch (error) {
      console.error(
        'Realtime product refresh error:',
        error
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('homepage-products-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          refreshProducts()
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
          refreshProducts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshProducts])

  return (
    <>
      <section className="pt-8 sm:pt-12 md:pt-16">
  <ProductSection
    title="Trending Wear"
    products={trending}
    href="/shop?trending=true"
  />
</section>

<section
  className="
    mt-4
    bg-neutral-50
    py-2
    sm:mt-8
  "
>
  <ProductSection
    title="Men's Wear"
    products={men}
    href="/shop?gender=MEN"
  />
</section>

<section className="py-2">
  <ProductSection
    title="Women's Wear"
    products={women}
    href="/shop?gender=WOMEN"
  />
</section>

<section className="bg-neutral-50 py-2">
  <ProductSection
    title="Kids Wear"
    products={kids}
    href="/shop?gender=KIDS"
  />
</section>
    </>
  )
}