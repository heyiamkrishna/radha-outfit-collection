'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  LogOut,
  Package,
  User,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { useCartStore } from '@/store/cartStore'
import { createClient } from '@/lib/supabase/client'
import { logout } from '@/actions/auth'

export default function Navbar() {
  const pathname = usePathname()

  const [isMounted, setIsMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [user, setUser] = useState(null)

  /*
   * IMPORTANT:
   * Do NOT do:
   *
   * const { ... } = useCartStore()
   *
   * because it can cause Zustand snapshot problems.
   */

  const setIsCartOpen = useCartStore(
    (state) => state.setIsCartOpen
  )

  const cartItems = useCartStore(
    (state) => state.items
  )

  /*
   * Calculate count from the actual items.
   * This replaces the missing getCartCount().
   */
  const cartCount = Array.isArray(cartItems)
    ? cartItems.reduce(
        (total, item) =>
          total + Number(item?.quantity || 0),
        0
      )
    : 0

  useEffect(() => {
    setIsMounted(true)

    const supabase = createClient()

    let mounted = true

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (mounted) {
        setUser(user || null)
      }
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(session?.user || null)
        }
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow =
      isMobileMenuOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const navLinks = [
    {
      name: 'Home',
      href: '/',
    },
    {
      name: 'Collection',
      href: '/shop',
    },
    {
      name: 'Feedback',
      href: '/feedback',
    },
    {
      name: 'About Us',
      href: '/about',
    },
  ]

  const handleSignOut = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }

    setUser(null)
    setIsProfileOpen(false)
    setIsMobileMenuOpen(false)
  }

  const firstName =
    user?.user_metadata?.first_name ||
    user?.user_metadata?.name ||
    'Account'

  const lastName =
    user?.user_metadata?.last_name || ''

  const userInitial =
    firstName?.charAt(0)?.toUpperCase() || 'U'

  const loginUrl = `/auth/login?next=${encodeURIComponent(
    pathname || '/'
  )}`

  return (
    <>
      <header className="fixed left-0 right-0 top-4 z-[50] px-3 sm:px-4 md:px-8">
        <nav
          className="
            mx-auto
            flex
            h-[68px]
            max-w-7xl
            items-center
            justify-between
            rounded-full
            border
            border-black/[0.06]
            bg-white/85
            px-4
            shadow-[0_10px_40px_rgba(0,0,0,0.06)]
            backdrop-blur-2xl
            sm:px-6
          "
        >
          {/* ================= LOGO ================= */}

          <Link
            href="/"
            className="group relative z-[60] flex flex-col leading-none"
          >
            <span
              className="
                font-[family-name:var(--font-syne)]
                text-xl
                font-black
                tracking-[0.12em]
                text-black
                transition-transform
                group-hover:scale-[1.02]
                sm:text-2xl
              "
            >
              RADHA
            </span>

            <span
              className="
                mt-1
                text-[7px]
                font-bold
                uppercase
                tracking-[0.28em]
                text-neutral-400
                sm:text-[8px]
              "
            >
              Outfit Collection
            </span>
          </Link>

          {/* ================= DESKTOP NAV ================= */}

          <div className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => {
              const active =
                pathname === link.href ||
                (
                  link.href !== '/' &&
                  pathname?.startsWith(
                    `${link.href}/`
                  )
                )

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative
                    py-2
                    text-[12px]
                    font-bold
                    transition-colors
                    ${
                      active
                        ? 'text-black'
                        : 'text-neutral-500 hover:text-black'
                    }
                  `}
                >
                  {link.name}

                  {active && (
                    <motion.span
                      layoutId="navbar-active"
                      className="
                        absolute
                        -bottom-0.5
                        left-0
                        right-0
                        mx-auto
                        h-[2px]
                        rounded-full
                        bg-black
                      "
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* ================= ACTIONS ================= */}

          <div className="flex items-center gap-2 sm:gap-3">

            {/* SEARCH */}

            <Link
              href="/shop"
              aria-label="Search products"
              className="
                hidden
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                transition
                hover:bg-neutral-100
                sm:flex
              "
            >
              <Search
                size={18}
                strokeWidth={1.7}
              />
            </Link>

            {/* CART */}

            <button
              type="button"
              aria-label="Open shopping cart"
              onClick={() =>
                setIsCartOpen(true)
              }
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                transition
                hover:bg-neutral-100
                active:scale-95
              "
            >
              <ShoppingCart
                size={19}
                strokeWidth={1.7}
              />

              {isMounted &&
                cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{
                      scale: 0.6,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    className="
                      absolute
                      -right-0.5
                      -top-0.5
                      flex
                      h-[18px]
                      min-w-[18px]
                      items-center
                      justify-center
                      rounded-full
                      bg-black
                      px-1
                      text-[9px]
                      font-black
                      text-white
                    "
                  >
                    {cartCount > 99
                      ? '99+'
                      : cartCount}
                  </motion.span>
                )}
            </button>

            {/* DESKTOP ACCOUNT */}

            {user ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() =>
                    setIsProfileOpen(
                      (value) => !value
                    )
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-full
                    bg-neutral-100
                    py-1
                    pl-1
                    pr-3
                    transition
                    hover:bg-neutral-200
                  "
                >
                  <span
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      bg-black
                      text-[10px]
                      font-black
                      uppercase
                      text-white
                    "
                  >
                    {userInitial}
                  </span>

                  <span className="max-w-[90px] truncate text-xs font-bold">
                    {firstName}
                  </span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 8,
                        scale: 0.97,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: 8,
                        scale: 0.97,
                      }}
                      className="
                        absolute
                        right-0
                        top-full
                        mt-3
                        w-64
                        overflow-hidden
                        rounded-3xl
                        border
                        border-black/[0.06]
                        bg-white
                        p-2
                        shadow-[0_20px_60px_rgba(0,0,0,0.12)]
                      "
                    >
                      <div className="rounded-2xl bg-neutral-50 p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-black
                              text-xs
                              font-black
                              text-white
                            "
                          >
                            {userInitial}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-black">
                              {firstName}{' '}
                              {lastName}
                            </p>

                            <p className="truncate text-[10px] text-neutral-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Link
                        href="/account"
                        onClick={() =>
                          setIsProfileOpen(
                            false
                          )
                        }
                        className="
                          mt-2
                          flex
                          items-center
                          gap-3
                          rounded-2xl
                          px-4
                          py-3
                          text-xs
                          font-bold
                          text-neutral-600
                          transition
                          hover:bg-neutral-50
                          hover:text-black
                        "
                      >
                        <Package size={15} />
                        My Orders
                      </Link>

                      <button
                        type="button"
                        onClick={
                          handleSignOut
                        }
                        className="
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-2xl
                          px-4
                          py-3
                          text-left
                          text-xs
                          font-bold
                          text-red-500
                          transition
                          hover:bg-red-50
                        "
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href={loginUrl}
                className="
                  hidden
                  rounded-full
                  bg-black
                  px-5
                  py-2.5
                  text-[11px]
                  font-black
                  text-white
                  transition
                  hover:bg-neutral-800
                  md:block
                "
              >
                Sign In
              </Link>
            )}

            {/* MOBILE MENU */}

            <button
              type="button"
              aria-label="Open menu"
              onClick={() =>
                setIsMobileMenuOpen(true)
              }
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                transition
                hover:bg-neutral-100
                lg:hidden
              "
            >
              <Menu
                size={21}
                strokeWidth={1.7}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* ================= MOBILE DRAWER ================= */}

      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">

            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setIsMobileMenuOpen(false)
              }
              className="
                absolute
                inset-0
                bg-black/40
                backdrop-blur-sm
              "
            />

            <motion.aside
              initial={{
                x: '100%',
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: '100%',
              }}
              transition={{
                type: 'spring',
                bounce: 0,
                duration: 0.45,
              }}
              className="
                absolute
                right-0
                top-0
                flex
                h-full
                w-[86%]
                max-w-sm
                flex-col
                bg-white
                px-7
                pb-8
                pt-7
                shadow-2xl
              "
            >
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  onClick={() =>
                    setIsMobileMenuOpen(
                      false
                    )
                  }
                  className="font-[family-name:var(--font-syne)] text-xl font-black tracking-widest"
                >
                  RADHA
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    setIsMobileMenuOpen(
                      false
                    )
                  }
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-neutral-100
                  "
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-14 flex flex-col gap-2">
                {navLinks.map(
                  (link, index) => {
                    const active =
                      pathname ===
                        link.href ||
                      (
                        link.href !== '/' &&
                        pathname?.startsWith(
                          `${link.href}/`
                        )
                      )

                    return (
                      <motion.div
                        key={link.href}
                        initial={{
                          opacity: 0,
                          x: 15,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay:
                            index * 0.05,
                        }}
                      >
                        <Link
                          href={link.href}
                          onClick={() =>
                            setIsMobileMenuOpen(
                              false
                            )
                          }
                          className={`
                            block
                            rounded-2xl
                            px-5
                            py-4
                            text-xl
                            font-black
                            transition
                            ${
                              active
                                ? 'bg-black text-white'
                                : 'text-neutral-500 hover:bg-neutral-50 hover:text-black'
                            }
                          `}
                        >
                          {link.name}
                        </Link>
                      </motion.div>
                    )
                  }
                )}
              </div>

              <div className="mt-auto space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(
                      false
                    )
                    setIsCartOpen(true)
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-2xl
                    border
                    border-neutral-200
                    px-5
                    py-4
                    text-sm
                    font-black
                  "
                >
                  <span className="flex items-center gap-3">
                    <ShoppingCart size={18} />
                    Shopping Bag
                  </span>

                  <span className="rounded-full bg-black px-2.5 py-1 text-[10px] text-white">
                    {cartCount}
                  </span>
                </button>

                {user ? (
                  <>
                    <div className="rounded-2xl bg-neutral-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-xs font-black text-white">
                          {userInitial}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black">
                            {firstName}{' '}
                            {lastName}
                          </p>
                          <p className="truncate text-[10px] text-neutral-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/account"
                      onClick={() =>
                        setIsMobileMenuOpen(
                          false
                        )
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-2xl
                        bg-neutral-100
                        py-4
                        text-sm
                        font-black
                      "
                    >
                      <User size={17} />
                      My Account
                    </Link>

                    <button
                      type="button"
                      onClick={
                        handleSignOut
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-2xl
                        bg-black
                        py-4
                        text-sm
                        font-black
                        text-white
                      "
                    >
                      <LogOut size={17} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href={loginUrl}
                    onClick={() =>
                      setIsMobileMenuOpen(
                        false
                      )
                    }
                    className="
                      block
                      w-full
                      rounded-2xl
                      bg-black
                      py-4
                      text-center
                      text-sm
                      font-black
                      text-white
                    "
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}