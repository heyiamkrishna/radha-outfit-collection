'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  ArrowLeft,
  Check,
  Loader2,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react'

import { toast } from 'sonner'

import Navbar from '@/components/navbar/Navbar'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = useMemo(
    () => createClient(),
    []
  )

  // =====================================================
  // CART
  // =====================================================

  const items = useCartStore(
    (state) => state.items
  )

  const hasHydrated = useCartStore(
    (state) => state.hasHydrated
  )

  const clearCart = useCartStore(
    (state) => state.clearCart
  )

  // =====================================================
  // AUTH
  // =====================================================

  const [user, setUser] =
    useState(null)

  const [authLoading, setAuthLoading] =
    useState(true)

  // =====================================================
  // CHECKOUT STATE
  // =====================================================

  const [placingOrder, setPlacingOrder] =
    useState(false)

  const [step, setStep] =
    useState(1)

  const [paymentMethod, setPaymentMethod] =
    useState('COD')

  // =====================================================
  // ADDRESS
  // =====================================================

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    notes: '',
  })

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      try {
        const {
          data,
          error,
        } =
          await supabase.auth.getUser()

        if (!mounted) return

        if (error) {
          console.error(
            'AUTH ERROR:',
            error
          )
        }

        setUser(
          data?.user || null
        )
      } catch (error) {
        console.error(
          'AUTH EXCEPTION:',
          error
        )
      } finally {
        if (mounted) {
          setAuthLoading(false)
        }
      }
    }

    loadUser()

    return () => {
      mounted = false
    }
  }, [supabase])

  // =====================================================
  // REDIRECT LOGIN
  // =====================================================

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      const currentPath =
        '/checkout'

      router.replace(
        `/auth/login?redirect=${encodeURIComponent(
          currentPath
        )}`
      )
    }
  }, [
    authLoading,
    user,
    router,
  ])

  // =====================================================
  // NORMALIZE ITEMS
  // =====================================================

  const safeItems = useMemo(() => {
    if (!Array.isArray(items)) {
      return []
    }

    return items.filter(
      (item) =>
        item &&
        item.name &&
        Number(item.quantity) > 0
    )
  }, [items])

  // =====================================================
  // TOTALS
  // =====================================================

  const subtotal = useMemo(() => {
    return safeItems.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 0),
      0
    )
  }, [safeItems])

  const shippingFee =
    subtotal >= 999 || subtotal === 0
      ? 0
      : 99

  const discount = 0

  const totalAmount = Math.max(
    0,
    subtotal +
      shippingFee -
      discount
  )

  // =====================================================
  // UPDATE FORM
  // =====================================================

  const updateForm = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  // =====================================================
  // VALIDATE ADDRESS
  // =====================================================

  const validateAddress = () => {
    const required = [
      'full_name',
      'phone',
      'address_line_1',
      'city',
      'state',
      'postal_code',
    ]

    for (const field of required) {
      if (
        !String(
          form[field] || ''
        ).trim()
      ) {
        toast.error(
          `Please enter ${field
            .replaceAll('_', ' ')
            .replace(
              /^./,
              (letter) =>
                letter.toUpperCase()
            )}`
        )

        return false
      }
    }

    if (
      form.phone.replace(
        /\D/g,
        ''
      ).length < 10
    ) {
      toast.error(
        'Please enter a valid phone number.'
      )

      return false
    }

    if (
      form.postal_code.trim()
        .length < 5
    ) {
      toast.error(
        'Please enter a valid postal code.'
      )

      return false
    }

    return true
  }

  // =====================================================
  // PLACE ORDER
  // =====================================================

  const placeOrder = async () => {
    if (placingOrder) return

    if (!user) {
      toast.error(
        'Please login before placing your order.'
      )

      router.push(
        `/auth/login?redirect=${encodeURIComponent(
          '/checkout'
        )}`
      )

      return
    }

    if (!safeItems.length) {
      toast.error(
        'Your cart is empty.'
      )

      router.push('/shop')

      return
    }

    if (!validateAddress()) {
      setStep(1)
      return
    }

    try {
      setPlacingOrder(true)

      // =================================================
      // 1. CHECK USER PROFILE
      // =================================================

      const {
        data: profile,
        error:
          profileError,
      } = await supabase
        .from('profiles')
        .select(
          'id, first_name, last_name, email, phone'
        )
        .eq(
          'id',
          user.id
        )
        .maybeSingle()

      if (profileError) {
        console.error(
          'PROFILE FETCH ERROR:',
          profileError
        )

        throw new Error(
          'Unable to verify your account profile.'
        )
      }

      if (!profile) {
        throw new Error(
          'Your account profile is not ready yet. Please logout and login again.'
        )
      }

      // =================================================
      // 2. SHIPPING ADDRESS JSON
      //
      // We intentionally don't insert into addresses
      // here. Your addresses.user_id currently references
      // profiles.id and was causing the FK error.
      //
      // The order already has shipping_address JSONB.
      // =================================================

      const shippingAddress = {
        full_name:
          form.full_name.trim(),

        phone:
          form.phone.trim(),

        address_line_1:
          form.address_line_1.trim(),

        address_line_2:
          form.address_line_2.trim(),

        city:
          form.city.trim(),

        state:
          form.state.trim(),

        postal_code:
          form.postal_code.trim(),

        country:
          form.country.trim(),

        notes:
          form.notes.trim(),
      }

      // =================================================
      // 3. ORDER NUMBER
      // =================================================

      const orderNumber =
        `ROC-${Date.now()
          .toString()
          .slice(-8)}`

      // =================================================
      // 4. CREATE ORDER
      // =================================================

      const {
        data: order,
        error:
          orderError,
      } = await supabase
        .from('orders')
        .insert({
          order_number:
            orderNumber,

          user_id:
            user.id,

          customer_name:
            form.full_name.trim(),

          customer_email:
            user.email || '',

          customer_phone:
            form.phone.trim(),

          subtotal,

          shipping_fee:
            shippingFee,

          discount,

          total_amount:
            totalAmount,

          payment_method:
            paymentMethod,

          payment_status:
            paymentMethod === 'COD'
              ? 'PENDING'
              : 'PENDING',

          status:
            'PENDING',

          shipping_address:
            shippingAddress,

          notes:
            form.notes.trim(),
        })
        .select(
          'id, order_number'
        )
        .single()

      if (orderError) {
        console.error(
          'ORDER INSERT ERROR:',
          JSON.stringify(
            orderError,
            null,
            2
          )
        )

        throw new Error(
          orderError.message ||
            'Unable to create order.'
        )
      }

      // =================================================
      // 5. ORDER ITEMS
      // =================================================

      const orderItems =
        safeItems.map(
          (item) => ({
            order_id:
              order.id,

            product_id:
              item.productId ||
              item.id,

            product_name:
              item.name,

            product_image:
              item.image ||
              item.image_url ||
              null,

            quantity:
              Number(
                item.quantity
              ),

            unit_price:
              Number(
                item.price
              ),

            total_price:
              Number(
                item.price
              ) *
              Number(
                item.quantity
              ),

            size:
              item.size || null,
          })
        )

      const {
        error:
          orderItemsError,
      } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (orderItemsError) {
        console.error(
          'ORDER ITEMS ERROR:',
          JSON.stringify(
            orderItemsError,
            null,
            2
          )
        )

        // Try to remove the incomplete order
        await supabase
          .from('orders')
          .delete()
          .eq(
            'id',
            order.id
          )

        throw new Error(
          orderItemsError.message ||
            'Unable to save order items.'
        )
      }

      // =================================================
      // 6. CLEAR CART
      // =================================================

      clearCart()

      // =================================================
      // 7. SUCCESS
      // =================================================

      toast.success(
        'Order placed successfully!'
      )

      router.replace(
        `/account/orders/${order.id}`
      )
    } catch (error) {
      console.error(
        'PLACE ORDER ERROR:',
        error
      )

      toast.error(
        error?.message ||
          'Unable to place order.'
      )
    } finally {
      setPlacingOrder(false)
    }
  }

  // =====================================================
  // HYDRATION / AUTH LOADING
  // =====================================================

  if (
    !hasHydrated ||
    authLoading
  ) {
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2
              className="animate-spin text-neutral-500"
              size={30}
            />

            <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-neutral-400">
              Preparing Checkout
            </p>
          </div>
        </div>
      </main>
    )
  }

  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center px-5">
          <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
            <ShoppingBag
              size={32}
              className="mx-auto text-neutral-400"
            />

            <h1 className="mt-5 text-2xl font-black">
              Login required
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Redirecting you to login...
            </p>
          </div>
        </div>
      </main>
    )
  }

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (!safeItems.length) {
    return (
      <main className="min-h-screen bg-[#f7f7f5]">
        <Navbar />

        <div className="flex min-h-[75vh] items-center justify-center px-5">
          <div className="w-full max-w-xl rounded-[32px] border border-neutral-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
              <ShoppingBag
                size={30}
                className="text-neutral-500"
              />
            </div>

            <h1 className="mt-6 text-3xl font-black">
              Your cart is empty
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-neutral-500">
              Add something you love
              before checking out.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex rounded-full bg-black px-8 py-4 text-sm font-black text-white transition hover:scale-[1.02]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // =====================================================
  // CHECKOUT UI
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f7f7f5] pb-20">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        {/* HEADER */}

        <div className="mb-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-neutral-500 hover:text-black"
          >
            <ArrowLeft size={14} />
            Continue Shopping
          </Link>

          <h1 className="mt-5 text-3xl font-black tracking-tight md:text-4xl">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Complete your details and
            place your order securely.
          </p>
        </div>

        {/* STEPS */}

        <div className="mb-8 flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black ${
              step >= 1
                ? 'bg-black text-white'
                : 'bg-white text-neutral-400'
            }`}
          >
            1
          </div>

          <div className="h-px w-12 bg-neutral-300" />

          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black ${
              step >= 2
                ? 'bg-black text-white'
                : 'bg-white text-neutral-400'
            }`}
          >
            2
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* LEFT */}

          <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
            {step === 1 ? (
              <>
                <div className="mb-7 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black">
                      Delivery Address
                    </h2>

                    <p className="text-xs text-neutral-500">
                      Where should we deliver
                      your order?
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* NAME */}

                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-wider text-neutral-500">
                      Full Name
                    </label>

                    <input
                      value={
                        form.full_name
                      }
                      onChange={(event) =>
                        updateForm(
                          'full_name',
                          event.target.value
                        )
                      }
                      className="mt-2 h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition focus:border-black focus:bg-white"
                      placeholder="Krishna Kumar"
                    />
                  </div>

                  {/* PHONE */}

                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-neutral-500">
                      Phone
                    </label>

                    <input
                      value={
                        form.phone
                      }
                      onChange={(event) =>
                        updateForm(
                          'phone',
                          event.target.value
                        )
                      }
                      className="mt-2 h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition focus:border-black focus:bg-white"
                      placeholder="9876543210"
                    />
                  </div>

                  {/* PIN */}

                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-neutral-500">
                      Postal Code
                    </label>

                    <input
                      value={
                        form.postal_code
                      }
                      onChange={(event) =>
                        updateForm(
                          'postal_code',
                          event.target.value
                        )
                      }
                      className="mt-2 h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition focus:border-black focus:bg-white"
                      placeholder="110001"
                    />
                  </div>

                  {/* ADDRESS */}

                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-wider text-neutral-500">
                      Address
                    </label>

                    <textarea
                      value={
                        form.address_line_1
                      }
                      onChange={(event) =>
                        updateForm(
                          'address_line_1',
                          event.target.value
                        )
                      }
                      rows={3}
                      className="mt-2 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm outline-none transition focus:border-black focus:bg-white"
                      placeholder="House no, street, locality"
                    />
                  </div>

                  {/* ADDRESS 2 */}

                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-wider text-neutral-500">
                      Apartment / Landmark
                    </label>

                    <input
                      value={
                        form.address_line_2
                      }
                      onChange={(event) =>
                        updateForm(
                          'address_line_2',
                          event.target.value
                        )
                      }
                      className="mt-2 h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition focus:border-black focus:bg-white"
                      placeholder="Apartment, floor, landmark"
                    />
                  </div>

                  {/* CITY */}

                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-neutral-500">
                      City
                    </label>

                    <input
                      value={form.city}
                      onChange={(event) =>
                        updateForm(
                          'city',
                          event.target.value
                        )
                      }
                      className="mt-2 h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition focus:border-black focus:bg-white"
                      placeholder="Delhi"
                    />
                  </div>

                  {/* STATE */}

                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-neutral-500">
                      State
                    </label>

                    <input
                      value={form.state}
                      onChange={(event) =>
                        updateForm(
                          'state',
                          event.target.value
                        )
                      }
                      className="mt-2 h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition focus:border-black focus:bg-white"
                      placeholder="Delhi"
                    />
                  </div>

                  {/* NOTES */}

                  <div className="md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-wider text-neutral-500">
                      Order Notes
                    </label>

                    <textarea
                      value={form.notes}
                      onChange={(event) =>
                        updateForm(
                          'notes',
                          event.target.value
                        )
                      }
                      rows={2}
                      className="mt-2 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm outline-none transition focus:border-black focus:bg-white"
                      placeholder="Optional delivery instructions"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      validateAddress()
                    ) {
                      setStep(2)
                    }
                  }}
                  className="mt-8 flex w-full items-center justify-center rounded-2xl bg-black py-4 text-sm font-black text-white transition hover:bg-neutral-800"
                >
                  Continue to Payment
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setStep(1)
                  }
                  className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-500 hover:text-black"
                >
                  <ArrowLeft
                    size={14}
                  />
                  Edit Address
                </button>

                <div className="mb-7 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
                    <ShieldCheck
                      size={20}
                    />
                  </div>

                  <div>
                    <h2 className="text-xl font-black">
                      Payment Method
                    </h2>

                    <p className="text-xs text-neutral-500">
                      Select how you want
                      to pay
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      value: 'COD',
                      title:
                        'Cash on Delivery',
                      description:
                        'Pay when your order arrives.',
                    },
                    {
                      value: 'UPI',
                      title: 'UPI',
                      description:
                        'UPI payment support.',
                    },
                    {
                      value: 'CARD',
                      title:
                        'Debit / Credit Card',
                      description:
                        'Secure card payment.',
                    },
                  ].map(
                    (method) => (
                      <button
                        key={
                          method.value
                        }
                        type="button"
                        onClick={() =>
                          setPaymentMethod(
                            method.value
                          )
                        }
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          paymentMethod ===
                          method.value
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 bg-neutral-50 hover:border-black'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-black">
                              {
                                method.title
                              }
                            </p>

                            <p
                              className={`mt-1 text-xs ${
                                paymentMethod ===
                                method.value
                                  ? 'text-neutral-300'
                                  : 'text-neutral-500'
                              }`}
                            >
                              {
                                method.description
                              }
                            </p>
                          </div>

                          {paymentMethod ===
                            method.value && (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
                              <Check
                                size={15}
                              />
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={
                    placingOrder
                  }
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-sm font-black text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {placingOrder ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <Package
                        size={18}
                      />
                      Place Order · ₹
                      {totalAmount.toLocaleString(
                        'en-IN'
                      )}
                    </>
                  )}
                </button>
              </>
            )}
          </section>

          {/* RIGHT — ORDER SUMMARY */}

          <aside className="h-fit rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">
                Order Summary
              </h2>

              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black">
                {safeItems.reduce(
                  (count, item) =>
                    count +
                    Number(
                      item.quantity || 0
                    ),
                  0
                )}{' '}
                items
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {safeItems.map(
                (item, index) => {
                  const image =
                    item.image ||
                    item.image_url ||
                    ''

                  const key =
                    item.cartId ||
                    `${item.productId || item.id || item.slug || index}-${item.size || ''}-${item.color || ''}`

                  return (
                    <div
                      key={key}
                      className="flex gap-3"
                    >
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                        {image ? (
                          <img
                            src={image}
                            alt={
                              item.name
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ShoppingBag
                              size={18}
                              className="text-neutral-400"
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-black">
                          {item.name}
                        </p>

                        {item.size && (
                          <p className="mt-1 text-xs text-neutral-500">
                            Size:{' '}
                            {
                              item.size
                            }
                          </p>
                        )}

                        <p className="mt-1 text-xs font-bold text-neutral-500">
                          Qty:{' '}
                          {
                            item.quantity
                          }
                        </p>
                      </div>

                      <p className="text-sm font-black">
                        ₹
                        {(
                          Number(
                            item.price ||
                              0
                          ) *
                          Number(
                            item.quantity ||
                              0
                          )
                        ).toLocaleString(
                          'en-IN'
                        )}
                      </p>
                    </div>
                  )
                }
              )}
            </div>

            <div className="my-6 h-px bg-neutral-100" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">
                  Subtotal
                </span>

                <span className="font-bold">
                  ₹
                  {subtotal.toLocaleString(
                    'en-IN'
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="flex items-center gap-2 text-neutral-500">
                  <Truck size={14} />
                  Shipping
                </span>

                <span className="font-bold">
                  {shippingFee ===
                  0
                    ? 'FREE'
                    : `₹${shippingFee}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-500">
                  Discount
                </span>

                <span className="font-bold">
                  ₹
                  {discount.toLocaleString(
                    'en-IN'
                  )}
                </span>
              </div>
            </div>

            <div className="my-6 h-px bg-neutral-100" />

            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-neutral-400">
                  Total
                </p>

                <p className="mt-1 text-3xl font-black">
                  ₹
                  {totalAmount.toLocaleString(
                    'en-IN'
                  )}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
              <div className="flex gap-3">
                <ShieldCheck
                  size={18}
                  className="shrink-0"
                />

                <p className="text-xs leading-5 text-neutral-500">
                  Your order information
                  is securely processed.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}