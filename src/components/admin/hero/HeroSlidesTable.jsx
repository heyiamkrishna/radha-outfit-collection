'use client'

import {
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react'

export default function HeroSlidesTable({
  slides = [],
  onEdit,
  onDelete,
  onToggle,
}) {
  if (!slides.length) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white px-6 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
          <Eye size={22} className="text-neutral-400" />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-neutral-900">
          No hero slides
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
          Create your first hero slide to display it on the homepage.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">

      {/* DESKTOP HEADER */}
      <div className="hidden border-b border-neutral-100 bg-neutral-50/70 px-6 py-4 lg:grid lg:grid-cols-[1.7fr_1fr_120px_150px] lg:items-center lg:gap-6">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">
          Hero Slide
        </div>

        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">
          Details
        </div>

        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">
          Status
        </div>

        <div className="text-right text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">
          Actions
        </div>
      </div>

      {/* SLIDES */}
      <div className="divide-y divide-neutral-100">

        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="
              group
              p-4
              sm:p-5
              lg:px-6
              lg:py-5
            "
          >

            {/* DESKTOP / TABLET */}
            <div className="hidden lg:grid lg:grid-cols-[1.7fr_1fr_120px_150px] lg:items-center lg:gap-6">

              {/* IMAGE + TITLE */}
              <div className="flex min-w-0 items-center gap-4">

                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                  {slide.image_url ? (
                    <img
                      src={slide.image_url}
                      alt={slide.title || 'Hero slide'}
                      className="
                        h-full
                        w-full
                        object-cover
                        transition
                        duration-500
                        group-hover:scale-105
                      "
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                      No image
                    </div>
                  )}

                  <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
                    #{index + 1}
                  </div>
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-neutral-900">
                    {slide.title || 'Untitled slide'}
                  </h3>

                  {slide.subtitle && (
                    <p className="mt-1 truncate text-xs text-neutral-500">
                      {slide.subtitle}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-neutral-400">
                    Sort order: {slide.sort_order ?? 0}
                  </p>
                </div>
              </div>

              {/* DETAILS */}
              <div className="min-w-0">

                {slide.button_text && (
                  <p className="truncate text-sm font-medium text-neutral-800">
                    {slide.button_text}
                  </p>
                )}

                {slide.button_url && (
                  <p className="mt-1 truncate text-xs text-neutral-400">
                    {slide.button_url}
                  </p>
                )}

                {slide.text_position && (
                  <p className="mt-2 text-xs capitalize text-neutral-400">
                    Text: {slide.text_position}
                  </p>
                )}
              </div>

              {/* STATUS */}
              <div>
                <span
                  className={`
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    ${
                      slide.is_active
                        ? 'bg-green-50 text-green-700'
                        : 'bg-neutral-100 text-neutral-500'
                    }
                  `}
                >
                  <span
                    className={`
                      h-1.5
                      w-1.5
                      rounded-full
                      ${
                        slide.is_active
                          ? 'bg-green-500'
                          : 'bg-neutral-400'
                      }
                    `}
                  />

                  {slide.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-2">

                <button
                  type="button"
                  onClick={() => onToggle?.(slide)}
                  title={
                    slide.is_active
                      ? 'Disable slide'
                      : 'Enable slide'
                  }
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-neutral-200
                    text-neutral-500
                    transition
                    hover:bg-neutral-100
                    hover:text-black
                  "
                >
                  {slide.is_active ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onEdit?.(slide)}
                  title="Edit slide"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-neutral-200
                    text-neutral-500
                    transition
                    hover:bg-neutral-100
                    hover:text-black
                  "
                >
                  <Edit3 size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete?.(slide)}
                  title="Delete slide"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-red-100
                    text-red-500
                    transition
                    hover:bg-red-50
                  "
                >
                  <Trash2 size={16} />
                </button>

                {slide.button_url && (
                  <a
                    href={slide.button_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open link"
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-neutral-200
                      text-neutral-500
                      transition
                      hover:bg-neutral-100
                      hover:text-black
                    "
                  >
                    <ExternalLink size={16} />
                  </a>
                )}

              </div>
            </div>

            {/* MOBILE */}
            <div className="lg:hidden">

              {/* IMAGE */}
              <div className="relative aspect-[16/8] w-full overflow-hidden rounded-2xl bg-neutral-100">

                {slide.image_url ? (
                  <img
                    src={slide.image_url}
                    alt={slide.title || 'Hero slide'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                    No image
                  </div>
                )}

                <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur">
                  #{index + 1}
                </div>

                <div className="absolute right-3 top-3">
                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      px-3
                      py-1.5
                      text-[10px]
                      font-semibold
                      backdrop-blur-xl
                      ${
                        slide.is_active
                          ? 'bg-green-500/90 text-white'
                          : 'bg-black/60 text-white'
                      }
                    `}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />

                    {slide.is_active
                      ? 'Active'
                      : 'Inactive'}
                  </span>
                </div>

              </div>

              {/* CONTENT */}
              <div className="mt-4">

                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0">

                    <h3 className="truncate text-base font-semibold text-neutral-900">
                      {slide.title || 'Untitled slide'}
                    </h3>

                    {slide.subtitle && (
                      <p className="mt-1 text-sm text-neutral-500">
                        {slide.subtitle}
                      </p>
                    )}

                  </div>

                  <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-500">
                    #{index + 1}
                  </span>

                </div>

                {/* META */}
                <div className="mt-4 grid grid-cols-2 gap-2">

                  <div className="rounded-xl bg-neutral-50 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                      Sort
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {slide.sort_order ?? 0}
                    </p>
                  </div>

                  <div className="rounded-xl bg-neutral-50 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                      Position
                    </p>

                    <p className="mt-1 text-sm font-semibold capitalize">
                      {slide.text_position || 'left'}
                    </p>
                  </div>

                </div>

                {/* BUTTON INFO */}
                {slide.button_text && (
                  <div className="mt-3 rounded-xl bg-neutral-50 p-3">

                    <p className="text-[10px] uppercase tracking-wider text-neutral-400">
                      CTA Button
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {slide.button_text}
                    </p>

                    {slide.button_url && (
                      <p className="mt-1 truncate text-xs text-neutral-400">
                        {slide.button_url}
                      </p>
                    )}

                  </div>
                )}

                {/* ACTIONS */}
                <div className="mt-4 grid grid-cols-3 gap-2">

                  <button
                    type="button"
                    onClick={() => onToggle?.(slide)}
                    className="
                      flex
                      min-h-11
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-neutral-200
                      bg-white
                      text-xs
                      font-medium
                      text-neutral-700
                      transition
                      active:scale-[0.98]
                    "
                  >
                    {slide.is_active ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}

                    <span className="hidden min-[400px]:inline">
                      {slide.is_active
                        ? 'Disable'
                        : 'Enable'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit?.(slide)}
                    className="
                      flex
                      min-h-11
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-neutral-200
                      bg-white
                      text-xs
                      font-medium
                      text-neutral-700
                      transition
                      active:scale-[0.98]
                    "
                  >
                    <Edit3 size={15} />

                    <span className="hidden min-[400px]:inline">
                      Edit
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete?.(slide)}
                    className="
                      flex
                      min-h-11
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-red-100
                      bg-white
                      text-xs
                      font-medium
                      text-red-500
                      transition
                      active:scale-[0.98]
                    "
                  >
                    <Trash2 size={15} />

                    <span className="hidden min-[400px]:inline">
                      Delete
                    </span>
                  </button>

                </div>

              </div>
            </div>

          </div>
        ))}

      </div>
    </div>
  )
}