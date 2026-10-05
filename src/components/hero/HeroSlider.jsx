'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

export default function HeroSlider() {
  const supabase = createClient()

  const [slides, setSlides] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)

  /*
   * ============================================================
   * LOAD SLIDES
   * ============================================================
   */

  const loadSlides = useCallback(async () => {
    try {
      setLoading(true)

      const {
        data,
        error,
      } = await supabase
        .from('hero_slides')
        .select(`
          id,
          title,
          subtitle,
          description,
          image_url,
          mobile_image_url,
          button_text,
          button_url,
          sort_order,
          is_active
        `)
        .eq('is_active', true)
        .order('sort_order', {
          ascending: true,
        })

      if (error) {
        console.error(
          'HERO SLIDER ERROR:',
          JSON.stringify(error, null, 2)
        )

        setSlides([])
        return
      }

      setSlides(data || [])
      setCurrentIndex(0)
    } catch (error) {
      console.error(
        'HERO SLIDER EXCEPTION:',
        error
      )

      setSlides([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  /*
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */

  useEffect(() => {
    loadSlides()
  }, [loadSlides])

  /*
   * ============================================================
   * REALTIME
   * ============================================================
   */

  useEffect(() => {
    const channel = supabase
      .channel('hero-slides-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hero_slides',
        },
        () => {
          loadSlides()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadSlides, supabase])

  /*
   * ============================================================
   * AUTO SLIDER
   * ============================================================
   */

  useEffect(() => {
    if (slides.length <= 1) {
      return
    }

    const interval = setInterval(() => {
      setCurrentIndex(
        (previous) =>
          (previous + 1) % slides.length
      )
    }, 6000)

    return () => clearInterval(interval)
  }, [slides.length])

  /*
   * ============================================================
   * RESET IMAGE LOADED STATE
   * ============================================================
   */

  useEffect(() => {
    setImageLoaded(false)
  }, [currentIndex])

  /*
   * ============================================================
   * NAVIGATION
   * ============================================================
   */

  const nextSlide = () => {
    if (!slides.length) return

    setCurrentIndex(
      (previous) =>
        (previous + 1) % slides.length
    )
  }

  const previousSlide = () => {
    if (!slides.length) return

    setCurrentIndex(
      (previous) =>
        (previous - 1 + slides.length) %
        slides.length
    )
  }

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <section className="px-3 py-4 md:px-6 lg:px-8">
        <div className="relative mx-auto h-[520px] max-w-[1500px] overflow-hidden rounded-[28px] bg-neutral-100 md:h-[580px] lg:h-[650px]">
          <div className="absolute inset-0 animate-pulse bg-neutral-100" />

          <div className="absolute inset-x-6 bottom-8 max-w-xl md:bottom-12 md:left-12">
            <div className="h-3 w-28 rounded-full bg-neutral-200" />

            <div className="mt-5 h-10 w-4/5 rounded-xl bg-neutral-200 md:h-14" />

            <div className="mt-3 h-10 w-3/5 rounded-xl bg-neutral-200 md:h-14" />

            <div className="mt-6 h-4 w-full rounded-full bg-neutral-200" />

            <div className="mt-2 h-4 w-4/5 rounded-full bg-neutral-200" />

            <div className="mt-7 h-12 w-36 rounded-full bg-neutral-200" />
          </div>

          <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 backdrop-blur">
            <Loader2
              size={14}
              className="animate-spin text-neutral-500"
            />

            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              Loading
            </span>
          </div>
        </div>
      </section>
    )
  }

  /*
   * ============================================================
   * EMPTY STATE
   * ============================================================
   */

  if (!slides.length) {
    return null
  }

  const slide =
    slides[currentIndex]

  if (!slide) {
    return null
  }

  /*
   * ============================================================
   * IMAGE
   * ============================================================
   */

  const desktopImage =
    slide.image_url ||
    'https://placehold.co/1600x900/f5f5f5/999999?text=Radha+Outfit+Collection'

  const mobileImage =
    slide.mobile_image_url ||
    desktopImage

  /*
   * ============================================================
   * BUTTON
   * ============================================================
   */

  const buttonUrl =
    slide.button_url || '/shop'

  const buttonText =
    slide.button_text || 'Shop Now'

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <section className="w-full px-3 py-3 md:px-5 md:py-5 lg:px-8">
      <div className="relative mx-auto max-w-[1500px]">

        {/* ======================================================
            HERO
        ====================================================== */}

        <div className="relative h-[520px] overflow-hidden rounded-[28px] bg-neutral-100 shadow-[0_20px_70px_rgba(0,0,0,0.08)] sm:h-[560px] md:h-[600px] lg:h-[650px] xl:h-[680px]">

          <AnimatePresence
            initial={false}
            mode="sync"
          >
            <motion.div
              key={slide.id}
              initial={{
                opacity: 0,
                scale: 1.025,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 1.015,
              }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute inset-0"
            >

              {/* =================================================
                  DESKTOP IMAGE
              ================================================= */}

              <Image
                src={desktopImage}
                alt={
                  slide.title ||
                  'Radha Outfit Collection'
                }
                fill
                priority={currentIndex === 0}
                sizes="100vw"
                className={`hidden object-cover transition-all duration-700 md:block ${
                  imageLoaded
                    ? 'scale-100 opacity-100'
                    : 'scale-[1.02] opacity-0'
                }`}
                onLoad={() =>
                  setImageLoaded(true)
                }
              />

              {/* =================================================
                  MOBILE IMAGE
              ================================================= */}

              <Image
                src={mobileImage}
                alt={
                  slide.title ||
                  'Radha Outfit Collection'
                }
                fill
                priority={currentIndex === 0}
                sizes="100vw"
                className={`object-cover transition-all duration-700 md:hidden ${
                  imageLoaded
                    ? 'scale-100 opacity-100'
                    : 'scale-[1.02] opacity-0'
                }`}
                onLoad={() =>
                  setImageLoaded(true)
                }
              />

              {/* =================================================
                  DARK GRADIENT
              ================================================= */}

              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />

            </motion.div>
          </AnimatePresence>

          {/* ====================================================
              CONTENT
          ==================================================== */}

          <div className="absolute inset-0 z-10 flex items-end">

            <div className="w-full p-6 pb-20 sm:p-8 sm:pb-20 md:p-12 md:pb-24 lg:max-w-3xl lg:p-16 lg:pb-24 xl:p-20">

              <AnimatePresence
                mode="wait"
              >
                <motion.div
                  key={`${slide.id}-content`}
                  initial={{
                    opacity: 0,
                    y: 25,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -15,
                  }}
                  transition={{
                    duration: 0.55,
                    delay: 0.1,
                  }}
                >

                  {/* SUBTITLE */}

                  {slide.subtitle && (
                    <p className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/70 sm:text-xs">
                      {slide.subtitle}
                    </p>
                  )}

                  {/* TITLE */}

                  {slide.title && (
                    <h1 className="max-w-2xl text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                      {slide.title}
                    </h1>
                  )}

                  {/* DESCRIPTION */}

                  {slide.description && (
                    <p className="mt-5 max-w-xl text-sm leading-6 text-white/75 md:text-base md:leading-7">
                      {slide.description}
                    </p>
                  )}

                  {/* BUTTON */}

                  <div className="mt-7">
                    <Link
                      href={buttonUrl}
                      className="group inline-flex h-12 items-center gap-3 rounded-full bg-white px-6 text-xs font-black uppercase tracking-wider text-black shadow-xl transition-all duration-300 hover:scale-[1.03] hover:bg-neutral-100 active:scale-[0.98] md:h-14 md:px-8"
                    >
                      {buttonText}

                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:translate-x-1">
                        <ArrowRight
                          size={14}
                        />
                      </span>
                    </Link>
                  </div>

                </motion.div>
              </AnimatePresence>

            </div>
          </div>

          {/* ====================================================
              SLIDE COUNTER
          ==================================================== */}

          <div className="absolute right-5 top-5 z-20 rounded-full bg-black/30 px-4 py-2 backdrop-blur-xl sm:right-7 sm:top-7">
            <span className="text-[10px] font-black tracking-widest text-white">
              {String(
                currentIndex + 1
              ).padStart(2, '0')}

              <span className="mx-1 text-white/40">
                /
              </span>

              {String(
                slides.length
              ).padStart(2, '0')}
            </span>
          </div>

          {/* ====================================================
              ARROWS
          ==================================================== */}

          {slides.length > 1 && (
            <div className="absolute bottom-6 right-5 z-20 flex gap-2 sm:right-7 md:bottom-8">

              <button
                type="button"
                onClick={
                  previousSlide
                }
                aria-label="Previous slide"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black active:scale-95 md:h-12 md:w-12"
              >
                <ChevronLeft
                  size={18}
                />
              </button>

              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next slide"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black active:scale-95 md:h-12 md:w-12"
              >
                <ChevronRight
                  size={18}
                />
              </button>

            </div>
          )}

          {/* ====================================================
              DOTS
          ==================================================== */}

          {slides.length > 1 && (
            <div className="absolute bottom-7 left-6 z-20 flex items-center gap-1.5 md:bottom-9 md:left-12">

              {slides.map(
                (item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setCurrentIndex(
                        index
                      )
                    }
                    aria-label={`Go to slide ${
                      index + 1
                    }`}
                    className="group p-1"
                  >
                    <span
                      className={`block h-1 rounded-full transition-all duration-500 ${
                        currentIndex ===
                        index
                          ? 'w-8 bg-white'
                          : 'w-2 bg-white/40 group-hover:bg-white/70'
                      }`}
                    />
                  </button>
                )
              )}

            </div>
          )}

          {/* ====================================================
              LOADING IMAGE OVERLAY
          ==================================================== */}

          {!imageLoaded && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-neutral-100">
              <Loader2
                size={30}
                className="animate-spin text-neutral-400"
              />
            </div>
          )}

        </div>

        {/* ======================================================
            PROGRESS BAR
        ====================================================== */}

        {slides.length > 1 && (
          <div className="mt-2 h-[2px] w-full overflow-hidden rounded-full bg-neutral-100">
            <motion.div
              key={currentIndex}
              initial={{
                width: '0%',
              }}
              animate={{
                width: '100%',
              }}
              transition={{
                duration: 6,
                ease: 'linear',
              }}
              className="h-full bg-black"
            />
          </div>
        )}

      </div>
    </section>
  )
}