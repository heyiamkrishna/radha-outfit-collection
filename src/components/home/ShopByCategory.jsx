import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function ShopByCategory() {
  const categories = [
    {
      id: 'men',
      title: "Men's Wear",
      href: '/shop?gender=men',
      // Blue gradient mimicking the "Skin Care" card
      bgClass: 'bg-gradient-to-r from-blue-300 to-blue-100', 
      textColor: 'text-blue-950',
      imgSrc: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=300&q=80',
    },
    {
      id: 'women',
      title: "Women's Wear",
      href: '/shop?gender=women',
      // Orange/Peach gradient mimicking the "Mens Grooming" card
      bgClass: 'bg-gradient-to-r from-orange-300 to-orange-100',
      textColor: 'text-orange-950',
      imgSrc: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&q=80',
    },
    {
      id: 'kids',
      title: "Kids Collection",
      href: '/shop?gender=kids',
      // Mint green gradient mimicking the "Beauty & Hygiene" card
      bgClass: 'bg-gradient-to-r from-emerald-300 to-emerald-100',
      textColor: 'text-emerald-950',
      imgSrc: 'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?w=300&q=80',
    },
    {
      id: 'unisex',
      title: "Unisex Styles",
      href: '/shop?gender=unisex',
      // Coral/Red gradient mimicking the "Elderly Care" card
      bgClass: 'bg-gradient-to-r from-rose-300 to-rose-100',
      textColor: 'text-rose-950',
      imgSrc: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&q=80',
    },
    {
      id: 'all',
      title: "Shop All",
      href: '/shop',
      // Neutral gradient for the final span card
      bgClass: 'bg-gradient-to-r from-neutral-300 to-neutral-100',
      textColor: 'text-neutral-900',
      imgSrc: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=80',
    }
  ]

  return (
    <section className="py-12">
      {/* Header section matching the reference image */}
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl font-[family-name:var(--font-syne)]">
          Shop By Category
        </h2>
        <Link 
          href="/shop" 
          className="flex items-center gap-1 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700"
        >
          View All <ArrowRight size={16} />
        </Link>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            href={category.href}
            // Make the 5th item (Shop All) span both columns on tablet/desktop for a clean grid
            className={`group relative flex h-36 w-full items-center justify-between overflow-hidden rounded-2xl p-6 transition-transform hover:scale-[1.02] active:scale-[0.98] ${category.bgClass} ${index === 4 ? 'md:col-span-2 md:h-40' : ''}`}
          >
            {/* Left side: Text */}
            <div className="relative z-10 max-w-[50%]">
              <h3 className={`text-xl font-bold leading-tight md:text-2xl ${category.textColor}`}>
                {category.title}
              </h3>
            </div>

            {/* Right side: Image Container */}
            <div className="absolute -right-4 top-0 h-full w-[55%] md:w-[45%]">
              {/* Fade gradient mask so the image blends smoothly into the card color on the left edge */}
              <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-transparent to-transparent [mask-image:linear-gradient(to_right,transparent_0%,black_30%)]">
                <img
                  src={category.imgSrc}
                  alt={category.title}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}