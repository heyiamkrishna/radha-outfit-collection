"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Clock3,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
  CheckCircle2,
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

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getStatusConfig = (status) => {
  const normalized = String(status || "").toLowerCase();

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
      className: "bg-emerald-50 text-emerald-600 border-emerald-100",
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
      className: "bg-amber-50 text-amber-600 border-amber-100",
    };
  }

  return {
    label: status || "Placed",
    icon: Clock3,
    className: "bg-neutral-100 text-neutral-700 border-neutral-200",
  };
};

function OrderCard({ order, index }) {
  const status = getStatusConfig(order.status);
  const StatusIcon = status.icon;

  const items = Array.isArray(order.order_items)
    ? order.order_items
    : [];

  const previewItems = items.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.05,
      }}
      whileHover={{ y: -3 }}
      className="group overflow-hidden rounded-[26px] border border-black/[0.07] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)]"
    >
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">
                Order
              </p>

              <span className="rounded-full bg-neutral-100 px-3 py-1 font-mono text-[11px] font-semibold text-neutral-700">
                #{String(order.id).slice(0, 8)}
              </span>
            </div>

            <p className="mt-2 text-sm text-neutral-500">
              {formatDate(order.created_at)}
            </p>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${status.className}`}
          >
            <StatusIcon size={14} />
            {status.label}
          </div>
        </div>

        {/* Products */}
        {items.length > 0 ? (
          <div className="mt-6 space-y-3">
            {previewItems.map((item, itemIndex) => {
              const product = item.product || {};

              return (
                <div
                  key={`${item.id || itemIndex}`}
                  className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-3"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name || "Product"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag
                          size={20}
                          className="text-neutral-400"
                        />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-neutral-900">
                      {product.name || item.product_name || "Product"}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
                      <span>
                        Qty: {item.quantity || 1}
                      </span>

                      {item.size && (
                        <span>Size: {item.size}</span>
                      )}

                      {item.color && (
                        <span>Color: {item.color}</span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-bold text-neutral-900">
                    {money(
                      Number(item.price || item.unit_price || 0) *
                        Number(item.quantity || 1)
                    )}
                  </p>
                </div>
              );
            })}

            {items.length > 3 && (
              <p className="px-1 text-xs font-medium text-neutral-400">
                + {items.length - 3} more item
                {items.length - 3 > 1 ? "s" : ""}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 p-5 text-center">
            <Package
              size={22}
              className="mx-auto text-neutral-300"
            />

            <p className="mt-2 text-sm font-semibold text-neutral-500">
              Order items unavailable
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex flex-col gap-4 border-t border-neutral-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
              Total
            </p>

            <p className="mt-1 text-xl font-black text-neutral-950">
              {money(order.total_amount)}
            </p>
          </div>

          <Link
            href={`/account/orders/${order.id}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            View Order
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async (silent = false) => {
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
        setOrders([]);
        return;
      }

      const { data, error: ordersError } = await supabase
        .from("orders")
        .select(`
          id,
          user_id,
          status,
          total_amount,
          created_at,
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
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (ordersError) {
        throw ordersError;
      }

      setOrders(data || []);
    } catch (err) {
      console.error("Orders load error:", err);
      setError(
        err?.message ||
          "Unable to load your orders right now."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    let channel;

    const setupRealtime = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      /*
       * IMPORTANT:
       * Do NOT add postgres_changes after subscribe().
       * All postgres_changes callbacks are registered before subscribe().
       */

      channel = supabase
        .channel(`account-orders-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            loadOrders(true);
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
            loadOrders(true);
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
  }, [loadOrders]);

  return (
    <main className="min-h-screen bg-[#f7f6f2] px-4 py-6 text-neutral-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">
              Account
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              My Orders
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              Track your online purchases and view complete order
              details.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadOrders(true)}
            disabled={refreshing}
            className="inline-flex h-11 w-fit items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 text-sm font-bold text-neutral-800 shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[26px] border border-black/[0.05] bg-white p-6"
              >
                <div className="h-4 w-32 rounded bg-neutral-200" />
                <div className="mt-3 h-3 w-24 rounded bg-neutral-100" />
                <div className="mt-6 h-16 rounded-2xl bg-neutral-100" />
                <div className="mt-3 h-16 rounded-2xl bg-neutral-100" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 rounded-[26px] border border-red-100 bg-red-50 p-6"
          >
            <p className="text-sm font-bold text-red-700">
              Could not load orders
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadOrders()}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* No Orders */}
        {!loading && !error && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-[30px] border border-black/[0.06] bg-white px-6 py-16 text-center shadow-[0_15px_50px_rgba(0,0,0,0.04)]"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-neutral-100">
              <ShoppingBag
                size={32}
                className="text-neutral-400"
              />
            </div>

            <h2 className="mt-6 text-2xl font-black">
              No orders yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              You haven't placed any online orders yet.
              Start shopping and your orders will appear here.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-neutral-950 px-6 text-sm font-bold text-white transition hover:bg-neutral-800"
            >
              Start Shopping
              <ChevronRight size={17} />
            </Link>
          </motion.div>
        )}

        {/* Orders */}
        {!loading && !error && orders.length > 0 && (
          <div className="mt-8 space-y-4">
            {orders.map((order, index) => (
              <OrderCard
                key={order.id}
                order={order}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}