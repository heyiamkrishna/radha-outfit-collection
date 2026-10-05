import ProductCard from './ProductCard'

export default function ProductGrid({
  products = [],
  emptyMessage = 'No products found.',
}) {
  if (!products || products.length === 0) {
    return (
      <div className="flex w-full items-center justify-center rounded-2xl border border-dashed border-neutral-200 py-24">
        <p className="text-neutral-500">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id || product.slug || index}
          product={product}
        />
      ))}
    </div>
  )
}