'use client'

import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function ProductFilters({
  categories = [],
  currentSearch = '',
  currentCategory = 'all',
  currentStatus = 'all',
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(currentSearch)

  function updateFilter(key, value) {
    const params = new URLSearchParams(
      searchParams.toString()
    )

    if (!value || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`/admin/products?${params.toString()}`)
  }

  function handleSearch(event) {
    event.preventDefault()

    const params = new URLSearchParams(
      searchParams.toString()
    )

    if (search.trim()) {
      params.set('q', search.trim())
    } else {
      params.delete('q')
    }

    router.push(`/admin/products?${params.toString()}`)
  }

  function clearFilters() {
    setSearch('')
    router.push('/admin/products')
  }

  const hasFilters =
    currentSearch ||
    currentCategory !== 'all' ||
    currentStatus !== 'all'

  return (
    <div className="mb-6 rounded-3xl border border-black/[0.05] bg-white p-4 shadow-sm">

      <div className="flex flex-col gap-3 lg:flex-row">

        {/* Search */}

        <form
          onSubmit={handleSearch}
          className="relative flex-1"
        >
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search products..."
            className="h-11 w-full rounded-xl border border-black/[0.06] bg-neutral-50 pl-11 pr-4 text-sm outline-none transition focus:border-neutral-300 focus:bg-white"
          />
        </form>

        {/* Category */}

        <select
          value={currentCategory}
          onChange={(event) =>
            updateFilter(
              'category',
              event.target.value
            )
          }
          className="h-11 rounded-xl border border-black/[0.06] bg-neutral-50 px-4 text-sm outline-none transition focus:border-neutral-300"
        >
          <option value="all">
            All Categories
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>

        {/* Status */}

        <select
          value={currentStatus}
          onChange={(event) =>
            updateFilter(
              'status',
              event.target.value
            )
          }
          className="h-11 rounded-xl border border-black/[0.06] bg-neutral-50 px-4 text-sm outline-none transition focus:border-neutral-300"
        >
          <option value="all">
            All Status
          </option>

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>

        {/* Clear */}

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X size={15} />
            Clear
          </button>
        )}

      </div>

    </div>
  )
}