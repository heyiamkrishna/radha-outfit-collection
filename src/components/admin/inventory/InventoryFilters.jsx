'use client'

import {
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function InventoryFilters({
  categories,
  currentSearch,
  currentCategory,
  currentStock,
}) {
  const router = useRouter()

  const [search, setSearch] =
    useState(currentSearch)

  function updateFilters(
    overrides = {}
  ) {
    const params =
      new URLSearchParams()

    const nextSearch =
      overrides.search ??
      search

    const nextCategory =
      overrides.category ??
      currentCategory

    const nextStock =
      overrides.stock ??
      currentStock

    if (nextSearch) {
      params.set(
        'q',
        nextSearch
      )
    }

    if (
      nextCategory &&
      nextCategory !== 'all'
    ) {
      params.set(
        'category',
        nextCategory
      )
    }

    if (
      nextStock &&
      nextStock !== 'all'
    ) {
      params.set(
        'stock',
        nextStock
      )
    }

    const query =
      params.toString()

    router.push(
      `/admin/inventory${
        query
          ? `?${query}`
          : ''
      }`
    )
  }

  function handleSubmit(event) {
    event.preventDefault()

    updateFilters({
      search,
    })
  }

  return (
    <div className="mb-6 rounded-[28px] border border-black/[0.05] bg-white p-4 shadow-sm">

      <div className="flex flex-col gap-3 lg:flex-row">

        {/* SEARCH */}

        <form
          onSubmit={
            handleSubmit
          }
          className="relative flex-1"
        >

          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search products..."
            className="h-12 w-full rounded-2xl bg-neutral-50 pl-11 pr-4 text-sm outline-none ring-0 transition focus:bg-neutral-100"
          />

        </form>

        {/* CATEGORY */}

        <select
          value={
            currentCategory
          }
          onChange={(event) =>
            updateFilters({
              category:
                event.target.value,
            })
          }
          className="h-12 rounded-2xl bg-neutral-50 px-4 text-sm outline-none"
        >
          <option value="all">
            All categories
          </option>

          {categories.map(
            (category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            )
          )}

        </select>

        {/* STOCK */}

        <div className="flex items-center gap-2 overflow-x-auto rounded-2xl bg-neutral-50 p-1">

          <SlidersHorizontal
            size={16}
            className="ml-2 shrink-0 text-neutral-400"
          />

          {[
            ['all', 'All'],
            ['in', 'In Stock'],
            ['low', 'Low Stock'],
            ['out', 'Out'],
          ].map(
            ([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  updateFilters({
                    stock: value,
                  })
                }
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-medium transition ${
                  currentStock ===
                  value
                    ? 'bg-neutral-950 text-white'
                    : 'text-neutral-500 hover:bg-white'
                }`}
              >
                {label}
              </button>
            )
          )}

        </div>

      </div>

    </div>
  )
}