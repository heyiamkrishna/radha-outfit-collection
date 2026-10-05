'use client'

import Link from 'next/link'
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

export default function CartDrawer() {
  const items = useCartStore(
    (state) => Array.isArray(state.items) ? state.items : []
  )

  const isCartOpen = useCartStore(
    (state) => Boolean(state.isCartOpen)
  )

  const closeCart = useCartStore(
    (state) => state.closeCart
  )

  const increaseQuantity = useCartStore(
    (state) => state.increaseQuantity
  )

  const decreaseQuantity = useCartStore(
    (state) => state.decreaseQuantity
  )

  const removeFromCart = useCartStore(
    (state) => state.removeFromCart
  )

  const getCartTotal = useCartStore(
    (state) => state.getCartTotal
  )

  if (!isCartOpen) {
    return null
  }

  const total =
    typeof getCartTotal === 'function'
      ? Number(getCartTotal()) || 0
      : items.reduce(
          (sum, item) =>
            sum +
            Number(item?.price || 0) *
              Number(item?.quantity || 1),
          0
        )

  return (
    <div className="fixed inset-0 z-[9999]">

      {/* Overlay */}
      <button
        type="button"
        aria-label="Close shopping cart"
        onClick={closeCart}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Drawer */}
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col overflow-hidden border-l border-neutral-200 bg-white shadow-2xl">

        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-5 py-5">

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-neutral-400">
              Radha Outfit Collection
            </p>

            <h2 className="mt-1 text-xl font-black tracking-tight text-neutral-950">
              Your Bag
            </h2>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 transition hover:bg-black hover:text-white"
          >
            <X size={18} />
          </button>

        </header>

        {/* Items */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">

          {items.length === 0 ? (

            <div className="flex h-full min-h-[420px] flex-col items-center justify-center px-6 text-center">

              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
                <ShoppingBag
                  size={28}
                  strokeWidth={1.8}
                  className="text-neutral-400"
                />
              </div>

              <h3 className="mt-5 text-xl font-black tracking-tight text-neutral-950">
                Your cart is empty
              </h3>

              <p className="mt-2 max-w-xs text-sm leading-6 text-neutral-500">
                Add something you love before checking out.
              </p>

              <Link
                href="/shop"
                onClick={closeCart}
                className="mt-6 rounded-full bg-black px-7 py-3 text-sm font-black text-white transition hover:bg-neutral-800"
              >
                Continue Shopping
              </Link>

            </div>

          ) : (

            <div className="space-y-3">

              {items.map((item, index) => {

                /*
                 * Always create a safe key.
                 * This prevents:
                 * "Each child in a list should have a unique key"
                 */
                const itemKey =
                  item?.cartId ||
                  item?.id ||
                  `${item?.product_id || item?.productId || 'product'}-${item?.size || ''}-${item?.color || ''}-${index}`

                const image =
                  item?.image ||
                  item?.image_url ||
                  item?.product_image ||
                  ''

                const price =
                  Number(item?.price || 0)

                const quantity =
                  Math.max(
                    1,
                    Number(item?.quantity || 1)
                  )

                return (
                  <div
                    key={itemKey}
                    className="rounded-2xl border border-neutral-100 bg-neutral-50 p-3"
                  >

                    <div className="flex gap-3">

                      {/* Image */}
                      <div className="relative h-[92px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-neutral-200">

                        {image ? (
                          <img
                            src={image}
                            alt={item?.name || 'Product'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ShoppingBag
                              size={20}
                              className="text-neutral-400"
                            />
                          </div>
                        )}

                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-2">

                          <h3 className="line-clamp-2 text-sm font-black leading-5 text-neutral-950">
                            {item?.name || 'Product'}
                          </h3>

                          <button
                            type="button"
                            aria-label="Remove product"
                            onClick={() => {
                              if (
                                typeof removeFromCart ===
                                'function'
                              ) {
                                removeFromCart(itemKey)
                              }
                            }}
                            className="shrink-0 text-neutral-400 transition hover:text-red-500"
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>

                        <p className="mt-1 text-sm font-black text-neutral-950">
                          ₹{price.toLocaleString('en-IN')}
                        </p>

                        {/* Variant */}
                        {(item?.size || item?.color) && (
                          <div className="mt-2 flex flex-wrap gap-1.5">

                            {item?.size && (
                              <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-neutral-600">
                                Size: {item.size}
                              </span>
                            )}

                            {item?.color && (
                              <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-neutral-600">
                                {item.color}
                              </span>
                            )}

                          </div>
                        )}

                        {/* Quantity */}
                        <div className="mt-3 flex items-center">

                          <div className="flex h-8 items-center overflow-hidden rounded-lg border border-neutral-200 bg-white">

                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => {
                                if (
                                  typeof decreaseQuantity ===
                                  'function'
                                ) {
                                  decreaseQuantity(itemKey)
                                }
                              }}
                              className="flex h-8 w-8 items-center justify-center transition hover:bg-neutral-100"
                            >
                              <Minus size={13} />
                            </button>

                            <span className="w-7 text-center text-xs font-black">
                              {quantity}
                            </span>

                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => {
                                if (
                                  typeof increaseQuantity ===
                                  'function'
                                ) {
                                  increaseQuantity(itemKey)
                                }
                              }}
                              className="flex h-8 w-8 items-center justify-center transition hover:bg-neutral-100"
                            >
                              <Plus size={13} />
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>
                )
              })}

            </div>
          )}

        </div>

        {/* Footer */}
        {items.length > 0 && (
          <footer className="shrink-0 border-t border-neutral-100 bg-white p-5">

            <div className="mb-4 flex items-center justify-between">

              <span className="text-sm font-bold text-neutral-500">
                Subtotal
              </span>

              <span className="text-xl font-black text-neutral-950">
                ₹{total.toLocaleString('en-IN')}
              </span>

            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-black text-sm font-black text-white transition hover:bg-neutral-800"
            >
              Checkout
              <ArrowRight size={17} />
            </Link>

          </footer>
        )}

      </aside>
    </div>
  )
}