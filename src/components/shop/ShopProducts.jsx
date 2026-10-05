import ShopProductCard from './ShopProductCard'

export default function ShopProducts({ products = [] }) {
  const safeProducts = Array.isArray(products)
    ? products.filter(
        (product) =>
          product &&
          product.id &&
          product.slug &&
          product.name
      )
    : []

  if (safeProducts.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-3xl bg-neutral-50">
        <div className="text-center">
          <h2 className="text-xl font-black text-neutral-900">
            No products found
          </h2>

          <p className="mt-2 text-sm text-neutral-500">
            Try changing your filters.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {safeProducts.map((product) => (
        <ShopProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  )
}