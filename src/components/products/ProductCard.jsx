'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ProductCard({ product }) {
  if (!product) return null

  const image =
    product?.product_images?.[0]?.image_url ||
    product?.image_url ||
    '/images/placeholder-product.jpg'

  const price = Number(product?.base_price || 0)
  const comparePrice = Number(product?.compare_price || 0)

  const hasDiscount =
    comparePrice > 0 && comparePrice > price

  const discount = hasDiscount
    ? Math.round(
        ((comparePrice - price) / comparePrice) * 100
      )
    : 0

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group min-w-0"
    >
      <Link
        href={`/shop/${product.slug}`}
        className="block"
      >
        {/* IMAGE */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-neutral-100">

          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.045 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Image
              src={image}
              alt={product.name || 'Product'}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
              className="object-cover"
            />
          </motion.div>

          {/* IMAGE GRADIENT */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* BADGE */}
          {product.badge && (
            <div className="absolute left-3 top-3">
              <span className="rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-black shadow-sm backdrop-blur-md">
                {product.badge}
              </span>
            </div>
          )}

          {/* DISCOUNT */}
          {discount > 0 && (
            <div className="absolute right-3 top-3">
              <span className="rounded-full bg-black px-3 py-1.5 text-[9px] font-black text-white">
                -{discount}%
              </span>
            </div>
          )}

          {/* QUICK VIEW */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileHover={{ y: 0 }}
            className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <div className="flex h-11 items-center justify-center gap-2 rounded-full bg-white/90 text-xs font-black uppercase tracking-wide text-black shadow-xl backdrop-blur-xl">
              <ShoppingBag size={15} />
              View Product
            </div>
          </motion.div>

          {/* CORNER ARROW */}
          <div className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={17} />
          </div>
        </div>

        {/* PRODUCT INFO */}
        <div className="px-1 pt-4">

          <div className="flex items-start justify-between gap-3">

            <h3 className="line-clamp-2 font-[family-name:var(--font-syne)] text-sm font-bold leading-tight text-neutral-950 sm:text-base">
              {product.name}
            </h3>

            <ArrowUpRight
              size={16}
              className="mt-0.5 shrink-0 text-neutral-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-black"
            />

          </div>

          <div className="mt-2 flex items-center gap-2">

            <span className="text-sm font-black text-neutral-950">
              ₹{price.toLocaleString('en-IN')}
            </span>

            {hasDiscount && (
              <span className="text-xs font-medium text-neutral-400 line-through">
                ₹{comparePrice.toLocaleString('en-IN')}
              </span>
            )}

          </div>

        </div>
      </Link>
    </motion.article>
  )
}