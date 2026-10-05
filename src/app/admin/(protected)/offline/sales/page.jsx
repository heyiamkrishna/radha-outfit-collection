"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Receipt,
  ShoppingBag,
  IndianRupee,
  CreditCard,
  Banknote,
  QrCode,
  Eye,
  X,
  CalendarDays,
  UserRound,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
  Package,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const PAGE_SIZE = 12;

const PAYMENT_META = {
  cash: {
    label: "Cash",
    icon: Banknote,
  },
  upi: {
    label: "UPI",
    icon: QrCode,
  },
  card: {
    label: "Card",
    icon: CreditCard,
  },
};

const STATUS_META = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  pending: {
    label: "Pending",
    icon: Clock3,
    className:
      "bg-amber-50 text-amber-700 border-amber-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className:
      "bg-red-50 text-red-700 border-red-200",
  },
};

function money(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizePaymentMethod(value) {
  const method = String(value || "cash").toLowerCase();

  if (method.includes("upi")) return "upi";
  if (method.includes("card")) return "card";

  return "cash";
}

function normalizeStatus(value) {
  const status = String(value || "completed").toLowerCase();

  if (status.includes("cancel")) return "cancelled";
  if (status.includes("pending")) return "pending";

  return "completed";
}

function getSaleCustomer(sale) {
  return (
    sale?.customer_name ||
    sale?.customerName ||
    sale?.name ||
    "Walk-in Customer"
  );
}

function getSaleNumber(sale) {
  return (
    sale?.invoice_number ||
    sale?.invoice_no ||
    sale?.invoice ||
    sale?.sale_number ||
    sale?.sale_no ||
    sale?.id ||
    "—"
  );
}

function getSaleTotal(sale) {
  return Number(
    sale?.total_amount ??
      sale?.total ??
      sale?.grand_total ??
      sale?.amount ??
      0
  );
}

function getSaleSubtotal(sale) {
  return Number(
    sale?.subtotal ??
      sale?.sub_total ??
      sale?.gross_amount ??
      getSaleTotal(sale)
  );
}

function getSaleDiscount(sale) {
  return Number(
    sale?.discount_amount ??
      sale?.discount ??
      0
  );
}

function getSaleDate(sale) {
  return (
    sale?.created_at ||
    sale?.sale_date ||
    sale?.sold_at ||
    sale?.createdAt ||
    null
  );
}

function getSalePayment(sale) {
  return normalizePaymentMethod(
    sale?.payment_method ||
      sale?.paymentMethod ||
      sale?.payment_type
  );
}

function getSaleStatus(sale) {
  return normalizeStatus(
    sale?.status ||
      sale?.sale_status
  );
}

/* -------------------------------------------------------
   STATUS BADGE
------------------------------------------------------- */

function StatusBadge({ status }) {
  const meta =
    STATUS_META[status] ||
    STATUS_META.completed;

  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${meta.className}`}
    >
      <Icon size={12} />
      {meta.label}
    </span>
  );
}

/* -------------------------------------------------------
   PAYMENT BADGE
------------------------------------------------------- */

function PaymentBadge({ method }) {
  const normalized = normalizePaymentMethod(method);
  const meta =
    PAYMENT_META[normalized] ||
    PAYMENT_META.cash;

  const Icon = meta.icon;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold text-neutral-700">
      <Icon size={12} />
      {meta.label}
    </span>
  );
}

/* -------------------------------------------------------
   STAT CARD
------------------------------------------------------- */

function StatCard({
  label,
  value,
  icon: Icon,
  description,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-[24px] border border-black/[0.07] bg-white p-5 shadow-[0_15px_50px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-neutral-950">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-neutral-400">
              {description}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-white">
          <Icon size={19} />
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------
   SALE DETAILS MODAL
------------------------------------------------------- */

function SaleDetailsModal({
  sale,
  onClose,
}) {
  if (!sale) return null;

  const payment = getSalePayment(sale);
  const status = getSaleStatus(sale);
  const customer = getSaleCustomer(sale);
  const invoice = getSaleNumber(sale);
  const total = getSaleTotal(sale);
  const subtotal = getSaleSubtotal(sale);
  const discount = getSaleDiscount(sale);
  const date = getSaleDate(sale);

  const items =
    Array.isArray(sale?.items)
      ? sale.items
      : Array.isArray(sale?.sale_items)
        ? sale.sale_items
        : Array.isArray(sale?.offline_sale_items)
          ? sale.offline_sale_items
          : [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md"
        onMouseDown={onClose}
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: 20,
            scale: 0.98,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 26,
          }}
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
          className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/30 bg-[#f8f7f3] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/[0.07] bg-white px-5 py-4 sm:px-7">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                Offline Store
              </p>

              <h2 className="mt-1 text-xl font-black">
                Sale Details
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.07] bg-white text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
            >
              <X size={18} />
            </button>
          </div>

          <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-5 sm:p-7">
            {/* Invoice top */}
            <div className="rounded-[22px] bg-neutral-950 p-5 text-white">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">
                    Invoice
                  </p>

                  <p className="mt-1 break-all text-lg font-black">
                    {invoice}
                  </p>
                </div>

                <StatusBadge status={status} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/40">
                    Customer
                  </p>
                  <p className="mt-1 text-sm font-bold">
                    {customer}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/40">
                    Payment
                  </p>

                  <div className="mt-1">
                    <PaymentBadge method={payment} />
                  </div>
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/40">
                    Date
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {formatDate(date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="mt-5 rounded-[22px] border border-black/[0.07] bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
                  <UserRound size={17} />
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                    Customer
                  </p>

                  <p className="text-sm font-bold text-neutral-950">
                    {customer}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mt-5 rounded-[22px] border border-black/[0.07] bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <Package size={17} />

                <h3 className="text-sm font-black">
                  Products
                </h3>
              </div>

              {items.length > 0 ? (
                <div className="space-y-2">
                  {items.map((item, index) => {
                    const name =
                      item?.product_name ||
                      item?.name ||
                      item?.product?.name ||
                      "Product";

                    const quantity = Number(
                      item?.quantity || 1
                    );

                    const price = Number(
                      item?.unit_price ??
                        item?.price ??
                        item?.selling_price ??
                        0
                    );

                    return (
                      <div
                        key={
                          item?.id ||
                          item?.product_id ||
                          index
                        }
                        className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">
                            {name}
                          </p>

                          <p className="mt-0.5 text-xs text-neutral-400">
                            {quantity} × {money(price)}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-black">
                          {money(
                            quantity * price
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl bg-neutral-50 p-5 text-center text-xs text-neutral-400">
                  Product item details are not available for this
                  sale.
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="mt-5 rounded-[22px] border border-black/[0.07] bg-white p-5">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">
                    Subtotal
                  </span>

                  <span className="font-semibold">
                    {money(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-500">
                    Discount
                  </span>

                  <span className="font-semibold text-emerald-600">
                    - {money(discount)}
                  </span>
                </div>

                <div className="my-3 border-t border-black/[0.07]" />

                <div className="flex items-end justify-between">
                  <span className="font-bold">
                    Total
                  </span>

                  <span className="text-2xl font-black">
                    {money(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Date */}
            <p className="mt-4 text-center text-[10px] text-neutral-400">
              Created {formatDateTime(date)}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* -------------------------------------------------------
   MAIN PAGE
------------------------------------------------------- */

export default function OfflineSalesPage() {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [paymentFilter, setPaymentFilter] =
    useState("all");

  const [dateFilter, setDateFilter] =
    useState("all");

  const [page, setPage] = useState(1);

  const [selectedSale, setSelectedSale] =
    useState(null);

  /* -----------------------------------------------------
     LOAD SALES
  ----------------------------------------------------- */

  const loadSales = useCallback(
    async ({
      silent = false,
    } = {}) => {
      try {
        if (!silent) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        /*
         * IMPORTANT:
         *
         * We only request columns that are expected to exist
         * in offline_sales.
         *
         * We intentionally DO NOT request:
         * email
         * whatsapp
         *
         * This prevents the previous schema-cache errors.
         */

        const {
          data,
          error: queryError,
        } = await supabase
          .from("offline_sales")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

        if (queryError) {
          throw queryError;
        }

        setSales(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        console.error(
          "Offline sales error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load offline sales."
        );

        setSales([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  /* -----------------------------------------------------
     REALTIME
  ----------------------------------------------------- */

  useEffect(() => {
    const channel =
      supabase
        .channel(
          "offline-sales-page-realtime"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "offline_sales",
          },
          () => {
            loadSales({
              silent: true,
            });
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, loadSales]);

  /* -----------------------------------------------------
     FILTER
  ----------------------------------------------------- */

  const filteredSales = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    const now = new Date();

    return sales.filter((sale) => {
      const customer =
        getSaleCustomer(sale)
          .toLowerCase();

      const invoice =
        String(
          getSaleNumber(sale)
        ).toLowerCase();

      const saleStatus =
        getSaleStatus(sale);

      const payment =
        getSalePayment(sale);

      const dateValue =
        getSaleDate(sale);

      const saleDate = dateValue
        ? new Date(dateValue)
        : null;

      const matchesSearch =
        !query ||
        customer.includes(query) ||
        invoice.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        saleStatus === statusFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        payment === paymentFilter;

      let matchesDate = true;

      if (
        dateFilter !== "all" &&
        saleDate &&
        !Number.isNaN(
          saleDate.getTime()
        )
      ) {
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        if (dateFilter === "today") {
          matchesDate =
            saleDate >= today;
        }

        if (dateFilter === "7days") {
          const start =
            new Date(today);

          start.setDate(
            start.getDate() - 6
          );

          matchesDate =
            saleDate >= start;
        }

        if (dateFilter === "30days") {
          const start =
            new Date(today);

          start.setDate(
            start.getDate() - 29
          );

          matchesDate =
            saleDate >= start;
        }
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment &&
        matchesDate
      );
    });
  }, [
    sales,
    search,
    statusFilter,
    paymentFilter,
    dateFilter,
  ]);

  /* -----------------------------------------------------
     PAGINATION
  ----------------------------------------------------- */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredSales.length /
        PAGE_SIZE
    )
  );

  const visibleSales = useMemo(() => {
    const start =
      (page - 1) *
      PAGE_SIZE;

    return filteredSales.slice(
      start,
      start + PAGE_SIZE
    );
  }, [
    filteredSales,
    page,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  /* -----------------------------------------------------
     STATS
  ----------------------------------------------------- */

  const stats = useMemo(() => {
    const completed = sales.filter(
      (sale) =>
        getSaleStatus(sale) ===
        "completed"
    );

    const totalRevenue =
      completed.reduce(
        (sum, sale) =>
          sum + getSaleTotal(sale),
        0
      );

    const average =
      completed.length > 0
        ? totalRevenue /
          completed.length
        : 0;

    return {
      count: sales.length,
      completed: completed.length,
      revenue: totalRevenue,
      average,
    };
  }, [sales]);

  /* -----------------------------------------------------
     RESET FILTER
  ----------------------------------------------------- */

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setDateFilter("all");
    setPage(1);
  }

  /* -----------------------------------------------------
     RENDER
  ----------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#f5f4f0] px-3 py-4 text-neutral-950 sm:px-5 lg:px-7">
      {/* HEADER */}

      <div className="mx-auto max-w-[1600px]">
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"
        >
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
              <Receipt size={13} />

              Offline Store

              <span className="text-neutral-300">
                /
              </span>

              Sales
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              Sales History
            </h1>

            <p className="mt-2 max-w-xl text-sm text-neutral-500">
              Manage offline store transactions,
              payments and invoices in real time.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadSales({
                silent: true,
              })
            }
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-xs font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={15} />
            )}

            Refresh
          </button>
        </motion.div>

        {/* STATS */}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Sales"
            value={stats.count}
            icon={ShoppingBag}
            description="All recorded transactions"
          />

          <StatCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            description="Successful offline sales"
          />

          <StatCard
            label="Revenue"
            value={money(stats.revenue)}
            icon={IndianRupee}
            description="Completed sales revenue"
          />

          <StatCard
            label="Average Sale"
            value={money(stats.average)}
            icon={TrendingUp}
            description="Average completed transaction"
          />
        </div>

        {/* FILTERS */}

        <div className="mt-6 rounded-[24px] border border-black/[0.07] bg-white p-3 shadow-[0_15px_50px_rgba(0,0,0,0.035)] sm:p-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(250px,1fr)_auto_auto_auto_auto]">
            {/* Search */}

            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );
                  setPage(1);
                }}
                placeholder="Search invoice or customer..."
                className="h-11 w-full rounded-xl border border-black/[0.07] bg-neutral-50 pl-10 pr-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white"
              />
            </div>

            {/* Status */}

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(
                  event.target.value
                );
                setPage(1);
              }}
              className="h-11 rounded-xl border border-black/[0.07] bg-neutral-50 px-3 text-xs font-semibold outline-none"
            >
              <option value="all">
                All Status
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>

            {/* Payment */}

            <select
              value={paymentFilter}
              onChange={(event) => {
                setPaymentFilter(
                  event.target.value
                );
                setPage(1);
              }}
              className="h-11 rounded-xl border border-black/[0.07] bg-neutral-50 px-3 text-xs font-semibold outline-none"
            >
              <option value="all">
                All Payments
              </option>

              <option value="cash">
                Cash
              </option>

              <option value="upi">
                UPI
              </option>

              <option value="card">
                Card
              </option>
            </select>

            {/* Date */}

            <select
              value={dateFilter}
              onChange={(event) => {
                setDateFilter(
                  event.target.value
                );
                setPage(1);
              }}
              className="h-11 rounded-xl border border-black/[0.07] bg-neutral-50 px-3 text-xs font-semibold outline-none"
            >
              <option value="all">
                All Dates
              </option>

              <option value="today">
                Today
              </option>

              <option value="7days">
                Last 7 Days
              </option>

              <option value="30days">
                Last 30 Days
              </option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="h-11 rounded-xl border border-black/[0.07] bg-white px-4 text-xs font-bold text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
            >
              Reset
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="min-w-0">
              <p className="text-sm font-bold">
                Unable to load offline sales
              </p>

              <p className="mt-1 break-words text-xs">
                {error}
              </p>
            </div>
          </motion.div>
        )}

        {/* DESKTOP TABLE */}

        <div className="mt-5 hidden overflow-hidden rounded-[26px] border border-black/[0.07] bg-white shadow-[0_15px_50px_rgba(0,0,0,0.035)] lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-black/[0.06] bg-neutral-50/80 text-left">
                  <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.15em] text-neutral-400">
                    Invoice
                  </th>

                  <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.15em] text-neutral-400">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.15em] text-neutral-400">
                    Date
                  </th>

                  <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.15em] text-neutral-400">
                    Payment
                  </th>

                  <th className="px-5 py-4 text-[9px] font-black uppercase tracking-[0.15em] text-neutral-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-[9px] font-black uppercase tracking-[0.15em] text-neutral-400">
                    Total
                  </th>

                  <th className="px-5 py-4 text-right text-[9px] font-black uppercase tracking-[0.15em] text-neutral-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-20 text-center"
                    >
                      <Loader2
                        size={24}
                        className="mx-auto animate-spin text-neutral-400"
                      />

                      <p className="mt-3 text-xs text-neutral-400">
                        Loading sales...
                      </p>
                    </td>
                  </tr>
                ) : visibleSales.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-20 text-center"
                    >
                      <Receipt
                        size={30}
                        className="mx-auto text-neutral-300"
                      />

                      <p className="mt-3 text-sm font-bold">
                        No sales found
                      </p>

                      <p className="mt-1 text-xs text-neutral-400">
                        Try changing your filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  visibleSales.map(
                    (sale, index) => {
                      const payment =
                        getSalePayment(
                          sale
                        );

                      const status =
                        getSaleStatus(
                          sale
                        );

                      return (
                        <motion.tr
                          key={
                            sale?.id ||
                            getSaleNumber(
                              sale
                            ) ||
                            index
                          }
                          initial={{
                            opacity: 0,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                          transition={{
                            delay:
                              index * 0.025,
                          }}
                          className="border-b border-black/[0.05] last:border-0 hover:bg-neutral-50/70"
                        >
                          <td className="px-5 py-4">
                            <p className="max-w-[190px] truncate text-sm font-black">
                              {getSaleNumber(
                                sale
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="max-w-[180px] truncate text-sm font-semibold">
                              {getSaleCustomer(
                                sale
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-xs font-semibold text-neutral-600">
                              {formatDate(
                                getSaleDate(
                                  sale
                                )
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <PaymentBadge
                              method={
                                payment
                              }
                            />
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge
                              status={
                                status
                              }
                            />
                          </td>

                          <td className="px-5 py-4 text-right">
                            <p className="text-sm font-black">
                              {money(
                                getSaleTotal(
                                  sale
                                )
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedSale(
                                  sale
                                )
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.07] bg-white text-neutral-500 transition hover:bg-neutral-950 hover:text-white"
                              title="View sale"
                            >
                              <Eye
                                size={15}
                              />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE / TABLET CARDS */}

        <div className="mt-5 grid grid-cols-1 gap-3 lg:hidden">
          {loading ? (
            <div className="rounded-[24px] border border-black/[0.07] bg-white py-20 text-center">
              <Loader2
                size={24}
                className="mx-auto animate-spin text-neutral-400"
              />

              <p className="mt-3 text-xs text-neutral-400">
                Loading sales...
              </p>
            </div>
          ) : visibleSales.length ===
            0 ? (
            <div className="rounded-[24px] border border-black/[0.07] bg-white py-20 text-center">
              <Receipt
                size={30}
                className="mx-auto text-neutral-300"
              />

              <p className="mt-3 text-sm font-bold">
                No sales found
              </p>

              <p className="mt-1 text-xs text-neutral-400">
                Try changing your filters.
              </p>
            </div>
          ) : (
            visibleSales.map(
              (sale, index) => {
                const payment =
                  getSalePayment(sale);

                const status =
                  getSaleStatus(sale);

                return (
                  <motion.div
                    key={
                      sale?.id ||
                      getSaleNumber(
                        sale
                      ) ||
                      index
                    }
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        index * 0.03,
                    }}
                    className="rounded-[24px] border border-black/[0.07] bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.03)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                          Invoice
                        </p>

                        <p className="mt-1 truncate text-sm font-black">
                          {getSaleNumber(
                            sale
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSale(
                            sale
                          )
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/[0.07] text-neutral-500 transition hover:bg-neutral-950 hover:text-white"
                      >
                        <Eye size={15} />
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-neutral-400">
                          Customer
                        </p>

                        <p className="mt-1 truncate text-xs font-bold">
                          {getSaleCustomer(
                            sale
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-neutral-400">
                          Date
                        </p>

                        <p className="mt-1 text-xs font-bold">
                          {formatDate(
                            getSaleDate(
                              sale
                            )
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <PaymentBadge
                        method={payment}
                      />

                      <StatusBadge
                        status={status}
                      />
                    </div>

                    <div className="mt-4 flex items-end justify-between border-t border-black/[0.06] pt-4">
                      <span className="text-xs font-semibold text-neutral-400">
                        Total
                      </span>

                      <span className="text-xl font-black">
                        {money(
                          getSaleTotal(
                            sale
                          )
                        )}
                      </span>
                    </div>
                  </motion.div>
                );
              }
            )
          )}
        </div>

        {/* PAGINATION */}

        {!loading &&
          filteredSales.length >
            0 && (
            <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-xs text-neutral-400">
                Showing{" "}
                <span className="font-bold text-neutral-700">
                  {(page - 1) *
                    PAGE_SIZE +
                    1}
                </span>{" "}
                –{" "}
                <span className="font-bold text-neutral-700">
                  {Math.min(
                    page *
                      PAGE_SIZE,
                    filteredSales.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-bold text-neutral-700">
                  {filteredSales.length}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          1,
                          current - 1
                        )
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.07] bg-white text-neutral-600 transition hover:bg-neutral-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft
                    size={16}
                  />
                </button>

                <span className="min-w-[70px] text-center text-xs font-bold">
                  {page} /{" "}
                  {totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    page >= totalPages
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.min(
                          totalPages,
                          current + 1
                        )
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.07] bg-white text-neutral-600 transition hover:bg-neutral-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>
            </div>
          )}
      </div>

      {/* DETAILS MODAL */}

      {selectedSale && (
        <SaleDetailsModal
          sale={selectedSale}
          onClose={() =>
            setSelectedSale(null)
          }
        />
      )}
    </div>
  );
}