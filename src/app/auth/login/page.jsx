'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Mail, Lock, AlertCircle, Wand2 } from 'lucide-react'
import { login } from '@/actions/auth'
import { createClient } from '@/lib/supabase/client'

// Wrapped in a sub-component so we can safely use useSearchParams in Next.js 15
function LoginForm() {
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || '/'
  
  const [error, setError] = useState(searchParams.get('error') ? 'Authentication failed. Please try again.' : null)
  const [success, setSuccess] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const [loginMode, setLoginMode] = useState('password') // 'password' | 'magic'
  const [emailValue, setEmailValue] = useState('')

  // 1. Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    formData.append('nextUrl', nextUrl) // Attach the redirect URL
    
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  // 2. Google OAuth Login
  const handleGoogleLogin = async () => {
    setIsPending(true)
    const supabase = createClient()
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${nextUrl}`,
      },
    })
  }

  // 3. Email Magic Link
  const handleMagicLink = async (e) => {
    e.preventDefault()
    if (!emailValue) return setError("Please enter your email first.")
    
    setIsPending(true)
    setError(null)
    const supabase = createClient()
    
    const { error } = await supabase.auth.signInWithOtp({
      email: emailValue,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${nextUrl}`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess("Magic link sent! Check your inbox.")
    }
    setIsPending(false)
  }

  return (
    <div className="w-full max-w-md bg-white p-6 sm:p-8 md:p-10 rounded-3xl md:rounded-[2rem] shadow-2xl shadow-black/[0.03] border border-neutral-100">
      
      <div className="text-center mb-6 md:mb-8">
        <Link href="/" className="inline-block font-[family-name:var(--font-syne)] text-2xl md:text-3xl font-extrabold tracking-tight mb-4 md:mb-6">
          RADHA.
        </Link>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-1.5 md:mb-2">Welcome back</h1>
        <p className="text-xs md:text-sm text-neutral-500 px-2">Log in to access your orders and fast checkout.</p>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 text-xs md:text-sm rounded-xl flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" /> <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-5 p-3 bg-green-50 border border-green-100 text-green-700 text-xs md:text-sm rounded-xl flex items-center gap-2">
          <Wand2 size={16} className="shrink-0" /> <span>{success}</span>
        </div>
      )}

      {/* Google Button */}
      <button 
        onClick={handleGoogleLogin}
        disabled={isPending}
        className="w-full h-12 md:h-14 mb-6 border-2 border-neutral-100 rounded-xl md:rounded-2xl text-sm md:text-base font-bold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-200 transition-all flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute inset-x-0 h-px bg-neutral-100"></div>
        <span className="relative bg-white px-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Or</span>
      </div>

      <form onSubmit={loginMode === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-4 md:space-y-5">
        <div>
          <label className="block text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 md:mb-2 ml-1">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            <input 
              type="email" 
              name="email" 
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              required 
              placeholder="name@example.com" 
              className="w-full h-12 md:h-14 pl-10 md:pl-12 pr-4 md:pr-5 rounded-xl md:rounded-2xl border-2 border-neutral-100 bg-neutral-50 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all text-sm md:text-base font-medium text-black placeholder:text-neutral-300" 
            />
          </div>
        </div>
        
        {loginMode === 'password' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-1.5 md:mb-2 px-1">
              <label className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-wider">Password</label>
              <button type="button" onClick={() => setLoginMode('magic')} className="text-[10px] md:text-xs font-bold text-neutral-400 hover:text-black hover:underline underline-offset-4 transition-colors">
                Use Magic Link Instead
              </button>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              <input type="password" name="password" required={loginMode === 'password'} placeholder="••••••••" className="w-full h-12 md:h-14 pl-10 md:pl-12 pr-4 md:pr-5 rounded-xl md:rounded-2xl border-2 border-neutral-100 bg-neutral-50 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all text-sm md:text-base font-medium text-black placeholder:text-neutral-300" />
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full h-12 md:h-14 mt-4 bg-black text-white rounded-xl md:rounded-2xl text-sm md:text-base font-bold hover:bg-neutral-800 transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-xl shadow-black/10 disabled:opacity-70 group"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Processing...
            </span>
          ) : loginMode === 'password' ? (
            <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
          ) : (
            <>Send Magic Link <Wand2 size={18} className="group-hover:rotate-12 transition-transform" /></>
          )}
        </button>

        {loginMode === 'magic' && (
          <button type="button" onClick={() => setLoginMode('password')} className="w-full text-center text-xs font-bold text-neutral-400 hover:text-black mt-4 transition-colors">
            Cancel & use password
          </button>
        )}
      </form>

      <div className="mt-6 md:mt-8 text-center text-xs md:text-sm font-medium text-neutral-500">
        Don't have an account?{' '}
        <Link href={`/auth/register?next=${nextUrl}`} className="text-black font-bold hover:underline underline-offset-4">
          Create one
        </Link>
      </div>

    </div>
  )
}

// Wrap the page in a Suspense boundary (Required by Next.js 15 for useSearchParams)
export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-neutral-50/50 px-4 sm:px-6 pt-24 pb-12">
      <Suspense fallback={<div className="w-full max-w-md bg-white h-96 rounded-3xl animate-pulse"></div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}