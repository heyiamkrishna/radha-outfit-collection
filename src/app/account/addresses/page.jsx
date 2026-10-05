"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  Home,
} from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = {
  full_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  is_default: false,
};

export default function AddressPage() {
  const [supabase] = useState(() => createClient());

  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [defaultId, setDefaultId] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  /* =========================================================
     GET AUTH USER
  ========================================================= */

  const getCurrentUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    if (!data?.user) {
      return null;
    }

    return data.user;
  }, [supabase]);

  /* =========================================================
     LOAD ADDRESSES
  ========================================================= */

  const loadAddresses = useCallback(
    async (currentUser, options = {}) => {
      if (!currentUser?.id) {
        setAddresses([]);
        return;
      }

      if (options.refresh) {
        setRefreshing(true);
      }

      try {
        const { data, error } = await supabase
          .from("addresses")
          .select(`
            id,
            user_id,
            full_name,
            phone,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country,
            is_default,
            created_at,
            updated_at
          `)
          .eq("user_id", currentUser.id)
          .order("is_default", {
            ascending: false,
          })
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          console.error("Address load error:", error);
          throw error;
        }

        /*
          IMPORTANT:

          Empty result is NOT an error.

          Supabase normally returns:
          data = []

          when the user has no addresses.
        */

        setAddresses(
          Array.isArray(data)
            ? data
            : []
        );

        setPageError("");
      } catch (error) {
        console.error("Address load error:", error);

        /*
          Don't keep old/stale addresses.
        */
        setAddresses([]);

        setPageError(
          error?.message ||
            "Unable to load your addresses."
        );
      } finally {
        setRefreshing(false);
      }
    },
    [supabase]
  );

  /* =========================================================
     INITIALIZE
  ========================================================= */

  const initialize = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        setUser(null);
        setAddresses([]);

        setPageError(
          "Please sign in to manage your addresses."
        );

        return;
      }

      setUser(currentUser);

      /*
        If there are no addresses, this simply returns [].
        It is NOT treated as an error.
      */
      await loadAddresses(currentUser);
    } catch (error) {
      console.error("Address initialization error:", error);

      setUser(null);
      setAddresses([]);

      setPageError(
        error?.message ||
          "Unable to load your account."
      );
    } finally {
      /*
        ALWAYS stop skeleton.
      */
      setLoading(false);
    }
  }, [getCurrentUser, loadAddresses]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  /* =========================================================
     REALTIME
  ========================================================= */

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    /*
      IMPORTANT:

      .on() MUST happen before .subscribe().

      This prevents:

      "cannot add postgres_changes callbacks
       after subscribe()"
    */

    const channel = supabase
      .channel(`account-addresses-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "addresses",
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          try {
            await loadAddresses(user);
          } catch (error) {
            console.error(
              "Realtime address refresh error:",
              error
            );
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn(
            "Address realtime channel error."
          );
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, loadAddresses]);

  /* =========================================================
     FORM HELPERS
  ========================================================= */

  function updateForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function openAddForm() {
    setEditingId(null);

    setForm({
      ...EMPTY_FORM,

      /*
        If there are currently no addresses,
        automatically make this one default.
      */
      is_default: addresses.length === 0,
    });

    setShowForm(true);
  }

  function openEditForm(address) {
    setEditingId(address.id);

    setForm({
      full_name: address.full_name || "",
      phone: address.phone || "",
      address_line1:
        address.address_line1 || "",
      address_line2:
        address.address_line2 || "",
      city: address.city || "",
      state: address.state || "",
      postal_code:
        address.postal_code || "",
      country:
        address.country || "India",
      is_default:
        Boolean(address.is_default),
    });

    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  /* =========================================================
     VALIDATE
  ========================================================= */

  function validateForm() {
    if (!form.full_name.trim()) {
      toast.error("Enter the full name.");
      return false;
    }

    if (!form.phone.trim()) {
      toast.error("Enter the phone number.");
      return false;
    }

    if (!form.address_line1.trim()) {
      toast.error("Enter your address.");
      return false;
    }

    if (!form.city.trim()) {
      toast.error("Enter your city.");
      return false;
    }

    if (!form.state.trim()) {
      toast.error("Enter your state.");
      return false;
    }

    if (!form.postal_code.trim()) {
      toast.error("Enter your postal code.");
      return false;
    }

    return true;
  }

  /* =========================================================
     SAVE ADDRESS
  ========================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user?.id) {
      toast.error("Please sign in first.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      /*
        If this is the first address,
        it must be default.
      */

      const shouldBeDefault =
        addresses.length === 0
          ? true
          : Boolean(form.is_default);

      /*
        If setting this address as default,
        remove default from other addresses.
      */

      if (shouldBeDefault) {
        const { error: resetError } =
          await supabase
            .from("addresses")
            .update({
              is_default: false,
            })
            .eq("user_id", user.id);

        if (resetError) {
          throw resetError;
        }
      }

      const payload = {
        user_id: user.id,
        full_name:
          form.full_name.trim(),
        phone: form.phone.trim(),
        address_line1:
          form.address_line1.trim(),
        address_line2:
          form.address_line2.trim() ||
          null,
        city: form.city.trim(),
        state: form.state.trim(),
        postal_code:
          form.postal_code.trim(),
        country:
          form.country.trim() || "India",
        is_default: shouldBeDefault,
      };

      /* -----------------------------------------------------
         UPDATE
      ----------------------------------------------------- */

      if (editingId) {
        const { error } = await supabase
          .from("addresses")
          .update(payload)
          .eq("id", editingId)
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }

        toast.success(
          "Address updated successfully."
        );
      }

      /* -----------------------------------------------------
         INSERT
      ----------------------------------------------------- */

      else {
        const { error } = await supabase
          .from("addresses")
          .insert(payload);

        if (error) {
          throw error;
        }

        toast.success(
          "Address added successfully."
        );
      }

      await loadAddresses(user);

      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (error) {
      console.error(
        "Address save error:",
        error
      );

      toast.error(
        error?.message ||
          "Could not save the address."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     DELETE
  ========================================================= */

  async function deleteAddress(address) {
    if (!user?.id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(address.id);

    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", address.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      /*
        If deleted address was default,
        make another address default.
      */

      if (address.is_default) {
        const remaining =
          addresses.filter(
            (item) =>
              item.id !== address.id
          );

        if (remaining.length > 0) {
          const { error: defaultError } =
            await supabase
              .from("addresses")
              .update({
                is_default: true,
              })
              .eq(
                "id",
                remaining[0].id
              )
              .eq(
                "user_id",
                user.id
              );

          if (defaultError) {
            console.error(
              "Could not assign new default:",
              defaultError
            );
          }
        }
      }

      await loadAddresses(user);

      toast.success(
        "Address deleted."
      );
    } catch (error) {
      console.error(
        "Address delete error:",
        error
      );

      toast.error(
        error?.message ||
          "Could not delete the address."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =========================================================
     SET DEFAULT
  ========================================================= */

  async function makeDefault(id) {
    if (!user?.id) return;

    setDefaultId(id);

    try {
      const { error: resetError } =
        await supabase
          .from("addresses")
          .update({
            is_default: false,
          })
          .eq("user_id", user.id);

      if (resetError) {
        throw resetError;
      }

      const { error } =
        await supabase
          .from("addresses")
          .update({
            is_default: true,
          })
          .eq("id", id)
          .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      await loadAddresses(user);

      toast.success(
        "Default address updated."
      );
    } catch (error) {
      console.error(
        "Default address error:",
        error
      );

      toast.error(
        error?.message ||
          "Could not update default address."
      );
    } finally {
      setDefaultId(null);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f4f0] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="h-4 w-24 rounded bg-black/10" />

            <div className="mt-3 h-10 w-56 rounded-xl bg-black/10" />

            <div className="mt-3 h-4 w-80 max-w-full rounded bg-black/5" />

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-64 rounded-[28px] bg-black/5"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     NOT LOGGED IN / ERROR
  ========================================================= */

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f5f4f0] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[30px] border border-black/5 bg-white/80 p-8 text-center shadow-xl backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle
                size={28}
                className="text-red-500"
              />
            </div>

            <h1 className="mt-5 text-2xl font-black">
              Sign in required
            </h1>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              {pageError ||
                "Please sign in to manage your delivery addresses."}
            </p>

            <button
              type="button"
              onClick={initialize}
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-6 text-sm font-bold text-white"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     ACTUAL DATABASE ERROR
  ========================================================= */

  if (pageError) {
    return (
      <main className="min-h-screen bg-[#f5f4f0] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[30px] border border-red-100 bg-white p-7 shadow-xl sm:p-9">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle
                size={28}
                className="text-red-500"
              />
            </div>

            <h1 className="mt-5 text-center text-xl font-black">
              Unable to load addresses
            </h1>

            <p className="mt-2 text-center text-sm leading-6 text-neutral-500">
              {pageError}
            </p>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={initialize}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-6 text-sm font-bold text-white"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#f5f4f0] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-neutral-400">
              Account
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              My Addresses
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              Save your delivery addresses for a faster
              checkout experience.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={refreshing}
              onClick={() =>
                loadAddresses(user, {
                  refresh: true,
                })
              }
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-white transition hover:bg-neutral-100 disabled:opacity-50"
              aria-label="Refresh addresses"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
            </button>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-5 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 active:scale-[0.98]"
            >
              <Plus size={18} />
              <span>Add Address</span>
            </button>
          </div>
        </div>

        {/* ===================================================
            NO ADDRESS
        =================================================== */}

        {addresses.length === 0 ? (
          <section className="mt-8 overflow-hidden rounded-[30px] border border-black/5 bg-white/80 p-8 text-center shadow-sm backdrop-blur-xl sm:p-14">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-neutral-100">
              <Home
                size={32}
                className="text-neutral-500"
              />
            </div>

            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">
              Delivery
            </p>

            <h2 className="mt-2 text-2xl font-black">
              No address saved
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
              You haven't added a delivery address yet.
              Add one now and it will be available during
              checkout.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-6 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-neutral-800"
            >
              <Plus size={18} />
              Add Your First Address
            </button>
          </section>
        ) : (

          /* =================================================
             ADDRESS GRID
          ================================================= */

          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                deleting={
                  deletingId === address.id
                }
                makingDefault={
                  defaultId === address.id
                }
                onEdit={() =>
                  openEditForm(address)
                }
                onDelete={() =>
                  deleteAddress(address)
                }
                onMakeDefault={() =>
                  makeDefault(address.id)
                }
              />
            ))}

            {/* ADD CARD */}
            <button
              type="button"
              onClick={openAddForm}
              className="group flex min-h-[280px] flex-col items-center justify-center rounded-[28px] border border-dashed border-black/10 bg-white/40 p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-black/20 hover:bg-white/70"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 transition duration-300 group-hover:scale-110 group-hover:bg-neutral-900 group-hover:text-white">
                <Plus size={24} />
              </div>

              <h3 className="mt-5 text-sm font-black">
                Add another address
              </h3>

              <p className="mt-1 max-w-[200px] text-xs leading-5 text-neutral-500">
                Save another delivery location.
              </p>
            </button>
          </section>
        )}
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div
            className="max-h-[94vh] w-full overflow-y-auto rounded-t-[30px] bg-[#faf9f6] p-5 shadow-2xl sm:max-w-2xl sm:rounded-[30px] sm:p-7"
          >
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-neutral-400">
                  Delivery
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {editingId
                    ? "Edit Address"
                    : "Add Address"}
                </h2>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={closeForm}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 transition hover:bg-neutral-200 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Full Name"
                  required
                  value={form.full_name}
                  placeholder="Krishna"
                  onChange={(value) =>
                    updateForm(
                      "full_name",
                      value
                    )
                  }
                />

                <FormInput
                  label="Phone"
                  required
                  value={form.phone}
                  placeholder="9876543210"
                  onChange={(value) =>
                    updateForm(
                      "phone",
                      value
                    )
                  }
                  type="tel"
                />
              </div>

              <FormInput
                label="Address Line 1"
                required
                value={form.address_line1}
                placeholder="House / Flat / Street"
                onChange={(value) =>
                  updateForm(
                    "address_line1",
                    value
                  )
                }
              />

              <FormInput
                label="Address Line 2"
                value={form.address_line2}
                placeholder="Apartment / Landmark (optional)"
                onChange={(value) =>
                  updateForm(
                    "address_line2",
                    value
                  )
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="City"
                  required
                  value={form.city}
                  placeholder="Delhi"
                  onChange={(value) =>
                    updateForm(
                      "city",
                      value
                    )
                  }
                />

                <FormInput
                  label="State"
                  required
                  value={form.state}
                  placeholder="Delhi"
                  onChange={(value) =>
                    updateForm(
                      "state",
                      value
                    )
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Postal Code"
                  required
                  value={form.postal_code}
                  placeholder="110001"
                  onChange={(value) =>
                    updateForm(
                      "postal_code",
                      value
                    )
                  }
                  inputMode="numeric"
                />

                <FormInput
                  label="Country"
                  required
                  value={form.country}
                  placeholder="India"
                  onChange={(value) =>
                    updateForm(
                      "country",
                      value
                    )
                  }
                />
              </div>

              {/* DEFAULT */}
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-black/5 bg-white p-4 transition hover:border-black/10">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(event) =>
                    updateForm(
                      "is_default",
                      event.target.checked
                    )
                  }
                  className="mt-0.5 h-4 w-4 accent-black"
                />

                <div>
                  <p className="text-sm font-bold">
                    Make this my default address
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    This address will be selected automatically
                    during checkout.
                  </p>
                </div>
              </label>

              {/* BUTTONS */}
              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeForm}
                  className="h-12 rounded-xl border border-black/10 bg-white px-5 text-sm font-bold transition hover:bg-neutral-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-6 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Address"
                    : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/* ===========================================================
   ADDRESS CARD
=========================================================== */

function AddressCard({
  address,
  deleting,
  makingDefault,
  onEdit,
  onDelete,
  onMakeDefault,
}) {
  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-black/5 bg-white/80 p-5 shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* DEFAULT BADGE */}
      {address.is_default && (
        <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-700">
          <CheckCircle2 size={11} />
          Default
        </div>
      )}

      {/* ICON */}
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100 transition duration-300 group-hover:bg-neutral-900 group-hover:text-white">
        <MapPin size={20} />
      </div>

      {/* DETAILS */}
      <div className="mt-5">
        <h2 className="pr-20 text-base font-black">
          {address.full_name ||
            "Delivery Address"}
        </h2>

        {address.phone && (
          <p className="mt-1 text-xs text-neutral-500">
            {address.phone}
          </p>
        )}

        <div className="mt-4 space-y-1 text-sm leading-6 text-neutral-700">
          {address.address_line1 && (
            <p>{address.address_line1}</p>
          )}

          {address.address_line2 && (
            <p>{address.address_line2}</p>
          )}

          {(address.city ||
            address.state) && (
            <p>
              {address.city}
              {address.city &&
              address.state
                ? ", "
                : ""}
              {address.state}
            </p>
          )}

          {(address.postal_code ||
            address.country) && (
            <p>
              {address.postal_code}
              {address.postal_code &&
              address.country
                ? ", "
                : ""}
              {address.country}
            </p>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-6 flex gap-2 border-t border-black/5 pt-4">
        {!address.is_default && (
          <button
            type="button"
            disabled={makingDefault}
            onClick={onMakeDefault}
            className="flex-1 rounded-xl border border-black/10 px-2 py-2.5 text-[11px] font-bold transition hover:bg-neutral-100 disabled:opacity-50"
          >
            {makingDefault
              ? "Updating..."
              : "Make Default"}
          </button>
        )}

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-black/10 px-3 py-2.5 text-xs font-bold transition hover:bg-neutral-100"
        >
          <Pencil size={13} />
          Edit
        </button>

        <button
          type="button"
          disabled={deleting}
          onClick={onDelete}
          className="inline-flex items-center justify-center rounded-xl border border-red-100 px-3 py-2.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? (
            <Loader2
              size={14}
              className="animate-spin"
            />
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      </div>
    </article>
  );
}

/* ===========================================================
   FORM INPUT
=========================================================== */

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  inputMode,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-neutral-500">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        inputMode={inputMode}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-4 focus:ring-black/5"
      />
    </label>
  );
}