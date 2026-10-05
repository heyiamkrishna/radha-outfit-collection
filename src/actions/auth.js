'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const nextUrl = formData.get('nextUrl') || '/'

  if (!email || !password) {
    return {
      error: 'Email and password are required',
    }
  }

  const supabase = await createClient()

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    })

  if (error) {
    return {
      error: error.message,
    }
  }

  revalidatePath('/', 'layout')

  redirect(nextUrl)
}

export async function signup(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const firstName = formData.get('firstName')
  const lastName = formData.get('lastName')
  const nextUrl = formData.get('nextUrl') || '/'

  if (
    !email ||
    !password ||
    !firstName ||
    !lastName
  ) {
    return {
      error: 'All fields are required',
    }
  }

  const supabase = await createClient()

  const { error } =
    await supabase.auth.signUp({
      email,
      password,

      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })

  if (error) {
    return {
      error: error.message,
    }
  }

  revalidatePath('/', 'layout')

  redirect(nextUrl)
}

export async function logout() {
  const supabase = await createClient()

  await supabase.auth.signOut()

  revalidatePath('/', 'layout')

  redirect('/auth/login')
}