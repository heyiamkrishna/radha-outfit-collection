'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export default function HomeProductCard({ product }) {
  const image =
    product?.product_images?.[0]?.image_url ||
    product?.image_url ||
    '/images/placeholder-product.jpg'

  const price =
    product?.base_price ??
    product?.price ??
    0

  const comparePrice =
    product?.compare_price ??
    product?.compareAtPrice ??
    null

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100 sm:rounded-3xl">
        <img
          src={image}
          alt={product.name || 'Product'}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-black backdrop-blur-md">
            {product.badge}
          </span>
        )}

        <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={15} />
        </span>
      </div>

      <div className="pt-4">
        <h3 className="truncate text-sm font-semibold text-neutral-900 sm:text-base">
          {product.name}
        </h3>

        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm font-bold text-neutral-900">
            ₹{Number(price).toLocaleString('en-IN')}
          </span>

          {comparePrice &&
            Number(comparePrice) > Number(price) && (
              <span className="text-xs text-neutral-400 line-through">
                ₹
                {Number(comparePrice).toLocaleString(
                  'en-IN'
                )}
              </span>
            )}
        </div>
      </div>
    </Link>
  )
}