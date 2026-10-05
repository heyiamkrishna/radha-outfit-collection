'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  Search,
  Bell,
  ExternalLink,
  ChevronDown,
  X,
} from 'lucide-react'
import { useState } from 'react'

const pageNames = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/products/new': 'Add Product',
  '/admin/orders': 'Orders',
  '/admin/customers': 'Customers',
  '/admin/inventory': 'Inventory',
  '/admin/coupons': 'Coupons',
  '/admin/hero-slides': 'Hero Slides',
  '/admin/offline': 'Offline POS',
}

export default function AdminHeader({
  onMenuClick,
}) {
  const pathname = usePathname()

  const [searchOpen, setSearchOpen] =
    useState(false)

  const [profileOpen, setProfileOpen] =
    useState(false)

  const pageName =
    pageNames[pathname] ||
    Object.entries(pageNames).find(
      ([path]) =>
        pathname?.startsWith(`${path}/`)
    )?.[1] ||
    'Admin'

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">

      <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-3">

          {/* MOBILE MENU */}
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 transition hover:border-black hover:text-black lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={19} />
          </button>

          {/* BRAND */}
          <Link
            href="/admin"
            className="group hidden items-center gap-3 sm:flex"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-sm transition duration-300 group-hover:scale-105">
              <span className="text-sm font-black">
                R
              </span>
            </div>

            <div className="hidden md:block">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-neutral-950">
                Radha
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-neutral-400">
                Outfit Collection
              </p>
            </div>
          </Link>

          {/* DIVIDER */}
          <div className="hidden h-7 w-px bg-neutral-200 sm:block" />

          {/* PAGE TITLE */}
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-neutral-950">
              {pageName}
            </p>

            <div className="hidden items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-neutral-400 sm:flex">
              <span>Admin</span>
              <span>/</span>
              <span className="truncate">
                {pageName}
              </span>
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">

          {/* SEARCH */}
          <div className="relative">

            {searchOpen && (
              <div className="absolute right-0 top-12 z-50 w-[280px] rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl sm:w-[320px]">
                <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3">
                  <Search
                    size={16}
                    className="text-neutral-400"
                  />

                  <input
                    autoFocus
                    type="search"
                    placeholder="Search admin..."
                    className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setSearchOpen(false)
                    }
                    className="text-neutral-400 hover:text-black"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setSearchOpen(
                  (value) => !value
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition hover:border-black hover:text-black"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

          </div>

          {/* STORE */}
          <Link
            href="/"
            target="_blank"
            className="hidden h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-bold text-neutral-600 transition hover:border-black hover:text-black md:flex"
          >
            <ExternalLink size={15} />
            Store
          </Link>

          {/* NOTIFICATIONS */}
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 transition hover:border-black hover:text-black"
            aria-label="Notifications"
          >
            <Bell size={18} />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* PROFILE */}
          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (value) => !value
                )
              }
              className="flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-2 transition hover:border-black"
            >

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-[10px] font-black text-white">
                A
              </div>

              <div className="hidden text-left lg:block">
                <p className="text-[11px] font-black text-neutral-900">
                  Admin
                </p>

                <p className="text-[9px] text-neutral-400">
                  Administrator
                </p>
              </div>

              <ChevronDown
                size={14}
                className={`hidden text-neutral-400 transition-transform lg:block ${
                  profileOpen
                    ? 'rotate-180'
                    : ''
                }`}
              />

            </button>

            {/* PROFILE DROPDOWN */}
            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl">

                <div className="border-b border-neutral-100 px-3 py-3">
                  <p className="text-xs font-black text-neutral-900">
                    Admin Account
                  </p>

                  <p className="mt-1 text-[10px] text-neutral-400">
                    Radha Outfit Collection
                  </p>
                </div>

                <Link
                  href="/"
                  className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-neutral-600 transition hover:bg-neutral-50 hover:text-black"
                >
                  <ExternalLink size={15} />
                  View Store
                </Link>

                <Link
                  href="/admin"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-neutral-600 transition hover:bg-neutral-50 hover:text-black"
                >
                  Dashboard
                </Link>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* MOBILE PAGE INDICATOR */}
      <div className="border-t border-neutral-100 px-4 py-2 sm:hidden">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
          <span>ADMIN</span>
          <span>/</span>
          <span className="text-neutral-900">
            {pageName}
          </span>
        </div>
      </div>

    </header>
  )
}