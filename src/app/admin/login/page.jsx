'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()

    if (loading) return

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (loginError) {
        setError(loginError.message)
        setLoading(false)
        return
      }

      if (!data?.user) {
        setError('Unable to sign in. Please try again.')
        setLoading(false)
        return
      }

      const { data: profile, error: profileError } =
        await supabase
          .from('profiles')
          .select('role, is_active')
          .eq('id', data.user.id)
          .maybeSingle()

      if (profileError) {
        console.error('Admin profile error:', profileError)

        await supabase.auth.signOut()

        setError('Unable to verify administrator access.')
        setLoading(false)
        return
      }

      if (!profile) {
        await supabase.auth.signOut()

        setError('Admin profile not found.')
        setLoading(false)
        return
      }

      if (profile.role !== 'ADMIN') {
        await supabase.auth.signOut()

        setError('You do not have administrator access.')
        setLoading(false)
        return
      }

      if (profile.is_active !== true) {
        await supabase.auth.signOut()

        setError('Your administrator account is inactive.')
        setLoading(false)
        return
      }

      /*
       * Do NOT redirect to /admin/login here.
       * Successful login goes to protected dashboard.
       */
      router.replace('/admin')
      router.refresh()
    } catch (err) {
      console.error('Admin login error:', err)

      setError(
        err?.message ||
          'Something went wrong while signing in.'
      )

      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f3ef] px-4 py-10 text-neutral-950 sm:px-6">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-neutral-300/30 blur-[100px]" />

        <div className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-stone-300/40 blur-[120px]" />

        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-white/80 blur-[100px]" />

        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(#000 1px, transparent 1px),
              linear-gradient(90deg, #000 1px, transparent 1px)
            `,
            backgroundSize: '45px 45px',
          }}
        />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[460px]">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-5 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-black/10 bg-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <Sparkles
                size={22}
                strokeWidth={1.7}
              />
            </div>
          </div>

          <p className="mb-2 text-[9px] font-black uppercase tracking-[0.4em] text-neutral-400">
            Radha Outfit Collection
          </p>

          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            Admin Studio
          </h1>

          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-neutral-500">
            Manage your collection, orders, inventory and
            store operations from one place.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-[2rem] border border-black/[0.07] bg-white/75 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.10)] backdrop-blur-2xl sm:p-8">
          {/* Header */}
          <div className="mb-7 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">
                Secure Access
              </p>

              <h2 className="mt-1 text-xl font-bold tracking-tight">
                Welcome back
              </h2>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
              <ShieldCheck
                size={18}
                className="text-neutral-700"
              />
            </div>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-neutral-600"
              >
                Email Address
              </label>

              <div className="group relative">
                <Mail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-neutral-800"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                  autoComplete="email"
                  placeholder="admin@example.com"
                  className="h-13 w-full rounded-2xl border border-neutral-200 bg-white/80 pl-11 pr-4 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-neutral-600"
              >
                Password
              </label>

              <div className="group relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-neutral-800"
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="h-13 w-full rounded-2xl border border-neutral-200 bg-white/80 pl-11 pr-12 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="animate-[fadeIn_0.25s_ease-out] rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
                <div className="flex gap-3">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

                  <p className="text-xs font-medium leading-relaxed text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative flex h-13 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-neutral-950 px-5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-[0_18px_40px_rgba(0,0,0,0.20)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  <span>Enter Admin Studio</span>

                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight size={15} />
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Security note */}
          <div className="mt-7 flex items-center justify-center gap-2 text-[10px] font-medium text-neutral-400">
            <LockKeyhole size={12} />

            <span>
              Protected administrator access
            </span>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-7 text-center text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-400">
          © {new Date().getFullYear()} Radha Outfit Collection
        </p>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  )
}