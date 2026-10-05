'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function clean(value) {
  if (value === undefined || value === null) {
    return null
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed === '' ? null : trimmed
  }

  return value
}

export async function getHeroSlides() {
  const supabase = await createClient()

  const {
    data,
    error
  } = await supabase
    .from('hero_slides')
    .select(`
      id,
      title,
      subtitle,
      description,
      image_url,
      mobile_image_url,
      button_text,
      button_link,
      badge,
      sort_order,
      is_active,
      created_at,
      updated_at
    `)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getHeroSlides:', error)
    throw new Error(error.message)
  }

  return data || []
}

export async function createHeroSlide(formData) {
  const supabase = await createClient()

  const payload = {
    title: clean(formData.title),
    subtitle: clean(formData.subtitle),
    description: clean(formData.description),

    image_url: clean(formData.image_url),
    mobile_image_url: clean(formData.mobile_image_url),

    button_text: clean(formData.button_text) || 'Shop Now',
    button_link: clean(formData.button_link) || '/shop',

    badge: clean(formData.badge),

    sort_order: Number(formData.sort_order) || 0,

    is_active:
      formData.is_active === true ||
      formData.is_active === 'true'
  }

  if (!payload.title) {
    throw new Error('Title is required')
  }

  if (!payload.image_url) {
    throw new Error('Image URL is required')
  }

  const { data, error } = await supabase
    .from('hero_slides')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('createHeroSlide:', error)
    throw new Error(error.message)
  }

  revalidatePath('/admin/hero-slider')
  revalidatePath('/')

  return data
}

export async function updateHeroSlide(id, formData) {
  const supabase = await createClient()

  if (!id) {
    throw new Error('Hero slide ID is required')
  }

  const payload = {
    title: clean(formData.title),
    subtitle: clean(formData.subtitle),
    description: clean(formData.description),

    image_url: clean(formData.image_url),
    mobile_image_url: clean(formData.mobile_image_url),

    button_text: clean(formData.button_text) || 'Shop Now',
    button_link: clean(formData.button_link) || '/shop',

    badge: clean(formData.badge),

    sort_order: Number(formData.sort_order) || 0,

    is_active:
      formData.is_active === true ||
      formData.is_active === 'true',

    updated_at: new Date().toISOString()
  }

  if (!payload.title) {
    throw new Error('Title is required')
  }

  if (!payload.image_url) {
    throw new Error('Image URL is required')
  }

  const {
    data,
    error
  } = await supabase
    .from('hero_slides')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('updateHeroSlide:', error)
    throw new Error(error.message)
  }

  revalidatePath('/admin/hero-slider')
  revalidatePath('/')

  return data
}

export async function deleteHeroSlide(id) {
  const supabase = await createClient()

  if (!id) {
    throw new Error('Hero slide ID is required')
  }

  const {
    error
  } = await supabase
    .from('hero_slides')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('deleteHeroSlide:', error)
    throw new Error(error.message)
  }

  revalidatePath('/admin/hero-slider')
  revalidatePath('/')

  return {
    success: true
  }
}

export async function toggleHeroSlide(id, isActive) {
  const supabase = await createClient()

  if (!id) {
    throw new Error('Hero slide ID is required')
  }

  const {
    data,
    error
  } = await supabase
    .from('hero_slides')
    .update({
      is_active: Boolean(isActive),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('toggleHeroSlide:', error)
    throw new Error(error.message)
  }

  revalidatePath('/admin/hero-slider')
  revalidatePath('/')

  return data
}