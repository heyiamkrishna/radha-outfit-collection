"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  CalendarDays,
  ShieldCheck,
  Save,
  RefreshCw,
  LogOut,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

function formatDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getInitials(name, email) {
  const value = String(name || email || "U").trim();

  if (!value) return "U";

  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProfile = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setMessage("");

      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!authUser) {
        setUser(null);
        setProfile(null);
        return;
      }

      setUser(authUser);

      const { data, error: profileError } = await supabase
        .from("users")
        .select(`
          id,
          full_name,
          phone,
          email,
          role,
          avatar_url,
          created_at,
          updated_at
        `)
        .eq("id", authUser.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      /*
       * If the users row doesn't exist yet, we still show
       * the authenticated user's email.
       */
      const nextProfile = data || {
        id: authUser.id,
        full_name:
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          "",
        phone:
          authUser.user_metadata?.phone ||
          "",
        email: authUser.email || "",
        role: "customer",
        avatar_url:
          authUser.user_metadata?.avatar_url ||
          "",
        created_at: authUser.created_at,
      };

      setProfile(nextProfile);

      setForm({
        full_name: nextProfile.full_name || "",
        phone: nextProfile.phone || "",
      });
    } catch (err) {
      console.error("Profile loading error:", err);

      setError(
        err?.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!user) {
      setError("Please sign in first.");
      return;
    }

    const fullName = form.full_name.trim();
    const phone = form.phone.trim();

    if (!fullName) {
      setError("Please enter your full name.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      /*
       * Update users table.
       *
       * We intentionally do NOT update email here.
       * Email changes should go through Supabase Auth.
       */
      const { data, error: updateError } = await supabase
        .from("users")
        .update({
          full_name: fullName,
          phone: phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select(`
          id,
          full_name,
          phone,
          email,
          role,
          avatar_url,
          created_at,
          updated_at
        `)
        .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      /*
       * If RLS/table setup doesn't return the updated row,
       * don't treat the save as failed.
       */
      if (data) {
        setProfile(data);
      } else {
        setProfile((previous) => ({
          ...previous,
          full_name: fullName,
          phone: phone || null,
          updated_at: new Date().toISOString(),
        }));
      }

      /*
       * Keep Auth metadata synchronized with the profile name.
       */
      const { error: metadataError } =
        await supabase.auth.updateUser({
          data: {
            full_name: fullName,
            name: fullName,
            phone: phone || null,
          },
        });

      if (metadataError) {
        console.warn(
          "Auth metadata update warning:",
          metadataError
        );
      }

      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setError("");

      const { error: logoutError } =
        await supabase.auth.signOut();

      if (logoutError) {
        throw logoutError;
      }

      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);

      setError(
        err?.message ||
          "Unable to sign out."
      );

      setLoggingOut(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f7f6f2] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[30px] border border-black/[0.06] bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
              <User
                size={28}
                className="text-neutral-400"
              />
            </div>

            <h1 className="mt-5 text-2xl font-black">
              Sign in required
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Please sign in to view your profile.
            </p>

            <a
              href="/login"
              className="mt-6 inline-flex h-11 items-center rounded-xl bg-neutral-950 px-6 text-sm font-bold text-white transition hover:bg-neutral-800"
            >
              Sign In
            </a>
          </div>
        </div>
      </main>
    );
  }

  const displayName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "Customer";

  const email =
    profile?.email ||
    user.email ||
    "";

  const role =
    profile?.role ||
    "customer";

  const initials = getInitials(
    displayName,
    email
  );

  const avatar =
    profile?.avatar_url ||
    user.user_metadata?.avatar_url ||
    "";

  return (
    <main className="min-h-screen bg-[#f7f6f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
              Account
            </p>

            <h1 className="text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl">
              My Profile
            </h1>

            <p className="mt-2 max-w-xl text-sm text-neutral-500">
              Manage your personal information and account details.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadProfile(true)}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-bold shadow-sm transition hover:bg-neutral-100 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </motion.div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-bold">
                Something went wrong
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </motion.div>
        )}

        {message && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p className="font-semibold">
              {message}
            </p>
          </motion.div>
        )}

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">

          {/* Profile Card */}
          <motion.aside
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.45,
            }}
            className="h-fit overflow-hidden rounded-[30px] border border-black/[0.06] bg-white shadow-[0_15px_45px_rgba(0,0,0,0.05)]"
          >
            <div className="relative overflow-hidden bg-neutral-950 px-6 pb-8 pt-8 text-white">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

              <div className="relative flex flex-col items-center text-center">
                <div className="relative">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={displayName}
                      className="h-24 w-24 rounded-[28px] object-cover ring-4 ring-white/10"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white text-2xl font-black text-neutral-950 ring-4 ring-white/10">
                      {initials}
                    </div>
                  )}

                  <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-neutral-950 shadow-lg">
                    <Camera size={14} />
                  </div>
                </div>

                <h2 className="mt-5 text-xl font-black">
                  {displayName}
                </h2>

                <p className="mt-1 max-w-full truncate px-4 text-xs text-white/60">
                  {email}
                </p>

                <div className="mt-4 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/80">
                  {role}
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6">

              <InfoRow
                icon={Mail}
                label="Email"
                value={email || "Not available"}
              />

              <InfoRow
                icon={Phone}
                label="Phone"
                value={
                  profile?.phone ||
                  "Not added"
                }
              />

              <InfoRow
                icon={CalendarDays}
                label="Member since"
                value={formatDate(
                  profile?.created_at ||
                    user.created_at
                )}
              />

              <InfoRow
                icon={ShieldCheck}
                label="Account"
                value="Verified"
              />

            </div>

            <div className="border-t border-black/[0.06] p-6">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
              >
                {loggingOut ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <LogOut size={16} />
                )}

                {loggingOut
                  ? "Signing out..."
                  : "Sign Out"}
              </button>
            </div>
          </motion.aside>

          {/* Form */}
          <motion.section
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
              delay: 0.08,
            }}
            className="rounded-[30px] border border-black/[0.06] bg-white p-5 shadow-[0_15px_45px_rgba(0,0,0,0.05)] sm:p-7"
          >
            <div className="mb-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">
                Personal information
              </p>

              <h2 className="mt-2 text-2xl font-black text-neutral-950">
                Profile Details
              </h2>

              <p className="mt-2 text-sm text-neutral-500">
                Update the information used for your orders and
                account.
              </p>
            </div>

            <form
              onSubmit={handleSave}
              className="space-y-6"
            >
              {/* Full name */}
              <div>
                <label
                  htmlFor="full_name"
                  className="mb-2 block text-xs font-bold text-neutral-700"
                >
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="h-12 w-full rounded-2xl border border-black/10 bg-[#fafafa] pl-11 pr-4 text-sm font-medium outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-bold text-neutral-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    readOnly
                    className="h-12 w-full cursor-not-allowed rounded-2xl border border-black/[0.06] bg-neutral-100 pl-11 pr-4 text-sm font-medium text-neutral-500 outline-none"
                  />
                </div>

                <p className="mt-2 text-[11px] text-neutral-400">
                  Email is managed by your authentication account.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-xs font-bold text-neutral-700"
                >
                  Phone Number
                </label>

                <div className="relative">
                  <Phone
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    autoComplete="tel"
                    className="h-12 w-full rounded-2xl border border-black/10 bg-[#fafafa] pl-11 pr-4 text-sm font-medium outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-black/[0.04]"
                  />
                </div>
              </div>

              {/* Address hint */}
              <div className="rounded-2xl border border-black/[0.06] bg-[#fafafa] p-4">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    <MapPin
                      size={16}
                      className="text-neutral-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-neutral-900">
                      Delivery information
                    </p>

                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      Your delivery addresses can be managed during
                      checkout. Your saved profile information may be
                      used to pre-fill customer details.
                    </p>
                  </div>
                </div>
              </div>

              {/* Save */}
              <div className="flex flex-col-reverse gap-3 border-t border-black/[0.06] pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => loadProfile(true)}
                  disabled={saving || refreshing}
                  className="h-12 rounded-2xl border border-black/10 px-5 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-neutral-950 px-7 text-sm font-black text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />

                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.section>
        </div>
      </div>
    </main>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
        <Icon
          size={16}
          className="text-neutral-500"
        />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          {label}
        </p>

        <p className="truncate text-xs font-bold text-neutral-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <main className="min-h-screen bg-[#f7f6f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="h-3 w-20 animate-pulse rounded bg-neutral-200" />

          <div className="mt-3 h-10 w-52 animate-pulse rounded-xl bg-neutral-200" />

          <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-neutral-200" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="h-[500px] animate-pulse rounded-[30px] bg-white" />

          <div className="h-[600px] animate-pulse rounded-[30px] bg-white" />
        </div>
      </div>
    </main>
  );
}