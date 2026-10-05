"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const normalizeStatus = (status) =>
  String(status || "Placed").toLowerCase();

const getStatusConfig = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized.includes("cancel")) {
    return {
      label: "Cancelled",
      icon: XCircle,
      className: "bg-red-50 text-red-600 border-red-100",
    };
  }

  if (normalized.includes("deliver")) {
    return {
      label: "Delivered",
      icon: CheckCircle2,
      className:
        "bg-emerald-50 text-emerald-600 border-emerald-100",
    };
  }

  if (
    normalized.includes("dispatch") ||
    normalized.includes("ship") ||
    normalized.includes("transit")
  ) {
    return {
      label: status || "Shipped",
      icon: Truck,
      className: "bg-blue-50 text-blue-600 border-blue-100",
    };
  }

  if (
    normalized.includes("process") ||
    normalized.includes("confirm")
  ) {
    return {
      label: status || "Processing",
      icon: Package,
      className:
        "bg-amber-50 text-amber-600 border-amber-100",
    };
  }

  return {
    label: status || "Placed",
    icon: Clock3,
    className:
      "bg-neutral-100 text-neutral-700 border-neutral-200",
  };
};

function StatusTimeline({ status }) {
  const normalized = normalizeStatus(status);

  if (normalized.includes("cancel")) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
        <div className="flex items-center gap-3">
          <XCircle className="text-red-600" size={22} />

          <div>
            <p className="text-sm font-black text-red-700">
              Order Cancelled
            </p>

            <p className="mt-1 text-xs text-red-600">
              This order is no longer being processed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    {
      key: "placed",
      label: "Order Placed",
      match: true,
    },
    {
      key: "processing",
      label: "Processing",
      match:
        normalized.includes("process") ||
        normalized.includes("dispatch") ||
        normalized.includes("ship") ||
        normalized.includes("deliver"),
    },
    {
      key: "shipped",
      label: "Shipped",
      match:
        normalized.includes("dispatch") ||
        normalized.includes("ship") ||
        normalized.includes("transit") ||
        normalized.includes("deliver"),
    },
    {
      key: "delivered",
      label: "Delivered",
      match: normalized.includes("deliver"),
    },
  ];

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div
          key={step.key}
          className="flex items-center gap-4"
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              step.match
                ? "bg-neutral-950 text-white"
                : "bg-neutral-100 text-neutral-300"
            }`}
          >
            {step.match ? (
              <Check size={16} strokeWidth={3} />
            ) : (
              <span className="text-xs font-bold">
                {index + 1}
              </span>
            )}
          </div>

          <div>
            <p
              className={`text-sm font-bold ${
                step.match
                  ? "text-neutral-900"
                  : "text-neutral-400"
              }`}
            >
              {step.label}
            </p>

            {step.match && index === 0 && (
              <p className="mt-1 text-xs text-neutral-400">
                Your order has been received.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductItem({ item }) {
  const product = item.product || {};

  const quantity = Number(item.quantity || 1);
  const price = Number(
    item.price || item.unit_price || 0
  );

  return (
    <div className="flex gap-4 rounded-2xl bg-neutral-50 p-3 sm:p-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-200 sm:h-24 sm:w-24">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name || "Product"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag
              size={25}
              className="text-neutral-400"
            />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-neutral-900 sm:text-base">
          {product.name ||
            item.product_name ||
            "Product"}
        </p>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
          <span>Qty: {quantity}</span>

          {item.size && <span>Size: {item.size}</span>}

          {item.color && (
            <span>Color: {item.color}</span>
          )}
        </div>

        <p className="mt-3 text-sm font-bold text-neutral-900">
          {money(price)} × {quantity}
        </p>
      </div>

      <div className="hidden text-right sm:block">
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          Total
        </p>

        <p className="mt-1 text-sm font-black">
          {money(price * quantity)}
        </p>
      </div>
    </div>
  );
}

export default function OrderDetailsPage() {
  const params = useParams();

  const orderId = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadOrder = useCallback(
    async (silent = false) => {
      if (!orderId) return;

      try {
        if (!silent) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          setOrder(null);
          setError("Please sign in to view this order.");
          return;
        }

        const { data, error: orderError } =
          await supabase
            .from("orders")
            .select(`
              id,
              user_id,
              status,
              total_amount,
              subtotal,
              discount_amount,
              shipping_amount,
              payment_method,
              payment_status,
              created_at,
              shipping_address,
              shipping_city,
              shipping_state,
              shipping_pincode,
              shipping_phone,
              order_items (
                id,
                product_id,
                product_name,
                quantity,
                price,
                size,
                color,
                product:products (
                  id,
                  name,
                  image_url
                )
              )
            `)
            .eq("id", orderId)
            .eq("user_id", user.id)
            .maybeSingle();

        if (orderError) {
          throw orderError;
        }

        if (!data) {
          setOrder(null);
          setError("Order not found.");
          return;
        }

        setOrder(data);
      } catch (err) {
        console.error("Order details error:", err);

        setError(
          err?.message ||
            "Unable to load this order."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    loadOrder();

    let channel;

    const setupRealtime = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !orderId) return;

      /*
       * IMPORTANT:
       * Every postgres_changes callback is registered BEFORE
       * subscribe().
       */

      channel = supabase
        .channel(`order-details-${orderId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `id=eq.${orderId}`,
          },
          () => {
            loadOrder(true);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "order_items",
          },
          () => {
            loadOrder(true);
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadOrder, orderId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f6f2] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-5 w-32 rounded bg-neutral-200" />
          <div className="mt-5 h-10 w-72 rounded bg-neutral-200" />

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[28px] bg-white p-6">
              <div className="h-5 w-40 rounded bg-neutral-200" />

              <div className="mt-6 space-y-4">
                <div className="h-24 rounded-2xl bg-neutral-100" />
                <div className="h-24 rounded-2xl bg-neutral-100" />
              </div>
            </div>

            <div className="h-72 rounded-[28px] bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#f7f6f2] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-white shadow-sm">
            <Package
              size={32}
              className="text-neutral-400"
            />
          </div>

          <h1 className="mt-6 text-2xl font-black">
            Order not found
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            {error ||
              "We couldn't find this order in your account."}
          </p>

          <Link
            href="/account/orders"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-bold text-white"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  const status = getStatusConfig(order.status);
  const StatusIcon = status.icon;

  const items = Array.isArray(order.order_items)
    ? order.order_items
    : [];

  const subtotal = Number(
    order.subtotal ??
      items.reduce(
        (sum, item) =>
          sum +
          Number(item.price || 0) *
            Number(item.quantity || 1),
        0
      )
  );

  const discount = Number(
    order.discount_amount || 0
  );

  const shipping = Number(
    order.shipping_amount || 0
  );

  return (
    <main className="min-h-screen bg-[#f7f6f2] px-4 py-6 text-neutral-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 transition hover:text-neutral-950"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Link>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-400">
                Order Details
              </p>

              <h1 className="mt-2 break-all text-2xl font-black tracking-tight sm:text-3xl">
                #{order.id}
              </h1>

              <p className="mt-2 text-sm text-neutral-500">
                Placed {formatDate(order.created_at)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadOrder(true)}
                disabled={refreshing}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 text-xs font-bold disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={
                    refreshing ? "animate-spin" : ""
                  }
                />
                Refresh
              </button>

              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${status.className}`}
              >
                <StatusIcon size={15} />
                {status.label}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Main */}
          <div className="space-y-5">
            {/* Items */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.035)] sm:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">
                    Products
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    {items.length}{" "}
                    {items.length === 1
                      ? "item"
                      : "items"}
                  </h2>
                </div>

                <ShoppingBag
                  size={20}
                  className="text-neutral-300"
                />
              </div>

              {items.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {items.map((item) => (
                    <ProductItem
                      key={item.id}
                      item={item}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 p-8 text-center">
                  <Package
                    size={25}
                    className="mx-auto text-neutral-300"
                  />

                  <p className="mt-2 text-sm font-bold text-neutral-500">
                    No order items found
                  </p>
                </div>
              )}
            </motion.section>

            {/* Timeline */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.035)] sm:p-6"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">
                Tracking
              </p>

              <h2 className="mt-1 text-xl font-black">
                Order progress
              </h2>

              <div className="mt-6">
                <StatusTimeline
                  status={order.status}
                />
              </div>
            </motion.section>

            {/* Shipping */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.035)] sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
                  <MapPin size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">
                    Delivery
                  </p>

                  <h2 className="text-lg font-black">
                    Shipping Address
                  </h2>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm font-bold text-neutral-800">
                  {order.shipping_address ||
                    "Shipping address unavailable"}
                </p>

                {(order.shipping_city ||
                  order.shipping_state ||
                  order.shipping_pincode) && (
                  <p className="mt-1 text-sm text-neutral-500">
                    {[
                      order.shipping_city,
                      order.shipping_state,
                      order.shipping_pincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}

                {order.shipping_phone && (
                  <p className="mt-3 text-xs font-semibold text-neutral-500">
                    Phone: {order.shipping_phone}
                  </p>
                )}
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Summary */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-[28px] border border-black/[0.06] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.035)] sm:p-6 lg:sticky lg:top-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-white">
                  <CreditCard size={18} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">
                    Payment
                  </p>

                  <h2 className="text-lg font-black">
                    Order Summary
                  </h2>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">
                    Subtotal
                  </span>

                  <span className="font-bold">
                    {money(subtotal)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">
                      Discount
                    </span>

                    <span className="font-bold text-emerald-600">
                      -{money(discount)}
                    </span>
                  </div>
                )}

                {shipping > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">
                      Shipping
                    </span>

                    <span className="font-bold">
                      {money(shipping)}
                    </span>
                  </div>
                )}

                <div className="border-t border-neutral-100 pt-4">
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-sm font-black">
                      Total
                    </span>

                    <span className="text-2xl font-black">
                      {money(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-neutral-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-neutral-500">
                    Payment method
                  </span>

                  <span className="text-xs font-black uppercase">
                    {order.payment_method ||
                      "Online"}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-xs text-neutral-500">
                    Payment status
                  </span>

                  <span
                    className={`text-xs font-black ${
                      String(
                        order.payment_status || ""
                      ).toLowerCase() === "paid"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {order.payment_status ||
                      "Pending"}
                  </span>
                </div>
              </div>
            </motion.section>
          </aside>
        </div>
      </div>
    </main>
  );
}