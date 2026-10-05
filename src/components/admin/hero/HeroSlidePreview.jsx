'use client'

import {
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react'

export default function HeroSlidePreview({ slide }) {
  if (!slide) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-neutral-50">
        <div className="text-center text-neutral-400">
          <ImageIcon
            size={35}
            className="mx-auto mb-3"
          />

          <p className="text-sm font-medium">
            Select a slide to preview
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">

      <div className="relative aspect-[16/9] overflow-hidden bg-neutral-200">

        {slide.image_url ? (
          <img
            src={slide.image_url}
            alt={slide.title || 'Hero slide'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <ImageIcon size={40} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />

        <div
          className={`absolute inset-0 flex items-center p-8 ${
            slide.text_position === 'center'
              ? 'justify-center text-center'
              : slide.text_position === 'right'
                ? 'justify-end text-right'
                : 'justify-start text-left'
          }`}
        >
          <div className="max-w-md text-white">

            {slide.badge && (
              <span className="mb-3 inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur-md">
                {slide.badge}
              </span>
            )}

            {slide.subtitle && (
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70">
                {slide.subtitle}
              </p>
            )}

            <h2 className="text-3xl font-bold leading-tight">
              {slide.title || 'Untitled Slide'}
            </h2>

            {slide.description && (
              <p className="mt-3 text-xs leading-5 text-white/75">
                {slide.description}
              </p>
            )}

            {slide.button_text && (
              <div className="mt-5 inline-flex rounded-full bg-white px-5 py-2.5 text-xs font-bold text-black">
                {slide.button_text}
              </div>
            )}

          </div>
        </div>

      </div>

      <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-4">

        <div>
          <p className="text-xs font-semibold text-neutral-900">
            {slide.title || 'Untitled'}
          </p>

          <p className="mt-1 text-[11px] text-neutral-400">
            {slide.is_active ? 'Active' : 'Inactive'}
          </p>
        </div>

        {slide.button_url && (
          <a
            href={slide.button_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-black"
          >
            Preview link
            <ExternalLink size={13} />
          </a>
        )}

      </div>

    </div>
  )
}