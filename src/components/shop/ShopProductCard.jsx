import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function ShopProductCard({ product }) {
  if (!product?.slug) return null

  const image =
    product?.product_images?.[0]?.image_url ||
    product?.image_url ||
    '/placeholder-product.jpg'

  const price = Number(product?.base_price || 0)
  const comparePrice = Number(product?.compare_price || 0)

  const discount =
    comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100">
        <img
          src={image}
          alt={product?.name || 'Product'}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {product?.badge === 'TRENDING' && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-black backdrop-blur-md">
            Trending
          </span>
        )}

        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-black px-3 py-1.5 text-[9px] font-bold text-white">
            {discount}% OFF
          </span>
        )}

        <div className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowRight size={15} />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-neutral-900">
          {product?.name}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-bold text-neutral-900">
            ₹{price.toLocaleString('en-IN')}
          </span>

          {comparePrice > price && (
            <span className="text-xs text-neutral-400 line-through">
              ₹{comparePrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}