'use client'

import { useState } from 'react'

import {
  Check,
  Loader2,
  X,
} from 'lucide-react'

export default function StockEditor({
  variant,
  onClose,
  onSaved,
}) {
  const [size, setSize] =
    useState(
      variant?.size || ''
    )

  const [color, setColor] =
    useState(
      variant?.color || ''
    )

  const [sku, setSku] =
    useState(
      variant?.sku || ''
    )

  const [stock, setStock] =
    useState(
      variant?.stock_quantity ?? 0
    )

  const [price, setPrice] =
    useState(
      variant?.price ?? ''
    )

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  async function handleSave() {
    setError('')

    const quantity =
      Number(stock)

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity < 0
    ) {
      setError(
        'Stock must be a valid number.'
      )

      return
    }

    try {
      setLoading(true)

      const response =
        await fetch(
          `/api/admin/inventory/${variant.id}`,
          {
            method: 'PATCH',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              size,
              color,
              sku,
              stock_quantity:
                quantity,
              price:
                price === ''
                  ? null
                  : Number(price),
            }),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Unable to update inventory.'
        )
      }

      onSaved?.(data.data)
    } catch (error) {
      console.error(
        'Stock update error:',
        error
      )

      setError(
        error.message ||
          'Unable to update inventory.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

      <div className="w-full max-w-lg rounded-[30px] bg-white p-6 shadow-2xl">

        {/* HEADER */}

        <div className="flex items-start justify-between">

          <div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Inventory
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Edit Variant
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100"
          >
            <X size={17} />
          </button>

        </div>

        {/* PRODUCT */}

        <div className="mt-5 rounded-2xl bg-neutral-50 p-4">

          <p className="text-sm font-semibold">
            {variant?.products?.name ||
              'Product'}
          </p>

          <p className="mt-1 text-xs text-neutral-400">
            Edit size, color, SKU and stock.
          </p>

        </div>

        {/* FIELDS */}

        <div className="mt-6 grid grid-cols-2 gap-4">

          <Field
            label="Size"
            value={size}
            onChange={setSize}
            placeholder="M"
          />

          <Field
            label="Color"
            value={color}
            onChange={setColor}
            placeholder="Black"
          />

          <Field
            label="SKU"
            value={sku}
            onChange={setSku}
            placeholder="ROC-BLK-M"
          />

          <Field
            label="Stock"
            type="number"
            value={stock}
            onChange={setStock}
            placeholder="0"
          />

          <Field
            label="Price"
            type="number"
            value={price}
            onChange={setPrice}
            placeholder="999"
          />

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* SAVE */}

        <button
          type="button"
          disabled={loading}
          onClick={handleSave}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-neutral-950 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >

          {loading ? (
            <Loader2
              size={17}
              className="animate-spin"
            />
          ) : (
            <Check size={17} />
          )}

          {loading
            ? 'Saving...'
            : 'Save Changes'}

        </button>

      </div>

    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-neutral-600">
        {label}
      </label>

      <input
        type={type}
        value={value}
        min={
          type === 'number'
            ? '0'
            : undefined
        }
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        className="h-11 w-full rounded-xl border border-black/[0.07] bg-neutral-50 px-3 text-sm outline-none transition focus:border-black focus:bg-white"
      />
    </div>
  )
}