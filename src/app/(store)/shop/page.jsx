import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/footer/Footer'
import ShopFilters from '@/components/shop/ShopFilters'
import ShopProducts from '@/components/shop/ShopProducts'
import { getShopProducts } from '@/lib/products'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Shop | Radha Outfit Collection',
  description:
    'Shop contemporary streetwear and everyday clothing from Radha Outfit Collection.',
}

export default async function ShopPage({
  searchParams,
}) {
  const params = await searchParams

  const search =
    typeof params?.search === 'string'
      ? params.search
      : ''

  const gender =
    typeof params?.gender === 'string'
      ? params.gender.toUpperCase()
      : null

  const trending =
    params?.trending === 'true'

  const products =
    await getShopProducts({
      search,
      gender,
      trending,
    })

  let title = 'Shop Collection'

  if (trending) {
    title = 'Trending Wear'
  } else if (gender === 'MEN') {
    title = "Men's Wear"
  } else if (gender === 'WOMEN') {
    title = "Women's Wear"
  } else if (gender === 'KIDS') {
    title = 'Kids Wear'
  } else if (search) {
    title = `Search: ${search}`
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-neutral-950">
      <Navbar />

      <main className="pt-24">
        <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 md:py-16 lg:px-12">

          {/* HEADER */}
          <div className="mb-8 border-b border-neutral-200 pb-6">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400">
              Radha Outfit Collection
            </p>

            <h1 className="font-[family-name:var(--font-syne)] text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
              {title}
            </h1>

            <p className="mt-3 text-sm text-neutral-500">
              {products.length}{' '}
              {products.length === 1
                ? 'product'
                : 'products'}
            </p>
          </div>

          {/* FILTERS */}
          <ShopFilters />

          {/* PRODUCTS */}
          <ShopProducts
            products={products}
          />

        </section>
      </main>

      <Footer />
    </div>
  )
}