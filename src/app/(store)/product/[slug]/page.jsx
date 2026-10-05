'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  ChevronLeft,
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Loader2,
  Share2,
  Zap,
  ArrowLeft,
} from 'lucide-react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import Navbar from '@/components/navbar/Navbar'

const FALLBACK_IMAGE =
  'https://placehold.co/600x760/f5f5f5/999999?text=Radha+Outfit'

export default function ProductPage({ params }) {
  const { slug } = use(params)

  const router = useRouter()
  const supabase = createClient()

  const { addToCart, setIsCartOpen } = useCartStore()

  const [product, setProduct] = useState(null)
  const [images, setImages] = useState([])

  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [quantity, setQuantity] = useState(1)

  // =========================================================
  // FETCH PRODUCT
  // =========================================================

  useEffect(() => {
    let cancelled = false

    async function fetchProduct() {
      try {
        setLoading(true)
        setFetchError('')

        /*
         * IMPORTANT
         *
         * Only request columns that exist in your products table.
         *
         * We intentionally DO NOT request:
         * image_url
         * images
         * colors
         * sizes
         * stock
         */

        const { data, error } = await supabase
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
            is_active
          `)
          .eq('slug', slug)
          .eq('is_active', true)
          .maybeSingle()

        if (cancelled) return

        if (error) {
          console.error(
            'PRODUCT SUPABASE ERROR:',
            JSON.stringify(error, null, 2)
          )

          setFetchError(
            error.message || 'Unable to load this product.'
          )

          return
        }

        if (!data) {
          setFetchError('This product could not be found.')
          return
        }

        setProduct(data)

        // =====================================================
        // FETCH PRODUCT IMAGES
        // =====================================================

        const {
          data: imageData,
          error: imageError,
        } = await supabase
          .from('product_images')
          .select(`
            image_url,
            alt_text,
            sort_order
          `)
          .eq('product_id', data.id)
          .order('sort_order', {
            ascending: true,
          })

        if (imageError) {
          console.error(
            'PRODUCT IMAGE ERROR:',
            JSON.stringify(imageError, null, 2)
          )
        }

        let productImages = []

        if (
          !imageError &&
          Array.isArray(imageData)
        ) {
          productImages = imageData
            .map((image) => image?.image_url)
            .filter(Boolean)
        }

        if (productImages.length === 0) {
          productImages = [FALLBACK_IMAGE]
        }

        setImages(productImages)
        setCurrentIndex(0)
      } catch (error) {
        console.error(
          'PRODUCT FETCH EXCEPTION:',
          error
        )

        if (!cancelled) {
          setFetchError(
            error?.message ||
              'Something went wrong while loading the product.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (slug) {
      fetchProduct()
    }

    return () => {
      cancelled = true
    }
  }, [slug])

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafafa]">
        <Navbar />

        <div className="flex min-h-[75vh] items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm">
              <Loader2
                size={22}
                className="animate-spin text-neutral-500"
              />
            </div>

            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
              Loading Product
            </p>
          </motion.div>
        </div>
      </main>
    )
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (fetchError || !product) {
    return (
      <main className="min-h-screen bg-[#fafafa]">
        <Navbar />

        <div className="flex min-h-[75vh] items-center justify-center px-5">
          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="w-full max-w-md rounded-[2rem] border border-neutral-200 bg-white p-8 text-center shadow-sm md:p-10"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <ShoppingBag
                size={25}
                className="text-neutral-500"
              />
            </div>

            <h1 className="mt-6 text-2xl font-black tracking-tight text-neutral-950">
              Product Not Found
            </h1>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              {fetchError ||
                'This product is no longer available.'}
            </p>

            <p className="mt-3 break-all text-[10px] text-neutral-400">
              /product/{slug}
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-xs font-black text-white transition hover:scale-[1.02]"
            >
              <ArrowLeft size={14} />
              Back to Shop
            </Link>
          </motion.div>
        </div>
      </main>
    )
  }

  // =========================================================
  // PRODUCT VALUES
  // =========================================================

  const price = Number(product.base_price || 0)

  const comparePrice = Number(
    product.compare_price || 0
  )

  const discountPercentage =
    comparePrice > price
      ? Math.round(
          ((comparePrice - price) /
            comparePrice) *
            100
        )
      : 0

  // Your current schema does not have confirmed stock.
  const isOutOfStock = false

  // =========================================================
  // QUANTITY
  // =========================================================

  const decreaseQuantity = () => {
    setQuantity((previous) =>
      Math.max(1, previous - 1)
    )
  }

  const increaseQuantity = () => {
    setQuantity((previous) =>
      Math.min(10, previous + 1)
    )
  }

  // =========================================================
  // CART
  // =========================================================

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('This product is out of stock.')
      return
    }

    addToCart(
      product,
      '',
      '',
      quantity,
      price
    )

    toast.success(
      `${quantity} × ${product.name} added to cart`
    )
  }

  const handleBuyNow = () => {
    if (isOutOfStock) {
      toast.error('This product is out of stock.')
      return
    }

    addToCart(
      product,
      '',
      '',
      quantity,
      price
    )

    setIsCartOpen(false)

    router.push('/checkout')
  }

  // =========================================================
  // SHARE
  // =========================================================

  const handleShare = async () => {
    const url =
      typeof window !== 'undefined'
        ? window.location.href
        : ''

    if (
      typeof navigator !== 'undefined' &&
      navigator.share
    ) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} at Radha Outfit Collection!`,
          url,
        })
      } catch {
        // User cancelled sharing.
      }

      return
    }

    try {
      await navigator.clipboard.writeText(url)

      toast.success(
        'Product link copied!'
      )
    } catch {
      toast.error(
        'Unable to copy product link.'
      )
    }
  }

  // =========================================================
  // SLIDER
  // =========================================================

  const paginate = (newDirection) => {
    if (images.length <= 1) return

    setDirection(newDirection)

    setCurrentIndex(
      (previous) =>
        (previous +
          newDirection +
          images.length) %
        images.length
    )
  }

  // =========================================================
  // ANIMATIONS
  // =========================================================

  const slideVariants = {
    enter: (slideDirection) => ({
      x:
        slideDirection > 0
          ? '100%'
          : '-100%',
      opacity: 0,
    }),

    center: {
      x: 0,
      opacity: 1,
      zIndex: 1,
    },

    exit: (slideDirection) => ({
      x:
        slideDirection < 0
          ? '100%'
          : '-100%',
      opacity: 0,
      zIndex: 0,
    }),
  }

  const containerVariants = {
    hidden: {
      opacity: 0,
    },

    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 15,
    },

    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="min-h-screen bg-[#fafafa] pb-28 md:pb-16">

      {/* NAVBAR */}

      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 md:px-8 lg:px-10">

        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: -8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex min-w-0 items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-neutral-400">

            <Link
              href="/"
              className="transition hover:text-black"
            >
              Home
            </Link>

            <ChevronRight size={11} />

            <Link
              href="/shop"
              className="transition hover:text-black"
            >
              Shop
            </Link>

            <ChevronRight size={11} />

            <span className="truncate text-neutral-800">
              {product.gender ||
                'Collection'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 text-[10px] font-black text-neutral-700 shadow-sm transition hover:border-black"
          >
            <Share2 size={13} />

            <span className="hidden sm:block">
              Share
            </span>
          </button>
        </motion.div>

        {/* =================================================
            PRODUCT
        ================================================= */}

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[450px_minmax(0,1fr)]">

          {/* =================================================
              IMAGE AREA
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.55,
            }}
            className="lg:sticky lg:top-24"
          >

            <div className="flex flex-col gap-3 sm:flex-row">

              {/* THUMBNAILS */}

              {images.length > 1 && (
                <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:w-[62px] sm:flex-col sm:overflow-visible">

                  {images.map(
                    (
                      image,
                      index
                    ) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => {
                          setDirection(
                            index >
                              currentIndex
                              ? 1
                              : -1
                          )

                          setCurrentIndex(
                            index
                          )
                        }}
                        className={`
                          relative
                          h-[68px]
                          w-[52px]
                          shrink-0
                          overflow-hidden
                          rounded-lg
                          border
                          bg-white
                          transition-all
                          duration-300
                          sm:h-[76px]
                          sm:w-[62px]
                          ${
                            currentIndex ===
                            index
                              ? 'border-black shadow-sm'
                              : 'border-neutral-200 opacity-45 hover:opacity-100'
                          }
                        `}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    )
                  )}

                </div>
              )}

              {/* MAIN IMAGE */}

              <div className="order-1 mx-auto w-full max-w-[360px] sm:order-2 sm:max-w-[370px]">

                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-neutral-100 shadow-[0_15px_50px_rgba(0,0,0,0.06)]">

                  <AnimatePresence
                    initial={false}
                    custom={direction}
                    mode="sync"
                  >
                    <motion.img
                      key={`${images[currentIndex]}-${currentIndex}`}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: {
                          type: 'spring',
                          stiffness: 280,
                          damping: 30,
                        },
                        opacity: {
                          duration: 0.2,
                        },
                      }}
                      drag="x"
                      dragConstraints={{
                        left: 0,
                        right: 0,
                      }}
                      dragElastic={0.75}
                      onDragEnd={(
                        event,
                        { offset }
                      ) => {
                        if (
                          offset.x < -70
                        ) {
                          paginate(1)
                        }

                        if (
                          offset.x > 70
                        ) {
                          paginate(-1)
                        }
                      }}
                      src={
                        images[
                          currentIndex
                        ]
                      }
                      alt={product.name}
                      className="absolute inset-0 h-full w-full cursor-grab object-cover active:cursor-grabbing"
                    />
                  </AnimatePresence>

                  {/* TRENDING */}

                  {product.badge ===
                    'TRENDING' && (
                    <div className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-black shadow-sm backdrop-blur">
                      Trending
                    </div>
                  )}

                  {/* DISCOUNT */}

                  {discountPercentage >
                    0 && (
                    <div className="absolute right-3 top-3 z-10 rounded-full bg-black px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.15em] text-white">
                      -{discountPercentage}%
                    </div>
                  )}

                  {/* ARROWS */}

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          paginate(-1)
                        }
                        className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/85 shadow-md backdrop-blur transition hover:scale-105"
                      >
                        <ChevronLeft
                          size={15}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          paginate(1)
                        }
                        className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/85 shadow-md backdrop-blur transition hover:scale-105"
                      >
                        <ChevronRight
                          size={15}
                        />
                      </button>
                    </>
                  )}

                  {/* COUNTER */}

                  {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/65 px-2.5 py-1 text-[8px] font-black text-white backdrop-blur">
                      {currentIndex + 1} /{' '}
                      {images.length}
                    </div>
                  )}
                </div>

                {/* IMAGE DOTS */}

                {images.length > 1 && (
                  <div className="mt-3 flex justify-center gap-1.5">
                    {images.map(
                      (_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() =>
                            setCurrentIndex(
                              index
                            )
                          }
                          className={`h-1 rounded-full transition-all ${
                            index ===
                            currentIndex
                              ? 'w-5 bg-black'
                              : 'w-1.5 bg-neutral-300'
                          }`}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* =================================================
              DETAILS
          ================================================= */}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-[0_15px_50px_rgba(0,0,0,0.035)] sm:p-7 md:p-8"
          >

            {/* CATEGORY */}

            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-black" />

              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-400">
                {product.gender ||
                  'Collection'}
              </span>
            </motion.div>

            {/* NAME */}

            <motion.h1
              variants={itemVariants}
              className="mt-3 max-w-2xl text-2xl font-black leading-tight tracking-tight text-neutral-950 sm:text-3xl md:text-4xl"
            >
              {product.name}
            </motion.h1>

            {/* PRICE */}

            <motion.div
              variants={itemVariants}
              className="mt-5 flex flex-wrap items-center gap-3"
            >
              <span className="text-2xl font-black text-black sm:text-3xl">
                ₹
                {price.toLocaleString(
                  'en-IN'
                )}
              </span>

              {comparePrice > price && (
                <>
                  <span className="text-sm font-medium text-neutral-400 line-through">
                    ₹
                    {comparePrice.toLocaleString(
                      'en-IN'
                    )}
                  </span>

                  {discountPercentage >
                    0 && (
                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-green-600">
                      {discountPercentage}%
                      OFF
                    </span>
                  )}
                </>
              )}
            </motion.div>

            {/* DESCRIPTION */}

            <motion.p
              variants={itemVariants}
              className="mt-5 max-w-xl text-sm leading-6 text-neutral-500"
            >
              {product.description ||
                'Premium quality apparel designed for comfort and everyday style.'}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="my-7 h-px bg-neutral-100"
            />

            {/* COLLECTION */}

            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3.5"
            >
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
                Collection
              </span>

              <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-neutral-800 shadow-sm">
                {product.gender ||
                  'General'}
              </span>
            </motion.div>

            {/* QUANTITY */}

            <motion.div
              variants={itemVariants}
              className="mt-7"
            >
              <p className="mb-3 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
                Quantity
              </p>

              <div className="flex h-11 w-32 items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-1">

                <button
                  type="button"
                  onClick={
                    decreaseQuantity
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white hover:shadow-sm"
                >
                  <Minus size={14} />
                </button>

                <span className="text-xs font-black">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={
                    increaseQuantity
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white hover:shadow-sm"
                >
                  <Plus size={14} />
                </button>
              </div>
            </motion.div>

            {/* ACTIONS */}

            <motion.div
              variants={itemVariants}
              className="mt-7 grid grid-cols-[1fr_1.35fr] gap-2.5"
            >
              <button
                type="button"
                onClick={
                  handleAddToCart
                }
                disabled={isOutOfStock}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white text-xs font-black text-neutral-900 transition hover:border-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag size={16} />

                <span>
                  Add to Cart
                </span>
              </button>

              <button
                type="button"
                onClick={
                  handleBuyNow
                }
                disabled={isOutOfStock}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-black text-xs font-black text-white transition hover:bg-neutral-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Zap
                  size={15}
                  className="fill-white"
                />

                {isOutOfStock
                  ? 'Out of Stock'
                  : 'Buy It Now'}
              </button>
            </motion.div>

            {/* BENEFITS */}

            <motion.div
              variants={itemVariants}
              className="mt-7 grid grid-cols-3 divide-x divide-neutral-200 rounded-2xl border border-neutral-100 bg-neutral-50 py-4"
            >
              <div className="flex flex-col items-center gap-1.5 px-2 text-center">
                <Truck
                  size={16}
                  className="text-neutral-700"
                />

                <span className="text-[8px] font-black uppercase tracking-wider text-neutral-500">
                  Shipping
                </span>
              </div>

              <div className="flex flex-col items-center gap-1.5 px-2 text-center">
                <RotateCcw
                  size={16}
                  className="text-neutral-700"
                />

                <span className="text-[8px] font-black uppercase tracking-wider text-neutral-500">
                  7-Day Return
                </span>
              </div>

              <div className="flex flex-col items-center gap-1.5 px-2 text-center">
                <ShieldCheck
                  size={16}
                  className="text-neutral-700"
                />

                <span className="text-[8px] font-black uppercase tracking-wider text-neutral-500">
                  Secure Pay
                </span>
              </div>
            </motion.div>

            {/* SMALL NOTE */}

            <motion.div
              variants={itemVariants}
              className="mt-5 text-center"
            >
              <p className="text-[9px] font-medium text-neutral-400">
                COD available • Easy
                returns • Secure checkout
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}