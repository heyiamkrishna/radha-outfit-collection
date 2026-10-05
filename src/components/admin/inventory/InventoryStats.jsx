import {
  AlertTriangle,
  Boxes,
  Package,
  XCircle,
} from 'lucide-react'

export default function InventoryStats({
  totalProducts,
  totalStock,
  lowStock,
  outOfStock,
}) {
  const cards = [
    {
      title: 'Products',
      value: totalProducts,
      description:
        'Total products',
      icon: Package,
    },
    {
      title: 'Total Stock',
      value: totalStock,
      description:
        'Units available',
      icon: Boxes,
    },
    {
      title: 'Low Stock',
      value: lowStock,
      description:
        '5 units or less',
      icon: AlertTriangle,
    },
    {
      title: 'Out of Stock',
      value: outOfStock,
      description:
        'Needs restocking',
      icon: XCircle,
    },
  ]

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      {cards.map((card) => {
        const Icon = card.icon

        return (
          <div
            key={card.title}
            className="group rounded-[28px] border border-black/[0.05] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium text-neutral-400">
                  {card.title}
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {card.value}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 transition group-hover:bg-neutral-950 group-hover:text-white">
                <Icon size={17} />
              </div>

            </div>

            <p className="mt-3 text-[10px] text-neutral-400">
              {card.description}
            </p>

          </div>
        )
      })}

    </div>
  )
}