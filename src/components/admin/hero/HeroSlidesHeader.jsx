'use client'

import { Plus } from 'lucide-react'

export default function HeroSlidesHeader({
  onAdd,
  totalSlides,
  activeSlides,
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400">
          Admin / Content
        </p>

        <h1 className="font-[family-name:var(--font-syne)] text-4xl font-bold tracking-tight md:text-5xl">
          Hero Slides
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
          Manage the homepage hero banners, promotional messages
          and collection campaigns.
        </p>
      </div>

      <div className="flex items-center gap-3">

        <div className="hidden rounded-2xl border border-neutral-200 bg-white px-4 py-3 sm:block">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Active
          </p>

          <p className="mt-1 text-lg font-bold">
            {activeSlides}
          </p>
        </div>

        <div className="hidden rounded-2xl border border-neutral-200 bg-white px-4 py-3 sm:block">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Total
          </p>

          <p className="mt-1 text-lg font-bold">
            {totalSlides}
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-neutral-800"
        >
          <Plus size={17} />
          Add Slide
        </button>

      </div>

    </div>
  )
}