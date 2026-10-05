'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Eye,
  Pencil,
  Package,
  MoreHorizontal,
} from 'lucide-react'

export default function ProductTable({
  products = [],
}) {
  const safeProducts = Array.isArray(products)
    ? products
    : []

  if (safeProducts.length === 0) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center shadow-sm">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
          <Package
            size={28}
            className="text-neutral-400"
          />
        </div>

        <h2 className="mt-5 text-lg font-black text-neutral-900">
          No products found
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          Add your first product to start managing your inventory.
        </p>

        <Link
          href="/admin/products/new"
          className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-bold text-white"
        >
          Add Product
        </Link>

      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">

      {/* DESKTOP TABLE */}
      <div className="hidden overflow-x-auto md:block">

        <table className="w-full min-w-[850px]">

          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/70">

              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-neutral-400">
                Product
              </th>

              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-neutral-400">
                Category
              </th>

              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-neutral-400">
                Price
              </th>

              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-neutral-400">
                Status
              </th>

              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-wider text-neutral-400">
                Actions
              </th>

            </tr>
          </thead>

          <tbody>

            {safeProducts.map((product) => {

              const image =
                product?.product_images?.[0]?.image_url ||
                '/placeholder-product.jpg'

              const price =
                Number(product?.base_price || 0)

              const comparePrice =
                Number(product?.compare_price || 0)

              return (
                <tr
                  key={product.id}
                  className="border-b border-neutral-100 last:border-0 transition hover:bg-neutral-50/70"
                >

                  {/* PRODUCT */}
                  <td className="px-6 py-4">

                    <div className="flex items-center gap-4">

                      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100">

                        <Image
                          src={image}
                          alt={product.name || 'Product'}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />

                      </div>

                      <div className="min-w-0">

                        <p className="line-clamp-1 text-sm font-bold text-neutral-900">
                          {product.name}
                        </p>

                        <p className="mt-1 text-xs text-neutral-400">
                          {product.slug}
                        </p>

                      </div>

                    </div>

                  </td>

                  {/* CATEGORY */}
                  <td className="px-6 py-4">

                    <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-700">
                      {product.gender || 'General'}
                    </span>

                  </td>

                  {/* PRICE */}
                  <td className="px-6 py-4">

                    <div className="flex items-center gap-2">

                      <span className="text-sm font-black text-neutral-900">
                        ₹{price.toLocaleString('en-IN')}
                      </span>

                      {comparePrice > price && (
                        <span className="text-xs text-neutral-400 line-through">
                          ₹{comparePrice.toLocaleString('en-IN')}
                        </span>
                      )}

                    </div>

                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">

                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase ${
                        product.is_active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >

                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          product.is_active
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                      />

                      {product.is_active
                        ? 'Active'
                        : 'Inactive'}

                    </span>

                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-4">

                    <div className="flex justify-end gap-2">

                      <Link
                        href={`/product/${product.slug}`}
                        target="_blank"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition hover:border-black hover:text-black"
                        title="View product"
                      >
                        <Eye size={15} />
                      </Link>

                      <Link
                        href={`/admin/products/${product.id}`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition hover:border-black hover:text-black"
                        title="Edit product"
                      >
                        <Pencil size={15} />
                      </Link>

                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition hover:border-black hover:text-black"
                      >
                        <MoreHorizontal size={15} />
                      </button>

                    </div>

                  </td>

                </tr>
              )
            })}

          </tbody>

        </table>

      </div>

      {/* MOBILE CARDS */}
      <div className="divide-y divide-neutral-100 md:hidden">

        {safeProducts.map((product) => {

          const image =
            product?.product_images?.[0]?.image_url ||
            '/placeholder-product.jpg'

          const price =
            Number(product?.base_price || 0)

          return (
            <div
              key={product.id}
              className="p-4"
            >

              <div className="flex gap-4">

                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">

                  <Image
                    src={image}
                    alt={product.name || 'Product'}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />

                </div>

                <div className="min-w-0 flex-1">

                  <h3 className="line-clamp-2 text-sm font-black text-neutral-900">
                    {product.name}
                  </h3>

                  <p className="mt-2 text-xs font-bold text-neutral-500">
                    {product.gender || 'General'}
                  </p>

                  <p className="mt-2 text-sm font-black">
                    ₹{price.toLocaleString('en-IN')}
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${
                      product.is_active
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {product.is_active
                      ? 'Active'
                      : 'Inactive'}
                  </span>

                </div>

              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">

                <Link
                  href={`/product/${product.slug}`}
                  target="_blank"
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 text-xs font-bold"
                >
                  <Eye size={14} />
                  View
                </Link>

                <Link
                  href={`/admin/products/${product.id}`}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl bg-black text-xs font-bold text-white"
                >
                  <Pencil size={14} />
                  Edit
                </Link>

              </div>

            </div>
          )
        })}

      </div>

    </div>
  )
}