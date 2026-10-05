"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Users,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Trash2,
  X,
  Save,
  RefreshCw,
  ShoppingBag,
  IndianRupee,
  MessageCircle,
  MoreVertical,
  UserRound,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const supabase = createClient();

const EMPTY_FORM = {
  name: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
};

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value) {
  if (!value) return "Never";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(name) {
  if (!name) return "C";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function normalizeCustomer(customer) {
  return {
    ...customer,
    name: customer?.name || "",
    phone: customer?.phone || "",
    whatsapp: customer?.whatsapp || "",
    email: customer?.email || "",
    address: customer?.address || "",
    total_orders: Number(customer?.total_orders || 0),
    total_spent: Number(customer?.total_spent || 0),
  };
}

export default function OfflineCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [notice, setNotice] = useState(null);
  const [error, setError] = useState("");

  const showNotice = useCallback((message, type = "success") => {
    setNotice({
      id: Date.now(),
      message,
      type,
    });

    window.setTimeout(() => {
      setNotice(null);
    }, 3000);
  }, []);

  const loadCustomers = useCallback(async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error: supabaseError } = await supabase
        .from("offline_customers")
        .select(
          `
            id,
            name,
            phone,
            whatsapp,
            email,
            address,
            total_orders,
            total_spent,
            created_at,
            updated_at
          `
        )
        .order("created_at", {
          ascending: false,
        });

      if (supabaseError) {
        console.error("Offline customers error:", supabaseError);
        throw new Error(
          supabaseError.message || "Could not load offline customers."
        );
      }

      setCustomers((data || []).map(normalizeCustomer));
    } catch (err) {
      console.error("loadCustomers:", err);

      setError(
        err?.message ||
          "Could not load offline customers. Please check your Supabase table and RLS policies."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  /*
   * Supabase Realtime
   *
   * Whenever an offline customer is inserted, updated or deleted,
   * the customer list is refreshed automatically.
   */
  useEffect(() => {
    const channel = supabase
      .channel("offline-customers-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "offline_customers",
        },
        () => {
          loadCustomers(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      return [
        customer.name,
        customer.phone,
        customer.whatsapp,
        customer.email,
        customer.address,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [customers, search]);

  const statistics = useMemo(() => {
    const totalCustomers = customers.length;

    const totalOrders = customers.reduce(
      (sum, customer) => sum + Number(customer.total_orders || 0),
      0
    );

    const totalSpent = customers.reduce(
      (sum, customer) => sum + Number(customer.total_spent || 0),
      0
    );

    const activeCustomers = customers.filter(
      (customer) => Number(customer.total_orders || 0) > 0
    ).length;

    return {
      totalCustomers,
      totalOrders,
      totalSpent,
      activeCustomers,
    };
  }, [customers]);

  function openAddForm() {
    setEditingCustomer(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function openEditForm(customer) {
    setEditingCustomer(customer);

    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      whatsapp: customer.whatsapp || "",
      email: customer.email || "",
      address: customer.address || "",
    });

    setError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingCustomer(null);
    setForm(EMPTY_FORM);
  }

  function updateForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSaveCustomer(event) {
    event.preventDefault();

    const customerName = form.name.trim();

    if (!customerName) {
      setError("Customer name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: customerName,
        phone: form.phone.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (editingCustomer?.id) {
        const { data, error: updateError } = await supabase
          .from("offline_customers")
          .update(payload)
          .eq("id", editingCustomer.id)
          .select()
          .single();

        if (updateError) {
          console.error("Update customer error:", updateError);
          throw new Error(
            updateError.message || "Could not update customer."
          );
        }

        const normalized = normalizeCustomer(data);

        setCustomers((previous) =>
          previous.map((customer) =>
            customer.id === normalized.id ? normalized : customer
          )
        );

        if (selectedCustomer?.id === normalized.id) {
          setSelectedCustomer(normalized);
        }

        showNotice("Customer updated successfully.");
      } else {
        const { data, error: insertError } = await supabase
          .from("offline_customers")
          .insert({
            ...payload,
            total_orders: 0,
            total_spent: 0,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Create customer error:", insertError);
          throw new Error(
            insertError.message || "Could not create customer."
          );
        }

        const normalized = normalizeCustomer(data);

        setCustomers((previous) => [normalized, ...previous]);

        showNotice("Customer added successfully.");
      }

      closeForm();
    } catch (err) {
      console.error("handleSaveCustomer:", err);

      setError(
        err?.message ||
          "Could not save customer. Check your Supabase RLS policy."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCustomer(customer) {
    const confirmed = window.confirm(
      `Delete "${customer.name}"?\n\nThis should only be done for customers who are not required by existing offline sales.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(customer.id);
      setError("");

      const { error: deleteError } = await supabase
        .from("offline_customers")
        .delete()
        .eq("id", customer.id);

      if (deleteError) {
        console.error("Delete customer error:", deleteError);
        throw new Error(
          deleteError.message || "Could not delete customer."
        );
      }

      setCustomers((previous) =>
        previous.filter((item) => item.id !== customer.id)
      );

      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer(null);
      }

      showNotice("Customer deleted.");
    } catch (err) {
      console.error("handleDeleteCustomer:", err);

      setError(
        err?.message ||
          "Could not delete this customer. They may be linked to offline sales."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleCustomerClick(customer) {
    setSelectedCustomer(customer);
  }

  return (
    <div className="min-h-screen bg-[#f5f4f0] text-neutral-900">
      {/* Toast */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.96,
            }}
            className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white/95 p-4 shadow-2xl backdrop-blur-xl">
              {notice.type === "success" ? (
                <CheckCircle2
                  size={20}
                  className="shrink-0 text-emerald-600"
                />
              ) : (
                <AlertCircle
                  size={20}
                  className="shrink-0 text-red-600"
                />
              )}

              <p className="text-sm font-medium">{notice.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white">
                <Users size={17} />
              </div>

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                Offline Store
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Customers
            </h1>

            <p className="mt-1 text-sm text-neutral-500">
              Manage customers for your physical store and offline POS sales.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => loadCustomers(true)}
              disabled={refreshing}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-bold transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />

              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={openAddForm}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0"
            >
              <Plus size={17} />
              Add Customer
            </button>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="mb-5 overflow-hidden"
            >
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">
                    Customer operation failed
                  </p>

                  <p className="mt-1 break-words text-xs">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="rounded-lg p-1 hover:bg-red-100"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Customers"
            value={statistics.totalCustomers}
          />

          <StatCard
            icon={UserPlus}
            label="Buying Customers"
            value={statistics.activeCustomers}
          />

          <StatCard
            icon={ShoppingBag}
            label="Offline Orders"
            value={statistics.totalOrders}
          />

          <StatCard
            icon={IndianRupee}
            label="Total Spent"
            value={formatCurrency(statistics.totalSpent)}
          />
        </div>

        {/* Search */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer, phone, WhatsApp or email..."
              className="h-12 w-full rounded-2xl border border-black/10 bg-white pl-11 pr-11 text-sm outline-none transition placeholder:text-neutral-400 focus:border-black/30 focus:ring-4 focus:ring-black/5"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex h-12 items-center justify-center rounded-2xl border border-black/10 bg-white px-4 text-xs font-bold text-neutral-500">
            {filteredCustomers.length} result
            {filteredCustomers.length === 1 ? "" : "s"}
          </div>
        </div>

        {/* Main content */}
        {loading ? (
          <LoadingState />
        ) : filteredCustomers.length === 0 ? (
          <EmptyState
            hasSearch={Boolean(search.trim())}
            onAdd={openAddForm}
            onClear={() => setSearch("")}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredCustomers.map((customer, index) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  index={index}
                  deleting={deletingId === customer.id}
                  onClick={() => handleCustomerClick(customer)}
                  onEdit={() => openEditForm(customer)}
                  onDelete={() => handleDeleteCustomer(customer)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <CustomerFormModal
            form={form}
            editingCustomer={editingCustomer}
            saving={saving}
            onChange={updateForm}
            onClose={closeForm}
            onSubmit={handleSaveCustomer}
          />
        )}
      </AnimatePresence>

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <CustomerDetailModal
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            onEdit={() => {
              setSelectedCustomer(null);
              openEditForm(selectedCustomer);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STAT CARD                                                                  */
/* -------------------------------------------------------------------------- */

function StatCard({ icon: Icon, label, value }) {
  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      className="rounded-2xl border border-black/[0.07] bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
          <Icon size={17} />
        </div>
      </div>

      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xl font-black tracking-tight sm:text-2xl">
        {value}
      </p>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* CUSTOMER CARD                                                              */
/* -------------------------------------------------------------------------- */

function CustomerCard({
  customer,
  index,
  deleting,
  onClick,
  onEdit,
  onDelete,
}) {
  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: deleting ? 0.5 : 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.96,
      }}
      transition={{
        delay: Math.min(index * 0.035, 0.25),
        duration: 0.25,
      }}
      whileHover={{
        y: -3,
      }}
      className="group overflow-hidden rounded-[24px] border border-black/[0.07] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.035)]"
    >
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left"
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-sm font-black text-white">
                {getInitials(customer.name)}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-base font-black">
                  {customer.name}
                </h2>

                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Offline Customer
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-neutral-100 px-2.5 py-1.5 text-[10px] font-black">
              #{String(customer.id).slice(0, 6)}
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            {customer.phone ? (
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <Phone size={15} className="shrink-0 text-neutral-400" />
                <span className="truncate">{customer.phone}</span>
              </div>
            ) : null}

            {customer.whatsapp ? (
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <MessageCircle
                  size={15}
                  className="shrink-0 text-neutral-400"
                />
                <span className="truncate">{customer.whatsapp}</span>
              </div>
            ) : null}

            {customer.email ? (
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <Mail size={15} className="shrink-0 text-neutral-400" />
                <span className="truncate">{customer.email}</span>
              </div>
            ) : null}

            {!customer.phone &&
              !customer.whatsapp &&
              !customer.email && (
                <p className="text-xs italic text-neutral-400">
                  No contact information
                </p>
              )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-neutral-50 p-3">
              <p className="text-[9px] font-black uppercase tracking-wider text-neutral-400">
                Orders
              </p>

              <p className="mt-1 text-lg font-black">
                {customer.total_orders}
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-50 p-3">
              <p className="text-[9px] font-black uppercase tracking-wider text-neutral-400">
                Spent
              </p>

              <p className="mt-1 truncate text-sm font-black">
                {formatCurrency(customer.total_spent)}
              </p>
            </div>
          </div>

          {customer.address ? (
            <div className="mt-4 flex items-start gap-2 text-xs text-neutral-500">
              <MapPin
                size={14}
                className="mt-0.5 shrink-0 text-neutral-400"
              />

              <span className="line-clamp-2">{customer.address}</span>
            </div>
          ) : null}
        </div>
      </button>

      <div className="flex border-t border-black/[0.06]">
        <button
          type="button"
          onClick={onEdit}
          disabled={deleting}
          className="flex h-11 flex-1 items-center justify-center gap-2 text-xs font-bold text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950 disabled:opacity-50"
        >
          <Pencil size={14} />
          Edit
        </button>

        <div className="w-px bg-black/[0.06]" />

        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="flex h-11 flex-1 items-center justify-center gap-2 text-xs font-bold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}

          Delete
        </button>
      </div>
    </motion.article>
  );
}

/* -------------------------------------------------------------------------- */
/* FORM MODAL                                                                 */
/* -------------------------------------------------------------------------- */

function CustomerFormModal({
  form,
  editingCustomer,
  saving,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
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
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 40,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: 30,
          scale: 0.98,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 28,
        }}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:max-w-xl sm:rounded-[28px]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[0.06] bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-neutral-400">
              Offline Store
            </p>

            <h2 className="mt-1 text-lg font-black">
              {editingCustomer ? "Edit Customer" : "Add Customer"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 transition hover:bg-neutral-200 disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 sm:p-6">
          <div className="space-y-4">
            <FormInput
              label="Customer Name"
              required
              value={form.name}
              onChange={(value) => onChange("name", value)}
              placeholder="Enter customer name"
              icon={UserRound}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Phone"
                value={form.phone}
                onChange={(value) => onChange("phone", value)}
                placeholder="9876543210"
                type="tel"
                icon={Phone}
              />

              <FormInput
                label="WhatsApp"
                value={form.whatsapp}
                onChange={(value) => onChange("whatsapp", value)}
                placeholder="9876543210"
                type="tel"
                icon={MessageCircle}
              />
            </div>

            <FormInput
              label="Email"
              value={form.email}
              onChange={(value) => onChange("email", value)}
              placeholder="customer@example.com"
              type="email"
              icon={Mail}
            />

            <div>
              <label className="mb-2 block text-xs font-bold text-neutral-700">
                Address
              </label>

              <div className="relative">
                <MapPin
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-3.5 text-neutral-400"
                />

                <textarea
                  value={form.address}
                  onChange={(event) =>
                    onChange("address", event.target.value)
                  }
                  rows={3}
                  placeholder="Customer address"
                  className="w-full resize-none rounded-xl border border-black/10 bg-neutral-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/5"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-11 rounded-xl border border-black/10 px-5 text-sm font-bold transition hover:bg-neutral-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}

              {saving
                ? "Saving..."
                : editingCustomer
                  ? "Save Changes"
                  : "Add Customer"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* FORM INPUT                                                                 */
/* -------------------------------------------------------------------------- */

function FormInput({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-neutral-700">
        {label}

        {required ? (
          <span className="ml-1 text-red-500">*</span>
        ) : null}
      </label>

      <div className="relative">
        {Icon ? (
          <Icon
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
          />
        ) : null}

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className="h-11 w-full rounded-xl border border-black/10 bg-neutral-50 pl-10 pr-3 text-sm outline-none transition focus:border-black/30 focus:bg-white focus:ring-4 focus:ring-black/5"
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DETAIL MODAL                                                               */
/* -------------------------------------------------------------------------- */

function CustomerDetailModal({ customer, onClose, onEdit }) {
  return (
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
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 40,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: 30,
          scale: 0.98,
        }}
        className="w-full overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:max-w-lg sm:rounded-[28px]"
      >
        <div className="bg-neutral-950 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-lg font-black text-neutral-950">
                {getInitials(customer.name)}
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Customer Profile
                </p>

                <h2 className="mt-1 text-xl font-black">
                  {customer.name}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-3">
            <DetailStat
              icon={ShoppingBag}
              label="Orders"
              value={customer.total_orders}
            />

            <DetailStat
              icon={IndianRupee}
              label="Spent"
              value={formatCurrency(customer.total_spent)}
            />
          </div>

          <div className="mt-5 space-y-3">
            <ContactRow
              icon={Phone}
              label="Phone"
              value={customer.phone || "Not provided"}
            />

            <ContactRow
              icon={MessageCircle}
              label="WhatsApp"
              value={customer.whatsapp || "Not provided"}
            />

            <ContactRow
              icon={Mail}
              label="Email"
              value={customer.email || "Not provided"}
            />

            <ContactRow
              icon={MapPin}
              label="Address"
              value={customer.address || "Not provided"}
            />

            <ContactRow
              icon={CalendarDays}
              label="Customer since"
              value={formatDate(customer.created_at)}
            />
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            <Pencil size={15} />
            Edit Customer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* DETAIL STAT                                                                */
/* -------------------------------------------------------------------------- */

function DetailStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-neutral-50 p-4">
      <Icon size={17} className="text-neutral-400" />

      <p className="mt-3 text-[9px] font-black uppercase tracking-wider text-neutral-400">
        {label}
      </p>

      <p className="mt-1 truncate text-lg font-black">{value}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* CONTACT ROW                                                                */
/* -------------------------------------------------------------------------- */

function ContactRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-black/[0.06] p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-wider text-neutral-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-neutral-700">
          {value}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* LOADING                                                                    */
/* -------------------------------------------------------------------------- */

function LoadingState() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="rounded-[24px] border border-black/[0.06] bg-white p-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 animate-pulse rounded-2xl bg-neutral-200" />

            <div className="flex-1">
              <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />
              <div className="mt-2 h-3 w-20 animate-pulse rounded bg-neutral-100" />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="h-3 w-40 animate-pulse rounded bg-neutral-100" />
            <div className="h-3 w-32 animate-pulse rounded bg-neutral-100" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="h-20 animate-pulse rounded-2xl bg-neutral-100" />
            <div className="h-20 animate-pulse rounded-2xl bg-neutral-100" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EMPTY STATE                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState({ hasSearch, onAdd, onClear }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-[28px] border border-dashed border-black/10 bg-white px-5 py-16 text-center"
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-neutral-100">
        {hasSearch ? (
          <Search size={25} className="text-neutral-400" />
        ) : (
          <Users size={25} className="text-neutral-400" />
        )}
      </div>

      <h2 className="mt-5 text-lg font-black">
        {hasSearch ? "No customers found" : "No offline customers yet"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
        {hasSearch
          ? "Try another customer name, phone number, WhatsApp number or email."
          : "Add your first offline customer to start tracking physical-store purchases."}
      </p>

      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        {hasSearch ? (
          <button
            type="button"
            onClick={onClear}
            className="h-11 rounded-xl border border-black/10 px-5 text-sm font-bold hover:bg-neutral-50"
          >
            Clear Search
          </button>
        ) : null}

        <button
          type="button"
          onClick={onAdd}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-bold text-white hover:bg-neutral-800"
        >
          <Plus size={16} />
          Add Customer
        </button>
      </div>
    </motion.div>
  );
}