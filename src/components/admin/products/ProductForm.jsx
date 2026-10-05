'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Loader2,
  Package,
  Percent,
  Save,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ProductForm({ categories = [] }) {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    name: '',
    description: '',
    category_id: '',
    gender: 'UNISEX',
    base_price: '',
    compare_price: '',
    stock: '0',
    badge: '',
    is_active: true,
  })

  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const discount = useMemo(() => {
    const sale = Number(form.base_price)
    const actual = Number(form.compare_price)

    if (!sale || !actual || actual <= sale) {
      return 0
    }

    return Math.round(((actual - sale) / actual) * 100)
  }, [form.base_price, form.compare_price])

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  function handleImageChange(event) {
    const files = Array.from(event.target.files || [])

    if (!files.length) return

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        return false
      }

      if (file.size > 5 * 1024 * 1024) {
        return false
      }

      return true
    })

    setImages((previous) => [...previous, ...validFiles])

    const previews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))

    setImagePreviews((previous) => [...previous, ...previews])

    event.target.value = ''
  }

  function removeImage(index) {
    setImages((previous) => previous.filter((_, i) => i !== index))

    setImagePreviews((previous) => {
      const item = previous[index]

      if (item?.url) {
        URL.revokeObjectURL(item.url)
      }

      return previous.filter((_, i) => i !== index)
    })
  }

  function createSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  async function uploadImages(productId) {
    if (!images.length) {
      return []
    }

    setUploading(true)

    const uploadedImages = []

    try {
      for (let index = 0; index < images.length; index++) {
        const file = images[index]

        const extension =
          file.name.split('.').pop()?.toLowerCase() || 'jpg'

        const fileName = `${productId}-${Date.now()}-${index}.${extension}`

        const filePath = `products/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          })

        if (uploadError) {
          throw uploadError
        }

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        if (data?.publicUrl) {
          uploadedImages.push({
            product_id: productId,
            image_url: data.publicUrl,
            sort_order: index,
          })
        }
      }

      return uploadedImages
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    const name = form.name.trim()
    const basePrice = Number(form.base_price)
    const comparePrice = Number(form.compare_price || 0)
    const stock = Number(form.stock || 0)

    if (!name) {
      setError('Product name is required.')
      return
    }

    if (!form.category_id) {
      setError('Please select a category.')
      return
    }

    if (!basePrice || basePrice <= 0) {
      setError('Please enter a valid sale price.')
      return
    }

    if (comparePrice > 0 && comparePrice < basePrice) {
      setError(
        'Actual price must be greater than or equal to the sale price.'
      )
      return
    }

    if (stock < 0) {
      setError('Stock cannot be negative.')
      return
    }

    setLoading(true)

    try {
      const slug = createSlug(name)

      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      let finalSlug = slug

      if (existingProduct) {
        finalSlug = `${slug}-${Date.now()}`
      }

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name,
          slug: finalSlug,
          description: form.description.trim() || null,
          category_id: form.category_id,
          gender: form.gender,
          base_price: basePrice,
          compare_price: comparePrice || null,
          stock,
          badge: form.badge || null,
          is_active: form.is_active,
        })
        .select('id')
        .single()

      if (productError) {
        throw productError
      }

      if (images.length > 0) {
        const uploadedImages = await uploadImages(product.id)

        if (uploadedImages.length > 0) {
          const { error: imageError } = await supabase
            .from('product_images')
            .insert(uploadedImages)

          if (imageError) {
            console.error(
              'Product image database error:',
              imageError
            )
          }
        }
      }

      setSuccess('Product created successfully.')

      setTimeout(() => {
        router.push('/admin/products')
        router.refresh()
      }, 700)
    } catch (submitError) {
      console.error('Create product error:', submitError)

      setError(
        submitError?.message ||
          'Something went wrong while creating the product.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-12">
      {/* Header */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:text-black"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white">
                <Package size={16} />
              </span>

              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
                Radha Outfit Collection
              </span>
            </div>

            <h1 className="font-[family-name:var(--font-syne)] text-4xl font-black tracking-[-0.04em] text-neutral-950 sm:text-5xl">
              Add New Product
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
              Create a product for your online store and manage its
              pricing, inventory, category and images.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-500 shadow-sm md:flex">
            <Sparkles size={14} />
            Product Management
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          <X className="mt-0.5 shrink-0" size={18} />

          <div>
            <p className="font-bold">Unable to create product</p>
            <p className="mt-1 text-red-600">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">
          <Check className="mt-0.5 shrink-0" size={18} />

          <div>
            <p className="font-bold">Product created</p>
            <p className="mt-1 text-emerald-600">
              Redirecting to products...
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Main */}
          <div className="space-y-6">
            {/* Basic Information */}
            <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_15px_50px_rgba(0,0,0,0.05)] sm:p-7">
              <div className="mb-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-950 text-white">
                    <Tag size={18} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-neutral-950">
                      Basic Information
                    </h2>

                    <p className="text-sm text-neutral-400">
                      Product identity and description
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <Field label="Product Name" required>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateField('name', event.target.value)
                    }
                    placeholder="e.g. Oversized Heavyweight T-Shirt"
                    className="admin-input"
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        'description',
                        event.target.value
                      )
                    }
                    rows={5}
                    placeholder="Describe the product, fabric, fit, design and other useful information..."
                    className="admin-input resize-none"
                  />
                </Field>
              </div>
            </section>

            {/* Category */}
            <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_15px_50px_rgba(0,0,0,0.05)] sm:p-7">
              <div className="mb-7">
                <h2 className="text-lg font-bold text-neutral-950">
                  Classification
                </h2>

                <p className="mt-1 text-sm text-neutral-400">
                  Organize this product in your catalog
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Category" required>
                  <select
                    value={form.category_id}
                    onChange={(event) =>
                      updateField(
                        'category_id',
                        event.target.value
                      )
                    }
                    className="admin-input appearance-none"
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Gender">
                  <select
                    value={form.gender}
                    onChange={(event) =>
                      updateField('gender', event.target.value)
                    }
                    className="admin-input appearance-none"
                  >
                    <option value="MEN">Men</option>
                    <option value="WOMEN">Women</option>
                    <option value="KIDS">Kids</option>
                    <option value="UNISEX">Unisex</option>
                  </select>
                </Field>
              </div>
            </section>

            {/* Pricing */}
            <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_15px_50px_rgba(0,0,0,0.05)] sm:p-7">
              <div className="mb-7 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-neutral-950">
                    Pricing
                  </h2>

                  <p className="mt-1 text-sm text-neutral-400">
                    Set sale and original prices
                  </p>
                </div>

                {discount > 0 && (
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <Percent size={13} />
                    {discount}% OFF
                  </div>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Sale Price" required>
                  <PriceInput
                    value={form.base_price}
                    onChange={(value) =>
                      updateField('base_price', value)
                    }
                    placeholder="499"
                  />
                </Field>

                <Field label="Actual Price">
                  <PriceInput
                    value={form.compare_price}
                    onChange={(value) =>
                      updateField('compare_price', value)
                    }
                    placeholder="1299"
                  />
                </Field>
              </div>

              {discount > 0 && (
                <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">
                      Customer saves
                    </span>

                    <span className="font-bold text-neutral-950">
                      ₹
                      {(
                        Number(form.compare_price) -
                        Number(form.base_price)
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* Inventory */}
            <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_15px_50px_rgba(0,0,0,0.05)] sm:p-7">
              <div className="mb-7">
                <h2 className="text-lg font-bold text-neutral-950">
                  Inventory
                </h2>

                <p className="mt-1 text-sm text-neutral-400">
                  Manage stock availability
                </p>
              </div>

              <Field label="Stock Quantity">
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(event) =>
                    updateField('stock', event.target.value)
                  }
                  placeholder="0"
                  className="admin-input"
                />
              </Field>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Images */}
            <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_15px_50px_rgba(0,0,0,0.05)] sm:p-6">
              <div className="mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100">
                    <ImagePlus size={18} />
                  </div>

                  <div>
                    <h2 className="font-bold text-neutral-950">
                      Product Images
                    </h2>

                    <p className="text-xs text-neutral-400">
                      JPG, PNG or WEBP · Max 5MB
                    </p>
                  </div>
                </div>
              </div>

              <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 px-5 py-10 text-center transition hover:border-neutral-400 hover:bg-neutral-100">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition group-hover:scale-105">
                  <Upload size={19} />
                </div>

                <p className="text-sm font-bold text-neutral-800">
                  Upload images
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  Click to browse
                </p>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {imagePreviews.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {imagePreviews.map((item, index) => (
                    <div
                      key={`${item.url}-${index}`}
                      className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100"
                    >
                      <img
                        src={item.url}
                        alt={`Product ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      {index === 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold uppercase tracking-wide backdrop-blur">
                          Main
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/75 text-white opacity-0 backdrop-blur transition group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Store Settings */}
            <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_15px_50px_rgba(0,0,0,0.05)] sm:p-6">
              <div className="mb-6">
                <h2 className="font-bold text-neutral-950">
                  Store Settings
                </h2>

                <p className="mt-1 text-xs text-neutral-400">
                  Control visibility and product badge
                </p>
              </div>

              <div className="space-y-5">
                <Field label="Product Badge">
                  <select
                    value={form.badge}
                    onChange={(event) =>
                      updateField('badge', event.target.value)
                    }
                    className="admin-input appearance-none"
                  >
                    <option value="">No badge</option>
                    <option value="TRENDING">
                      Trending
                    </option>
                    <option value="NEW">New</option>
                    <option value="SALE">Sale</option>
                    <option value="FEATURED">
                      Featured
                    </option>
                  </select>
                </Field>

                <div className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4">
                  <div>
                    <p className="text-sm font-bold text-neutral-900">
                      Active Product
                    </p>

                    <p className="mt-1 text-xs text-neutral-400">
                      Show product on the storefront
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        'is_active',
                        !form.is_active
                      )
                    }
                    className={`relative h-7 w-12 rounded-full transition ${
                      form.is_active
                        ? 'bg-black'
                        : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                        form.is_active
                          ? 'left-6'
                          : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Create */}
            <section className="rounded-3xl bg-neutral-950 p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] sm:p-6">
              <div className="mb-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">
                  Ready to publish?
                </p>

                <h3 className="mt-2 text-lg font-bold">
                  Create your product
                </h3>

                <p className="mt-2 text-xs leading-5 text-white/50">
                  Your product will be added to the catalog and
                  become available according to its active status.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || uploading}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading || uploading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    {uploading
                      ? 'Uploading images...'
                      : 'Creating product...'}
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Create Product
                  </>
                )}
              </button>
            </section>
          </aside>
        </div>
      </form>

      <style jsx global>{`
        .admin-input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid #e5e5e5;
          background: #fafafa;
          padding: 0.85rem 1rem;
          font-size: 0.875rem;
          color: #171717;
          outline: none;
          transition:
            border-color 180ms ease,
            background 180ms ease,
            box-shadow 180ms ease,
            transform 180ms ease;
        }

        .admin-input::placeholder {
          color: #a3a3a3;
        }

        .admin-input:hover {
          border-color: #d4d4d4;
          background: #fff;
        }

        .admin-input:focus {
          border-color: #171717;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.06);
        }

        textarea.admin-input {
          line-height: 1.6;
        }
      `}</style>
    </div>
  )
}

function Field({ label, required = false, children }) {
  return (
    <div>
      <label className="mb-2.5 block text-sm font-bold text-neutral-800">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {children}
    </div>
  )
}

function PriceInput({
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">
        ₹
      </span>

      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="admin-input pl-9"
      />
    </div>
  )
}