'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const EMPTY_ITEMS = []

function makeCartId(productId, size = '', color = '') {
  return `${productId}-${size || 'default'}-${color || 'default'}`
}

function normalizeItem(item) {
  return {
    cartId: item.cartId,
    id: item.id,
    product_id: item.product_id || item.id,

    name: item.name || 'Product',
    slug: item.slug || '',

    price: Number(item.price || 0),
    quantity: Math.max(1, Number(item.quantity || 1)),

    size: item.size || '',
    color: item.color || '',

    image:
      item.image ||
      item.image_url ||
      item.product_image ||
      '',

    image_url:
      item.image_url ||
      item.image ||
      item.product_image ||
      '',
  }
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: EMPTY_ITEMS,
      isCartOpen: false,

      // -----------------------------
      // ADD TO CART
      // -----------------------------

      addToCart: (
        product,
        size = '',
        color = '',
        quantity = 1,
        price = null
      ) => {
        if (!product?.id) {
          console.error(
            'addToCart: product id is missing',
            product
          )
          return
        }

        const numericPrice =
          price !== null
            ? Number(price)
            : Number(product.base_price || 0)

        const cartId = makeCartId(
          product.id,
          size,
          color
        )

        const quantityToAdd = Math.max(
          1,
          Number(quantity || 1)
        )

        set((state) => {
          const existingIndex =
            state.items.findIndex(
              (item) =>
                item.cartId === cartId
            )

          // Existing product
          if (existingIndex !== -1) {
            const updatedItems = [
              ...state.items,
            ]

            const existing =
              updatedItems[existingIndex]

            updatedItems[existingIndex] =
              normalizeItem({
                ...existing,
                quantity:
                  existing.quantity +
                  quantityToAdd,
              })

            return {
              items: updatedItems,
            }
          }

          // New product
          const newItem =
            normalizeItem({
              cartId,
              id: product.id,
              product_id: product.id,

              name: product.name,
              slug: product.slug,

              price: numericPrice,

              quantity:
                quantityToAdd,

              size,
              color,

              image:
                product.image ||
                product.image_url ||
                product.product_image ||
                '',

              image_url:
                product.image_url ||
                product.image ||
                product.product_image ||
                '',
            })

          return {
            items: [
              ...state.items,
              newItem,
            ],
          }
        })
      },

      // -----------------------------
      // REMOVE
      // -----------------------------

      removeFromCart: (cartId) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              item.cartId !== cartId
          ),
        }))
      },

      // -----------------------------
      // INCREASE
      // -----------------------------

      increaseQuantity: (cartId) => {
        set((state) => ({
          items: state.items.map(
            (item) =>
              item.cartId === cartId
                ? {
                    ...item,
                    quantity:
                      item.quantity + 1,
                  }
                : item
          ),
        }))
      },

      // -----------------------------
      // DECREASE
      // -----------------------------

      decreaseQuantity: (cartId) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              item.cartId === cartId
                ? {
                    ...item,
                    quantity:
                      item.quantity - 1,
                  }
                : item
            )
            .filter(
              (item) =>
                item.quantity > 0
            ),
        }))
      },

      // -----------------------------
      // CLEAR CART
      // -----------------------------

      clearCart: () => {
        set({
          items: [],
        })
      },

      // -----------------------------
      // CART OPEN
      // -----------------------------

      openCart: () => {
        set({
          isCartOpen: true,
        })
      },

      closeCart: () => {
        set({
          isCartOpen: false,
        })
      },

      setIsCartOpen: (value) => {
        set({
          isCartOpen: Boolean(value),
        })
      },

      // -----------------------------
      // TOTAL
      // -----------------------------

      getCartTotal: () => {
        return get().items.reduce(
          (total, item) =>
            total +
            Number(item.price || 0) *
              Number(item.quantity || 0),
          0
        )
      },

      // -----------------------------
      // COUNT
      // -----------------------------

      getCartCount: () => {
        return get().items.reduce(
          (count, item) =>
            count +
            Number(item.quantity || 0),
          0
        )
      },
    }),

    {
      name: 'radha-outfit-cart',

      storage:
        createJSONStorage(() =>
          localStorage
        ),

      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
)