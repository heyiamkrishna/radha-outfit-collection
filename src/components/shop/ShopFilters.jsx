'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ShopFilters({ currentCategory }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const categories = [
    { name: 'All Products', slug: '' },
    { name: 'Trending', slug: 'trending' },
    { name: 'Men', slug: 'men' },
    { name: 'Women', slug: 'women' },
    { name: 'Kids', slug: 'kids' },
    { name: 'Unisex', slug: 'unisex' },
  ]

  const createQueryString = (name, value) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    return params.toString()
  }

  return (
    <div className="space-y-8 sticky top-32">
      {/* Categories */}
      <div>
        <h3 className="font-[family-name:var(--font-syne)] text-lg font-bold mb-4">Categories</h3>
        <ul className="space-y-3">
          {categories.map((cat) => {
            const isActive = currentCategory === cat.slug || (!currentCategory && cat.slug === '')
            return (
              <li key={cat.name}>
                <Link
                  href={pathname + '?' + createQueryString('category', cat.slug)}
                  className={`text-sm transition-colors ${
                    isActive ? 'text-black font-semibold' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  {cat.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Price Range (UI only for now) */}
      <div>
        <h3 className="font-[family-name:var(--font-syne)] text-lg font-bold mb-4">Price</h3>
        <div className="space-y-4">
          <input 
            type="range" 
            min="0" 
            max="10000" 
            className="w-full accent-black"
          />
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>₹0</span>
            <span>₹10,000+</span>
          </div>
        </div>
      </div>
    </div>
  )
}