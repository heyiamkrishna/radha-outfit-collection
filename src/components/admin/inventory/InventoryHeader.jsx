import {
  ArrowLeft,
  Package,
} from 'lucide-react'
import Link from 'next/link'

export default function InventoryHeader() {
  return (
    <div>

      <div className="flex items-center gap-4">

        <Link
          href="/admin"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/[0.06] bg-white shadow-sm transition hover:-translate-y-0.5"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>

          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
            Admin / Inventory
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
            Inventory
          </h1>

          <p className="mt-1 text-sm text-neutral-400">
            Monitor stock levels and manage your products.
          </p>

        </div>

      </div>

    </div>
  )
}