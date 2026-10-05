export default function StockStatus({
  stock,
}) {
  const quantity =
    Number(stock) || 0

  if (quantity <= 0) {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-semibold text-red-600">
        Out of stock
      </span>
    )
  }

  if (quantity <= 5) {
    return (
      <span className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-600">
        Low stock
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-600">
      In stock
    </span>
  )
}