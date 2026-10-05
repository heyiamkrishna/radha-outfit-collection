import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/products/ProductForm'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Edit Product | Admin | Radha Outfit Collection',
}

export default async function EditProductPage({ params }) {
  const { id } = await params // Await params in Next.js 15
  const supabase = await createClient()

  // 1. Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })

  // 2. Fetch the specific product
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    notFound()
  }

  // Pass it all to the reusable form component
  return (
    <ProductForm 
      categories={categories || []} 
      initialData={product} 
      productId={id} 
    />
  )
}