'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { LockKeyhole, X, ArrowRight, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginRequiredModal({
  open,
  onClose,
  redirectTo = '/checkout',
}) {
  const router = useRouter()

  const handleLogin = () => {
    const redirect = encodeURIComponent(redirectTo)

    router.push(`/auth/login?redirect=${redirect}`)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">

          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          {/* MODAL */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.94,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.94,
              y: 20,
            }}
            transition={{
              duration: 0.25,
              ease: 'easeOut',
            }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-2xl backdrop-blur-2xl"
          >

            {/* CLOSE */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200 hover:text-black"
            >
              <X size={17} />
            </button>

            {/* TOP VISUAL */}
            <div className="relative overflow-hidden bg-neutral-950 px-7 pb-8 pt-10 text-white">

              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

              <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-white/5 blur-3xl" />

              <div className="relative">

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black shadow-xl">
                  <LockKeyhole size={24} />
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/50">
                  Radha Outfit Collection
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  Login to continue
                </h2>

                <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">
                  Please sign in to continue to checkout and securely place
                  your order.
                </p>

              </div>
            </div>

            {/* BODY */}
            <div className="p-6">

              <div className="mb-5 flex items-center gap-3 rounded-2xl bg-neutral-50 p-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <ShoppingBag
                    size={19}
                    className="text-neutral-700"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-neutral-900">
                    Your cart is ready
                  </p>

                  <p className="mt-0.5 text-xs text-neutral-500">
                    Sign in and continue where you left off.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={handleLogin}
                className="group flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 text-sm font-black text-white transition hover:bg-neutral-800 active:scale-[0.98]"
              >
                Login to Continue

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full rounded-2xl px-5 py-3 text-xs font-bold text-neutral-500 transition hover:bg-neutral-50 hover:text-black"
              >
                Continue Shopping
              </button>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}