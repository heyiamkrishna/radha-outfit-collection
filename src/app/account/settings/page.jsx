"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Bell,
  Moon,
  Sun,
  ShieldCheck,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Check,
  ChevronRight,
  LogOut,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const pageVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

function Toggle({ enabled, onChange, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      className={[
        "relative h-7 w-12 shrink-0 rounded-full transition-all duration-300",
        enabled ? "bg-neutral-900" : "bg-neutral-200",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      ].join(" ")}
    >
      <motion.span
        animate={{ x: enabled ? 20 : 3 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-[3px] left-0 h-[22px] w-[22px] rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
  danger = false,
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={[
        "flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between",
        danger ? "border-red-100" : "border-neutral-100",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-start gap-4">
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            danger
              ? "bg-red-50 text-red-600"
              : "bg-neutral-100 text-neutral-700",
          ].join(" ")}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <h3
            className={[
              "text-sm font-bold",
              danger ? "text-red-600" : "text-neutral-900",
            ].join(" ")}
          >
            {title}
          </h3>

          {description && (
            <p className="mt-1 max-w-xl text-xs leading-5 text-neutral-500">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="shrink-0">{children}</div>
    </motion.div>
  );
}

function Section({ icon: Icon, title, description, children }) {
  return (
    <motion.section
      variants={itemVariants}
      className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.04)] backdrop-blur-xl"
    >
      <div className="border-b border-neutral-100 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white">
            <Icon size={18} />
          </div>

          <div>
            <h2 className="text-base font-black text-neutral-900">
              {title}
            </h2>

            {description && (
              <p className="mt-0.5 text-xs text-neutral-500">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="divide-y divide-neutral-100">{children}</div>
    </motion.section>
  );
}

export default function SettingsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    orderNotifications: true,
    promotionalNotifications: false,
    browserNotifications: false,
    darkMode: false,
    showOrderUpdates: true,
  });

  const [showPassword, setShowPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;

        if (!mounted) return;

        setUser(user);

        /*
         * Settings are intentionally stored locally here.
         *
         * This avoids requiring a `public.users` table.
         * You can later move these preferences into a dedicated
         * `user_settings` table if desired.
         */
        const stored = localStorage.getItem(
          `radha-settings-${user?.id || "guest"}`
        );

        if (stored) {
          try {
            const parsed = JSON.parse(stored);

            setSettings((current) => ({
              ...current,
              ...parsed,
            }));
          } catch {
            // Ignore malformed local settings.
          }
        }
      } catch (error) {
        console.error("Settings initialization error:", error);
        toast.error("Unable to load account settings.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  function updateSetting(key, value) {
    setSettings((current) => {
      const next = {
        ...current,
        [key]: value,
      };

      if (user?.id) {
        localStorage.setItem(
          `radha-settings-${user.id}`,
          JSON.stringify(next)
        );
      }

      return next;
    });

    toast.success("Setting updated");
  }

  async function handlePasswordChange(event) {
    event.preventDefault();

    if (!passwordData.password) {
      toast.error("Enter a new password.");
      return;
    }

    if (passwordData.password.length < 6) {
      toast.error("Password must contain at least 6 characters.");
      return;
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setPasswordLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: passwordData.password,
      });

      if (error) throw error;

      setPasswordData({
        password: "",
        confirmPassword: "",
      });

      toast.success("Password updated successfully.");
    } catch (error) {
      console.error("Password update error:", error);
      toast.error(error?.message || "Unable to update password.");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      setSaving(true);

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Unable to sign out.");
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    toast.error(
      "Account deletion should be handled through a protected server-side action."
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f4f0] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse space-y-6">
            <div className="h-32 rounded-[28px] bg-neutral-200" />

            <div className="h-72 rounded-[26px] bg-white" />

            <div className="h-72 rounded-[26px] bg-white" />

            <div className="h-64 rounded-[26px] bg-white" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f4f0] px-4 py-6 text-neutral-900 sm:px-6 sm:py-8 lg:px-10">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 35, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-white/80 blur-3xl"
        />

        <motion.div
          animate={{
            x: [0, -25, 0],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-neutral-200/60 blur-3xl"
        />
      </div>

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="relative mx-auto max-w-5xl"
      >
        {/* Header */}
        <div className="mb-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500 backdrop-blur-xl">
                <Settings size={12} />
                Account Settings
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Settings
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                Manage your notifications, preferences and account security.
              </p>
            </div>

            <div className="rounded-2xl border border-black/[0.06] bg-white/70 px-4 py-3 backdrop-blur-xl">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                Signed in as
              </p>

              <p className="mt-1 max-w-[260px] truncate text-sm font-bold text-neutral-900">
                {user?.email || "Account"}
              </p>
            </div>
          </div>
        </div>

        {/* Main settings */}
        <div className="space-y-5">
          {/* Notifications */}
          <Section
            icon={Bell}
            title="Notifications"
            description="Choose which updates you want to receive."
          >
            <SettingRow
              icon={Mail}
              title="Email notifications"
              description="Receive important account and store updates by email."
            >
              <Toggle
                enabled={settings.emailNotifications}
                onChange={(value) =>
                  updateSetting("emailNotifications", value)
                }
              />
            </SettingRow>

            <SettingRow
              icon={Check}
              title="Order updates"
              description="Get notified when your online order changes status."
            >
              <Toggle
                enabled={settings.orderNotifications}
                onChange={(value) =>
                  updateSetting("orderNotifications", value)
                }
              />
            </SettingRow>

            <SettingRow
              icon={Mail}
              title="Promotional emails"
              description="Receive new collection, offer and sale announcements."
            >
              <Toggle
                enabled={settings.promotionalNotifications}
                onChange={(value) =>
                  updateSetting("promotionalNotifications", value)
                }
              />
            </SettingRow>

            <SettingRow
              icon={Smartphone}
              title="Browser notifications"
              description="Allow Radha Outfit Collection to show browser notifications."
            >
              <Toggle
                enabled={settings.browserNotifications}
                onChange={(value) =>
                  updateSetting("browserNotifications", value)
                }
              />
            </SettingRow>
          </Section>

          {/* Appearance */}
          <Section
            icon={Sun}
            title="Appearance"
            description="Customize how your account dashboard looks."
          >
            <SettingRow
              icon={Moon}
              title="Dark mode"
              description="Use a darker appearance for the account dashboard."
            >
              <Toggle
                enabled={settings.darkMode}
                onChange={(value) => updateSetting("darkMode", value)}
              />
            </SettingRow>

            <SettingRow
              icon={Eye}
              title="Order progress"
              description="Show order progress and status information in your dashboard."
            >
              <Toggle
                enabled={settings.showOrderUpdates}
                onChange={(value) =>
                  updateSetting("showOrderUpdates", value)
                }
              />
            </SettingRow>
          </Section>

          {/* Security */}
          <Section
            icon={ShieldCheck}
            title="Security"
            description="Keep your account secure."
          >
            <SettingRow
              icon={Lock}
              title="Change password"
              description="Update your Supabase account password."
            >
              <span className="hidden sm:block text-[10px] font-semibold text-neutral-400">
                Secure
              </span>
            </SettingRow>

            <div className="border-t border-neutral-100 px-5 py-5 sm:px-6">
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.password}
                    onChange={(event) =>
                      setPasswordData((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="New password"
                    autoComplete="new-password"
                    className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 pr-12 text-sm outline-none transition focus:border-neutral-900 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(event) =>
                    setPasswordData((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition focus:border-neutral-900 focus:bg-white"
                />

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 text-xs font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </div>
          </Section>

          {/* Account */}
          <Section
            icon={Settings}
            title="Account"
            description="Manage your current account session."
          >
            <SettingRow
              icon={LogOut}
              title="Sign out"
              description="Sign out from your Radha Outfit Collection account."
            >
              <button
                type="button"
                disabled={saving}
                onClick={handleSignOut}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-xs font-bold text-neutral-900 transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <LogOut size={15} />
                )}

                Sign Out
              </button>
            </SettingRow>

            <SettingRow
              icon={Trash2}
              title="Delete account"
              description="Permanently delete your account. This action requires secure server-side verification."
              danger
            >
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-bold text-red-600 transition hover:bg-red-600 hover:text-white"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </SettingRow>
          </Section>

          {/* Status */}
          <AnimatePresence>
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-800"
              >
                <Check size={18} className="mt-0.5 shrink-0" />

                <div>
                  <p className="text-xs font-bold">
                    Account settings are active
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-emerald-700">
                    Your preferences are saved for this account on this
                    browser.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="pb-8 pt-2 text-center">
            <p className="text-[10px] font-medium text-neutral-400">
              Radha Outfit Collection · Account Settings
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}