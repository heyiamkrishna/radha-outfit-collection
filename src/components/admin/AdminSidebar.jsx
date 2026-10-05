'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Boxes,
  TicketPercent,
  Image,
  Store,
  LogOut,
  X,
  ChevronRight,
} from 'lucide-react'

const navigation = [
  {
    label: 'Overview',
    items: [
      {
        name: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: 'Store',
    items: [
      
      {
        name: 'Orders',
        href: '/admin/orders',
        icon: ShoppingCart,
      },
      {
        name: 'Customers',
        href: '/admin/customers',
        icon: Users,
      },
     
      {
        name: 'Coupons',
        href: '/admin/coupons',
        icon: TicketPercent,
      },
      {
        name: 'Hero Slides',
        href: '/admin/hero-slides',
        icon: Image,
      },
    ],
  },
  {
    label: 'Offline',
    items: [
      {
        name: 'Offline POS',
        href: '/admin/offline',
        icon: Store,
      },
    ],
  },
]

export default function AdminSidebar({
  mobileOpen = false,
  onClose,
}) {
  const pathname = usePathname()

  const isActive = (href) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }

    return (
      pathname === href ||
      pathname?.startsWith(`${href}/`)
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-[260px]
          flex-col
          border-r
          border-neutral-200
          bg-white
          transition-transform
          duration-300
          lg:translate-x-0
          ${
            mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >

        {/* BRAND */}
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-neutral-100 px-5">

          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-sm">
              <span className="text-sm font-black">
                R
              </span>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-950">
                Radha
              </p>

              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                Admin Panel
              </p>
            </div>

          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-black lg:hidden"
          >
            <X size={17} />
          </button>

        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">

          {navigation.map(
            (section) => (
              <div
                key={section.label}
                className="mb-6"
              >

                <p className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
                  {section.label}
                </p>

                <div className="space-y-1">

                  {section.items.map(
                    (item) => {
                      const Icon =
                        item.icon

                      const active =
                        isActive(
                          item.href
                        )

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={`
                            group
                            flex
                            h-11
                            items-center
                            gap-3
                            rounded-xl
                            px-3
                            text-sm
                            font-bold
                            transition-all
                            duration-200
                            ${
                              active
                                ? 'bg-black text-white shadow-md'
                                : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                            }
                          `}
                        >

                          <Icon
                            size={18}
                            strokeWidth={
                              active
                                ? 2.5
                                : 2
                            }
                          />

                          <span className="flex-1">
                            {item.name}
                          </span>

                          <ChevronRight
                            size={14}
                            className={`
                              transition
                              ${
                                active
                                  ? 'opacity-100'
                                  : 'opacity-0 group-hover:translate-x-0.5 group-hover:opacity-50'
                              }
                            `}
                          />

                        </Link>
                      )
                    }
                  )}

                </div>

              </div>
            )
          )}

        </nav>

        {/* BOTTOM */}
        <div className="shrink-0 border-t border-neutral-100 p-3">

          <Link
            href="/"
            target="_blank"
            className="mb-2 flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
          >
            <Store size={18} />
            <span>View Store</span>
          </Link>

          <button
            type="button"
            className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-neutral-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>

        </div>

      </aside>
    </>
  )
}