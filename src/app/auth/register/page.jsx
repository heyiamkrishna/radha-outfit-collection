'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Mail, Lock, User, AlertCircle } from 'lucide-react'
import { signup } from '@/actions/auth'

export default function RegisterPage() {
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await signup(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-neutral-50/50 px-4 sm:px-6 pt-24 pb-12">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 md:p-10 rounded-3xl md:rounded-[2rem] shadow-2xl shadow-black/[0.03] border border-neutral-100">
        
        <div className="text-center mb-6 md:mb-8">
          <Link href="/" className="inline-block font-[family-name:var(--font-syne)] text-2xl md:text-3xl font-extrabold tracking-tight mb-4 md:mb-6">
            RADHA.
          </Link>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-1.5 md:mb-2">Create Account</h1>
          <p className="text-xs md:text-sm text-neutral-500 px-2">Join us to checkout faster and track your orders.</p>
        </div>

        {error && (
          <div className="mb-5 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-100 text-red-600 text-xs md:text-sm rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 md:mb-2 ml-1">First Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                <input type="text" name="firstName" required className="w-full h-12 md:h-14 pl-10 md:pl-12 pr-4 md:pr-5 rounded-xl md:rounded-2xl border-2 border-neutral-100 bg-neutral-50 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all text-sm md:text-base font-medium text-black" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 md:mb-2 ml-1">Last Name</label>
              <input type="text" name="lastName" required className="w-full h-12 md:h-14 px-4 md:px-5 rounded-xl md:rounded-2xl border-2 border-neutral-100 bg-neutral-50 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all text-sm md:text-base font-medium text-black" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 md:mb-2 ml-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              <input type="email" name="email" required placeholder="name@example.com" className="w-full h-12 md:h-14 pl-10 md:pl-12 pr-4 md:pr-5 rounded-xl md:rounded-2xl border-2 border-neutral-100 bg-neutral-50 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all text-sm md:text-base font-medium text-black placeholder:text-neutral-300" />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 md:mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              <input type="password" name="password" required placeholder="••••••••" minLength="6" className="w-full h-12 md:h-14 pl-10 md:pl-12 pr-4 md:pr-5 rounded-xl md:rounded-2xl border-2 border-neutral-100 bg-neutral-50 focus:bg-white focus:border-black focus:ring-0 outline-none transition-all text-sm md:text-base font-medium text-black placeholder:text-neutral-300" />
            </div>
            <p className="text-[9px] md:text-[10px] text-neutral-400 mt-1.5 md:mt-2 ml-1">Must be at least 6 characters.</p>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full h-12 md:h-14 mt-4 md:mt-6 bg-black text-white rounded-xl md:rounded-2xl text-sm md:text-base font-bold hover:bg-neutral-800 transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-xl shadow-black/10 disabled:opacity-70 group"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creating Account...
              </span>
            ) : (
              <>
                Create Account
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 md:mt-8 text-center text-xs md:text-sm font-medium text-neutral-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-black font-bold hover:underline underline-offset-4">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  )
}