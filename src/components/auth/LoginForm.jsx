'use client'

import Link from 'next/link'
import { Mail, Lock, Eye } from 'lucide-react'

export default function LoginForm() {
  return (
    <div className="w-full max-w-md mx-auto p-8">
      <div className="mb-8">
        <h1 className="font-serif text-4xl mb-2">Welcome Back</h1>
        <p className="text-neutral-500">Sign in to your account</p>
      </div>

      <form className="space-y-5">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
          </div>
          <input
            type="email"
            placeholder="Email or Phone Number"
            className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
            required
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
          </div>
          <input
            type="password"
            placeholder="Password"
            className="w-full pl-11 pr-12 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
            required
          />
          <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-black transition-colors">
            <Eye className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" className="rounded border-neutral-300 text-black focus:ring-black accent-black" />
            <span className="text-neutral-600">Remember me</span>
          </label>
          <Link href="/auth/forgot-password" className="text-neutral-500 hover:text-black transition-colors">
            Forgot Password?
          </Link>
        </div>

        <button type="submit" className="w-full bg-black text-white rounded-full py-3.5 text-sm font-medium hover:bg-neutral-800 transition-colors flex justify-center items-center">
          Sign In <span className="ml-2">→</span>
        </button>
      </form>

      <div className="mt-8 flex items-center justify-center space-x-4">
        <div className="h-px bg-neutral-200 flex-1" />
        <span className="text-xs text-neutral-400 uppercase tracking-widest">or</span>
        <div className="h-px bg-neutral-200 flex-1" />
      </div>

      <div className="mt-8 space-y-3">
        <button className="w-full flex items-center justify-center py-3 border border-neutral-200 rounded-full text-sm hover:bg-neutral-50 transition-colors">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-3" />
          Continue with Google
        </button>
        <button className="w-full flex items-center justify-center py-3 border border-neutral-200 rounded-full text-sm hover:bg-neutral-50 transition-colors">
          <Mail className="w-5 h-5 mr-3 text-neutral-600" />
          Continue with Phone
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-neutral-500">
        Don't have an account?{' '}
        <Link href="/auth/register" className="text-black font-medium hover:underline border-b border-black pb-0.5">
          Create Account
        </Link>
      </p>
    </div>
  )
}