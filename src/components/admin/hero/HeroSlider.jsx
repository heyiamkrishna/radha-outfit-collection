'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

export default function HeroSlider() {
  const [slides, setSlides] = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadSlides = useCallback(async () => {
    try {
      const supabase = createClient()

      const {
        data,
        error: fetchError,
      } = await supabase
        .from('hero_slides')
        .select(`
          id,
          title,
          subtitle,
          description,
          badge,
          image_url,
          mobile_image_url,
          button_text,
          button_url,
          text_position,
          is_active,
          sort_order
        `)
        .eq('is_active', true)
        .order('sort_order', {
          ascending: true,
        })

      if (fetchError) {
        console.error(
          'Hero slider Supabase error:',
          fetchError
        )

        setError(fetchError.message)
        setSlides([])
        return
      }

      console.log('ACTIVE HERO SLIDES:', data)

      setSlides(data || [])

      setCurrent((previous) => {
        if (!data?.length) return 0

        if (previous >= data.length) {
          return 0
        }

        return previous
      })

      setError(null)
    } catch (err) {
      console.error(
        'Hero slider loading error:',
        err
      )

      setError(
        err?.message ||
        'Unable to load hero slides.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  /*
   * INITIAL LOAD
   */
  useEffect(() => {
    loadSlides()
  }, [loadSlides])

  /*
   * REALTIME
   */
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('hero-slides-homepage')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hero_slides',
        },
        (payload) => {
          console.log(
            'Hero slide realtime update:',
            payload
          )

          loadSlides()
        }
      )
      .subscribe((status) => {
        console.log(
          'Hero realtime status:',
          status
        )
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadSlides])

  /*
   * AUTO SLIDE
   */
  useEffect(() => {
    if (slides.length <= 1) {
      return
    }

    const timer = setInterval(() => {
      setCurrent((previous) => {
        if (previous >= slides.length - 1) {
          return 0
        }

        return previous + 1
      })
    }, 6000)

    return () => {
      clearInterval(timer)
    }
  }, [slides.length])

  /*
   * LOADING
   */
  if (loading) {
    return (
      <section className="relative w-full overflow-hidden bg-neutral-100">

        <div
          className="
            relative
            h-[520px]
            w-full
            animate-pulse
            bg-neutral-200
            sm:h-[600px]
            lg:h-[700px]
          "
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2
            size={28}
            className="animate-spin text-neutral-400"
          />
        </div>

      </section>
    )
  }

  /*
   * ERROR
   */
  if (error) {
    return (
      <section className="flex min-h-[450px] w-full items-center justify-center bg-neutral-100 px-6">

        <div className="max-w-lg text-center">

          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400">
            Radha Outfit Collection
          </p>

          <h2 className="mt-3 text-2xl font-bold text-neutral-900">
            Hero Slider Error
          </h2>

          <p className="mt-3 break-words text-sm text-red-500">
            {error}
          </p>

          <button
            type="button"
            onClick={loadSlides}
            className="
              mt-6
              rounded-full
              bg-black
              px-6
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:scale-105
            "
          >
            Try Again
          </button>

        </div>

      </section>
    )
  }

  /*
   * NO ACTIVE SLIDES
   */
  if (!slides.length) {
    return (
      <section
        className="
          flex
          min-h-[500px]
          w-full
          items-center
          justify-center
          bg-neutral-100
          px-6
        "
      >

        <div className="text-center">

          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400">
            Radha Outfit Collection
          </p>

          <h2 className="mt-3 text-2xl font-bold text-neutral-900">
            No Active Hero Slides
          </h2>

          <p className="mt-2 text-sm text-neutral-500">
            Create and activate a hero slide from the admin panel.
          </p>

          <Link
            href="/admin/hero-slides"
            className="
              mt-6
              inline-flex
              rounded-full
              bg-black
              px-6
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:scale-105
            "
          >
            Manage Hero Slides
          </Link>

        </div>

      </section>
    )
  }

  const slide = slides[current]

  if (!slide) {
    return null
  }

  /*
   * POSITION
   */
  const textPosition =
    slide.text_position === 'center'
      ? 'items-center text-center mx-auto'
      : slide.text_position === 'right'
        ? 'items-end text-right ml-auto'
        : 'items-start text-left'

  return (
    <section
      className="
        relative
        h-[520px]
        min-h-[520px]
        w-full
        overflow-hidden
        bg-black
        sm:h-[600px]
        sm:min-h-[600px]
        lg:h-[700px]
        lg:min-h-[700px]
      "
    >

      {/* ================================
          BACKGROUND IMAGE
      ================================= */}

      <div className="absolute inset-0">

        <picture>

          {slide.mobile_image_url && (
            <source
              media="(max-width: 768px)"
              srcSet={slide.mobile_image_url}
            />
          )}

          <img
            src={slide.image_url}
            alt={
              slide.title ||
              'Radha Outfit Collection'
            }
            className="
              h-full
              w-full
              object-cover
              object-center
            "
          />

        </picture>

        {/* DARK OVERLAY */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-black/80
            via-black/45
            to-black/10
          "
        />

        {/* MOBILE EXTRA OVERLAY */}

        <div
          className="
            absolute
            inset-0
            bg-black/10
            sm:hidden
          "
        />

      </div>

      {/* ================================
          CONTENT
      ================================= */}

      <div
        className="
          relative
          z-10
          flex
          h-full
          w-full
          items-center
        "
      >

        <div
          className="
            mx-auto
            flex
            w-full
            max-w-7xl
            px-6
            sm:px-8
            lg:px-12
            xl:px-16
          "
        >

          <div
            className={`
              flex
              w-full
              max-w-3xl
              flex-col
              ${textPosition}
            `}
          >

            {/* BADGE */}

            {slide.badge && (
              <div
                className="
                  mb-4
                  inline-flex
                  w-fit
                  rounded-full
                  border
                  border-white/30
                  bg-white/10
                  px-4
                  py-2
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-white
                  backdrop-blur-xl
                  sm:mb-5
                "
              >
                {slide.badge}
              </div>
            )}

            {/* SUBTITLE */}

            {slide.subtitle && (
              <p
                className="
                  mb-3
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.25em]
                  text-white/75
                  sm:mb-4
                  sm:text-xs
                  md:text-sm
                "
              >
                {slide.subtitle}
              </p>
            )}

            {/* TITLE */}

            {slide.title && (
              <h1
                className="
                  max-w-4xl
                  font-[family-name:var(--font-syne)]
                  text-5xl
                  font-bold
                  leading-[0.92]
                  tracking-[-0.04em]
                  text-white
                  sm:text-6xl
                  md:text-7xl
                  lg:text-8xl
                  xl:text-9xl
                "
              >
                {slide.title}
              </h1>
            )}

            {/* DESCRIPTION */}

            {slide.description && (
              <p
                className="
                  mt-5
                  max-w-xl
                  text-sm
                  leading-6
                  text-white/75
                  sm:mt-6
                  sm:text-base
                  sm:leading-7
                  md:text-lg
                "
              >
                {slide.description}
              </p>
            )}

            {/* BUTTON */}

            {slide.button_url && (
              <Link
                href={slide.button_url}
                className="
                  mt-7
                  inline-flex
                  w-fit
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  px-7
                  py-3.5
                  text-sm
                  font-bold
                  text-black
                  transition
                  duration-300
                  hover:scale-105
                  hover:bg-neutral-100
                  sm:mt-8
                  sm:px-8
                  sm:py-4
                "
              >
                {slide.button_text || 'Shop Now'}
              </Link>
            )}

          </div>

        </div>

      </div>

      {/* ================================
          PREVIOUS BUTTON
      ================================= */}

      {slides.length > 1 && (
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => {
            setCurrent((previous) =>
              previous === 0
                ? slides.length - 1
                : previous - 1
            )
          }}
          className="
            absolute
            left-3
            top-1/2
            z-20
            flex
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-white/20
            bg-black/25
            text-white
            backdrop-blur-xl
            transition
            hover:bg-white
            hover:text-black
            sm:left-5
            sm:h-11
            sm:w-11
          "
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {/* ================================
          NEXT BUTTON
      ================================= */}

      {slides.length > 1 && (
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => {
            setCurrent((previous) =>
              previous === slides.length - 1
                ? 0
                : previous + 1
            )
          }}
          className="
            absolute
            right-3
            top-1/2
            z-20
            flex
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            border
            border-white/20
            bg-black/25
            text-white
            backdrop-blur-xl
            transition
            hover:bg-white
            hover:text-black
            sm:right-5
            sm:h-11
            sm:w-11
          "
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* ================================
          DOTS
      ================================= */}

      {slides.length > 1 && (
        <div
          className="
            absolute
            bottom-6
            left-1/2
            z-20
            flex
            -translate-x-1/2
            items-center
            gap-2
            sm:bottom-8
          "
        >

          {slides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setCurrent(index)}
              className={`
                h-1.5
                rounded-full
                transition-all
                duration-300
                ${
                  current === index
                    ? 'w-10 bg-white'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }
              `}
            />
          ))}

        </div>
      )}

      {/* ================================
          SLIDE COUNTER
      ================================= */}

      {slides.length > 1 && (
        <div
          className="
            absolute
            bottom-6
            right-5
            z-20
            hidden
            text-xs
            font-medium
            tracking-widest
            text-white/70
            sm:block
          "
        >
          {String(current + 1).padStart(2, '0')}
          {' / '}
          {String(slides.length).padStart(2, '0')}
        </div>
      )}

    </section>
  )
}