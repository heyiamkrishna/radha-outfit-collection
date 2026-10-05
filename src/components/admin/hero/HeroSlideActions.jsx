'use client'

import {
  ArrowDown,
  ArrowUp,
  Edit3,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react'

export default function HeroSlideActions({
  slide,
  index,
  total,
  onEdit,
  onDelete,
  onToggle,
  onMoveUp,
  onMoveDown,
}) {
  return (
    <div className="flex items-center justify-end gap-1">

      <button
        type="button"
        onClick={() => onToggle(slide)}
        title={slide.is_active ? 'Deactivate' : 'Activate'}
        className="rounded-xl p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-black"
      >
        {slide.is_active ? (
          <Eye size={17} />
        ) : (
          <EyeOff size={17} />
        )}
      </button>

      <button
        type="button"
        onClick={() => onMoveUp(slide, index)}
        disabled={index === 0}
        title="Move up"
        className="rounded-xl p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-20"
      >
        <ArrowUp size={17} />
      </button>

      <button
        type="button"
        onClick={() => onMoveDown(slide, index)}
        disabled={index === total - 1}
        title="Move down"
        className="rounded-xl p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-20"
      >
        <ArrowDown size={17} />
      </button>

      <button
        type="button"
        onClick={() => onEdit(slide)}
        title="Edit"
        className="rounded-xl p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-black"
      >
        <Edit3 size={17} />
      </button>

      <button
        type="button"
        onClick={() => onDelete(slide)}
        title="Delete"
        className="rounded-xl p-2 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={17} />
      </button>

    </div>
  )
}