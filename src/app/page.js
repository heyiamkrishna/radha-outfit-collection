import Link from 'next/link'

import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/footer/Footer'
import HeroSlider from '@/components/hero/HeroSlider'
import ProductSection from '@/components/home/ProductSection'

import { createClient } from '@/lib/supabase/server'

/*
|--------------------------------------------------------------------------
| Homepage
|--------------------------------------------------------------------------
|
| Always fetch fresh product data from Supabase.
|
*/

export const dynamic = 'force-dynamic'

/*
|--------------------------------------------------------------------------
| Product fields
|--------------------------------------------------------------------------
|
| Keep this small so we do not download unnecessary product data.
|
*/

const PRODUCT_FIELDS = `
  id,
  name,
  slug,
  base_price,
  compare_price,
  badge,
  gender,
  product_images (
    image_url
  )
`

/*
|--------------------------------------------------------------------------
| Get Homepage Data
|--------------------------------------------------------------------------
*/

async function getHomeData() {
  const supabase = await createClient()

  /*
  |--------------------------------------------------------------------------
  | Run all homepage queries together
  |--------------------------------------------------------------------------
  */

  const [
    heroResult,
    trendingResult,
    menResult,
    womenResult,
    kidsResult,
  ] = await Promise.all([
    /*
    |--------------------------------------------------------------------------
    | Hero Slides
    |--------------------------------------------------------------------------
    */

    supabase
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
      }),

    /*
    |--------------------------------------------------------------------------
    | Trending Products
    |--------------------------------------------------------------------------
    */

    supabase
      .from('products')
      .select(PRODUCT_FIELDS)
      .eq('is_active', true)
      .eq('badge', 'TRENDING')
      .order('created_at', {
        ascending: false,
      })
      .limit(4),

    /*
    |--------------------------------------------------------------------------
    | Men's Products
    |--------------------------------------------------------------------------
    */

    supabase
      .from('products')
      .select(PRODUCT_FIELDS)
      .eq('is_active', true)
      .eq('gender', 'MEN')
      .order('created_at', {
        ascending: false,
      })
      .limit(4),

    /*
    |--------------------------------------------------------------------------
    | Women's Products
    |--------------------------------------------------------------------------
    */

    supabase
      .from('products')
      .select(PRODUCT_FIELDS)
      .eq('is_active', true)
      .eq('gender', 'WOMEN')
      .order('created_at', {
        ascending: false,
      })
      .limit(4),

    /*
    |--------------------------------------------------------------------------
    | Kids Products
    |--------------------------------------------------------------------------
    */

    supabase
      .from('products')
      .select(PRODUCT_FIELDS)
      .eq('is_active', true)
      .eq('gender', 'KIDS')
      .order('created_at', {
        ascending: false,
      })
      .limit(4),
  ])

  /*
  |--------------------------------------------------------------------------
  | Debug Supabase Errors
  |--------------------------------------------------------------------------
  */

  if (heroResult.error) {
    console.error(
      '[HOME] Hero slides error:',
      heroResult.error
    )
  }

  if (trendingResult.error) {
    console.error(
      '[HOME] Trending products error:',
      trendingResult.error
    )
  }

  if (menResult.error) {
    console.error(
      '[HOME] Men products error:',
      menResult.error
    )
  }

  if (womenResult.error) {
    console.error(
      '[HOME] Women products error:',
      womenResult.error
    )
  }

  if (kidsResult.error) {
    console.error(
      '[HOME] Kids products error:',
      kidsResult.error
    )
  }

  /*
  |--------------------------------------------------------------------------
  | Normalize Products
  |--------------------------------------------------------------------------
  |
  | Makes sure ProductSection always receives a clean array.
  |
  */

  const normalizeProducts = (result) => {
    if (result?.error) {
      return []
    }

    if (!Array.isArray(result?.data)) {
      return []
    }

    return result.data.map((product) => ({
      ...product,

      product_images: Array.isArray(product.product_images)
        ? product.product_images
        : [],
    }))
  }

  return {
    heroSlides: Array.isArray(heroResult.data)
      ? heroResult.data
      : [],

    trending: normalizeProducts(trendingResult),

    men: normalizeProducts(menResult),

    women: normalizeProducts(womenResult),

    kids: normalizeProducts(kidsResult),
  }
}

/*
|--------------------------------------------------------------------------
| Homepage
|--------------------------------------------------------------------------
*/

export default async function HomePage() {
  const {
    heroSlides,
    trending,
    men,
    women,
    kids,
  } = await getHomeData()

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-neutral-950">

      {/* =========================================================
          NAVBAR
      ========================================================== */}

      <Navbar />

      <main>

        {/* =========================================================
            HERO
        ========================================================== */}

        <section
          className="
            px-3
            pt-24
            sm:px-5
            sm:pt-28
            md:px-6
            lg:px-8
            xl:px-10
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1600px]
              overflow-hidden
              rounded-[1.5rem]
              shadow-[0_25px_80px_rgba(0,0,0,0.12)]
              sm:rounded-[2rem]
              lg:rounded-[2.5rem]
            "
          >
            <HeroSlider slides={heroSlides} />
          </div>
        </section>

        {/* =========================================================
            TRENDING WEAR
        ========================================================== */}

        <section className="pt-8 sm:pt-12 md:pt-16">

          <ProductSection
            title="Trending Wear"
            products={trending}
            href="/shop?category=trending"
          />

        </section>

        {/* =========================================================
            MEN'S WEAR
        ========================================================== */}

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

        {/* =========================================================
            WOMEN'S WEAR
        ========================================================== */}

        <section className="py-2">

          <ProductSection
            title="Women's Wear"
            products={women}
            href="/shop?gender=WOMEN"
          />

        </section>

        {/* =========================================================
            KIDS WEAR
        ========================================================== */}

        <section
          className="
            bg-neutral-50
            py-2
          "
        >

          <ProductSection
            title="Kids Wear"
            products={kids}
            href="/shop?gender=KIDS"
          />

        </section>

        {/* =========================================================
            BRAND CTA
        ========================================================== */}

        <section
          className="
            px-4
            py-16
            sm:px-6
            sm:py-20
            md:px-8
            md:py-28
            lg:px-12
          "
        >

          <div
            className="
              relative
              mx-auto
              max-w-7xl
              overflow-hidden
              rounded-[2rem]
              bg-neutral-950
              px-5
              py-16
              text-center
              text-white
              shadow-[0_30px_100px_rgba(0,0,0,0.18)]
              sm:px-10
              sm:py-20
              md:rounded-[2.5rem]
              md:py-28
            "
          >

            {/* =====================================================
                BACKGROUND ORBS
            ====================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                -left-32
                -top-32
                h-72
                w-72
                rounded-full
                bg-white/[0.05]
                blur-[100px]
                sm:h-96
                sm:w-96
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-40
                -right-32
                h-80
                w-80
                rounded-full
                bg-white/[0.05]
                blur-[120px]
                sm:h-[28rem]
                sm:w-[28rem]
              "
            />

            {/* =====================================================
                GRID
            ====================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                opacity-[0.035]
              "
              style={{
                backgroundImage: `
                  linear-gradient(
                    rgba(255,255,255,0.5) 1px,
                    transparent 1px
                  ),
                  linear-gradient(
                    90deg,
                    rgba(255,255,255,0.5) 1px,
                    transparent 1px
                  )
                `,
                backgroundSize: '45px 45px',
              }}
            />

            {/* =====================================================
                CONTENT
            ====================================================== */}

            <div className="relative z-10 mx-auto max-w-3xl">

              <p
                className="
                  mb-4
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.35em]
                  text-white/40
                  sm:text-[10px]
                "
              >
                RADHA OUTFIT COLLECTION
              </p>

              <h2
                className="
                  font-[family-name:var(--font-syne)]
                  text-4xl
                  font-black
                  uppercase
                  leading-[0.95]
                  tracking-[-0.04em]
                  sm:text-5xl
                  md:text-6xl
                  lg:text-7xl
                "
              >
                Built For
                <br />
                Your Everyday
              </h2>

              <p
                className="
                  mx-auto
                  mt-5
                  max-w-xl
                  text-sm
                  leading-relaxed
                  text-white/50
                  sm:text-base
                  md:text-lg
                "
              >
                Contemporary streetwear and heavyweight
                apparel designed for modern movement.
              </p>

              <div className="mt-8 flex justify-center">

                <Link
                  href="/shop"
                  className="
                    group
                    inline-flex
                    h-12
                    items-center
                    gap-3
                    rounded-full
                    bg-white
                    px-6
                    text-xs
                    font-black
                    uppercase
                    tracking-wide
                    text-black
                    shadow-xl
                    shadow-black/20
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:bg-neutral-100
                    hover:shadow-2xl
                    active:scale-95
                    sm:h-13
                    sm:px-7
                    md:h-14
                    md:px-8
                    md:text-sm
                  "
                >

                  <span>
                    Explore Collection
                  </span>

                  <span
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      bg-black
                      text-white
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  >
                    <ArrowRightIcon />
                  </span>

                </Link>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* =========================================================
          FOOTER
      ========================================================== */}

      <Footer />

    </div>
  )
}

/*
|--------------------------------------------------------------------------
| Arrow Icon
|--------------------------------------------------------------------------
*/

function ArrowRightIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}