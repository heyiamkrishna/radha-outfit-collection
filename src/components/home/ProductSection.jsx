import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

function ProductCard({ product }) {
  const image =
    product?.product_images?.[0]?.image_url ||
    product?.image_url ||
    '/placeholder-product.jpg'

  const price = Number(product?.base_price || 0)
  const comparePrice = Number(product?.compare_price || 0)

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100">
        <img
          src={image}
          alt={product.name || 'Product'}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-black backdrop-blur-md">
            {product.badge}
          </span>
        )}

        <div className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowRight size={15} />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="line-clamp-1 text-sm font-bold text-neutral-900">
          {product.name}
        </h3>

        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm font-bold">
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

function ProductSkeleton() {
  return (
    <div>
      <div className="aspect-[3/4] animate-pulse rounded-2xl bg-neutral-200" />

      <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-neutral-200" />

      <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-neutral-200" />
    </div>
  )
}

export default function ProductSection({
  title,
  products = [],
  href,
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <div className="mb-8 flex items-end justify-between gap-4 border-b border-neutral-200 pb-4 md:mb-10">
        <div>
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400">
            Radha Outfit Collection
          </p>

          <h2 className="font-[family-name:var(--font-syne)] text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl md:text-5xl">
            {title}
          </h2>
        </div>

        <Link
          href={href}
          className="group hidden items-center gap-2 text-xs font-bold uppercase tracking-wide text-neutral-700 transition-colors hover:text-black sm:flex"
        >
          View More

          <ArrowRight
            size={15}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-4 md:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      )}

      <Link
        href={href}
        className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-neutral-200 text-xs font-bold uppercase tracking-wide sm:hidden"
      >
        View More
        <ArrowRight size={14} />
      </Link>
    </section>
  )
}