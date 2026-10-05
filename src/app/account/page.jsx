"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Heart,
  Home,
  LogOut,
  MapPin,
  Menu,
  Package,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  User,
  UserRound,
  X,
  Clock3,
  CheckCircle2,
  Truck,
  CreditCard,
  ShieldCheck,
  CircleAlert,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const menuItems = [
  {
    label: "Dashboard",
    href: "/account",
    icon: Home,
  },
  {
    label: "My Orders",
    href: "/account/orders",
    icon: Package,
  },
  {
    label: "Wishlist",
    href: "/account/wishlist",
    icon: Heart,
  },
  {
    label: "Addresses",
    href: "/account/addresses",
    icon: MapPin,
  },
  {
    label: "Profile",
    href: "/account/profile",
    icon: User,
  },
  {
    label: "Settings",
    href: "/account/settings",
    icon: Settings,
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getStatusIcon(status) {
  const value = String(status || "").toLowerCase();

  if (value === "delivered") {
    return CheckCircle2;
  }

  if (
    value === "shipped" ||
    value === "dispatched" ||
    value === "out_for_delivery"
  ) {
    return Truck;
  }

  if (value === "cancelled" || value === "failed") {
    return CircleAlert;
  }

  return Clock3;
}

function getStatusClass(status) {
  const value = String(status || "").toLowerCase();

  if (value === "delivered") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (
    value === "shipped" ||
    value === "dispatched" ||
    value === "out_for_delivery"
  ) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (value === "cancelled" || value === "failed") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (value === "processing") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-neutral-100 text-neutral-700 border-neutral-200";
}

function formatStatus(status) {
  if (!status) return "Placed";

  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";

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

function getOrderNumber(order) {
  return (
    order?.order_number ||
    order?.order_no ||
    order?.order_id ||
    order?.id ||
    "Order"
  );
}

function getOrderAmount(order) {
  const amount =
    order?.grand_total ??
    order?.total_amount ??
    order?.total ??
    order?.amount ??
    0;

  const numeric = Number(amount);

  return Number.isFinite(numeric) ? numeric : 0;
}

function getCustomerName(user, profile) {
  return (
    profile?.full_name ||
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")?.[0] ||
    "Customer"
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  index = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
        ease: "easeOut",
      }}
      whileHover={{
        y: -4,
      }}
      className="
        group
        rounded-[24px]
        border border-black/[0.07]
        bg-white/75
        p-5
        shadow-[0_15px_45px_rgba(0,0,0,0.05)]
        backdrop-blur-xl
        transition-shadow
        hover:shadow-[0_20px_55px_rgba(0,0,0,0.08)]
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-neutral-950">
            {value}
          </p>

          {description ? (
            <p className="mt-1 text-xs text-neutral-500">
              {description}
            </p>
          ) : null}
        </div>

        <div
          className="
            flex h-11 w-11 shrink-0 items-center justify-center
            rounded-2xl
            bg-neutral-950
            text-white
            transition-transform
            duration-300
            group-hover:rotate-3
            group-hover:scale-105
          "
        >
          <Icon size={19} strokeWidth={1.8} />
        </div>
      </div>
    </motion.div>
  );
}

function OrderRow({ order, index, onOpen }) {
  const status = formatStatus(order?.status);
  const StatusIcon = getStatusIcon(order?.status);

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(order)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
      }}
      whileHover={{
        y: -2,
      }}
      className="
        group
        w-full
        rounded-2xl
        border border-black/[0.06]
        bg-white
        p-4
        text-left
        transition-all
        hover:border-black/[0.12]
        hover:shadow-[0_12px_35px_rgba(0,0,0,0.06)]
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            flex h-11 w-11 shrink-0 items-center justify-center
            rounded-2xl
            bg-neutral-100
            text-neutral-800
          "
        >
          <ShoppingBag size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-bold text-neutral-950">
              #{getOrderNumber(order)}
            </p>

            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wider",
                getStatusClass(order?.status)
              )}
            >
              <StatusIcon size={11} />
              {status}
            </span>
          </div>

          <p className="mt-1 text-xs text-neutral-500">
            {formatDate(order?.created_at)}
          </p>
        </div>

        <div className="hidden text-right sm:block">
          <p className="text-sm font-black text-neutral-950">
            {currency.format(getOrderAmount(order))}
          </p>

          <p className="mt-1 text-[10px] text-neutral-400">
            View order
          </p>
        </div>

        <ChevronRight
          size={17}
          className="
            shrink-0
            text-neutral-300
            transition-transform
            group-hover:translate-x-1
            group-hover:text-neutral-800
          "
        />
      </div>

      <div className="mt-3 flex items-center justify-between sm:hidden">
        <span className="text-[10px] text-neutral-400">
          {formatDate(order?.created_at)}
        </span>

        <span className="text-sm font-black text-neutral-950">
          {currency.format(getOrderAmount(order))}
        </span>
      </div>
    </motion.button>
  );
}

function QuickAction({ icon: Icon, title, description, href, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick || (() => {})}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className="
        group
        rounded-[22px]
        border border-black/[0.06]
        bg-white/80
        p-4
        text-left
        shadow-sm
        transition-all
        hover:border-black/[0.12]
        hover:shadow-lg
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            flex h-10 w-10 shrink-0 items-center justify-center
            rounded-xl
            bg-neutral-950
            text-white
            transition-transform
            group-hover:rotate-3
          "
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-neutral-950">
            {title}
          </p>

          <p className="mt-0.5 truncate text-[11px] text-neutral-500">
            {description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function AccountSidebar({
  user,
  profile,
  activePath,
  onNavigate,
  onLogout,
  mobileOpen,
  setMobileOpen,
}) {
  const customerName = getCustomerName(user, profile);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="
              fixed inset-0 z-40
              bg-black/30
              backdrop-blur-sm
              lg:hidden
            "
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 28,
            }}
            className="
              fixed inset-y-0 left-0 z-50
              flex w-[290px] flex-col
              border-r border-black/[0.07]
              bg-[#f8f7f3]/95
              p-5
              shadow-2xl
              backdrop-blur-2xl
              lg:hidden
            "
          >
            <SidebarContent
              customerName={customerName}
              user={user}
              activePath={activePath}
              onNavigate={onNavigate}
              onLogout={onLogout}
              closeMobile={() => setMobileOpen(false)}
              mobile
            />
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <aside
        className="
          fixed inset-y-0 left-0 z-30
          hidden w-[260px]
          border-r border-black/[0.07]
          bg-[#f8f7f3]/90
          p-5
          backdrop-blur-2xl
          lg:block
        "
      >
        <SidebarContent
          customerName={customerName}
          user={user}
          activePath={activePath}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
      </aside>
    </>
  );
}

function SidebarContent({
  customerName,
  user,
  activePath,
  onNavigate,
  onLogout,
  closeMobile,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate("/")}
          className="flex items-center gap-3"
        >
          <div
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl
              bg-neutral-950
              text-sm font-black
              text-white
            "
          >
            R
          </div>

          <div className="text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-400">
              Radha
            </p>

            <p className="text-xs font-black text-neutral-950">
              Outfit Collection
            </p>
          </div>
        </button>

        {closeMobile ? (
          <button
            type="button"
            onClick={closeMobile}
            className="
              rounded-xl p-2
              text-neutral-500
              hover:bg-black/5
              hover:text-neutral-950
            "
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      <div className="my-6 h-px bg-black/[0.06]" />

      <div className="mb-6 rounded-2xl bg-neutral-950 p-4 text-white">
        <div className="flex items-center gap-3">
          <div
            className="
              flex h-10 w-10 shrink-0 items-center justify-center
              rounded-xl
              bg-white/10
              text-sm font-black
            "
          >
            {customerName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              {customerName}
            </p>

            <p className="mt-0.5 truncate text-[10px] text-white/50">
              {user?.email || "Customer account"}
            </p>
          </div>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto pr-1">
        <p className="mb-2 px-2 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
          Account
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const active =
              activePath === item.href ||
              (item.href !== "/account" &&
                activePath.startsWith(item.href));

            return (
              <button
                key={item.href}
                type="button"
                onClick={() => {
                  onNavigate(item.href);
                  closeMobile?.();
                }}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all",
                  active
                    ? "bg-neutral-950 text-white shadow-lg"
                    : "text-neutral-600 hover:bg-black/[0.045] hover:text-neutral-950"
                )}
              >
                <Icon
                  size={17}
                  strokeWidth={active ? 2.3 : 1.8}
                />

                <span className="text-xs font-semibold">
                  {item.label}
                </span>

                {active ? (
                  <motion.div
                    layoutId="account-active"
                    className="
                      absolute right-2
                      h-1.5 w-1.5
                      rounded-full
                      bg-white
                    "
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="my-6 h-px bg-black/[0.06]" />

        <p className="mb-2 px-2 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
          Store
        </p>

        <button
          type="button"
          onClick={() => {
            onNavigate("/shop");
            closeMobile?.();
          }}
          className="
            flex w-full items-center gap-3
            rounded-xl px-3 py-3
            text-left text-neutral-600
            transition-colors
            hover:bg-black/[0.045]
            hover:text-neutral-950
          "
        >
          <ShoppingBag size={17} />
          <span className="text-xs font-semibold">
            Continue Shopping
          </span>
        </button>
      </nav>

      <div className="mt-4 border-t border-black/[0.06] pt-4">
        <button
          type="button"
          onClick={onLogout}
          className="
            flex w-full items-center gap-3
            rounded-xl px-3 py-3
            text-left text-red-600
            transition-colors
            hover:bg-red-50
          "
        >
          <LogOut size={17} />
          <span className="text-xs font-semibold">
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#f5f4f0] p-5 lg:pl-[285px]">
      <div className="mx-auto max-w-[1500px]">
        <div className="animate-pulse">
          <div className="h-6 w-32 rounded bg-black/5" />
          <div className="mt-4 h-12 w-72 rounded bg-black/5" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 rounded-[24px] bg-black/5"
              />
            ))}
          </div>

          <div className="mt-8 h-80 rounded-[28px] bg-black/5" />
        </div>
      </div>
    </div>
  );
}

export default function AccountDashboard() {
  const router = useRouter();

  const [supabase] = useState(() => createClient());

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [orders, setOrders] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [addressCount, setAddressCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [mobileMenu, setMobileMenu] = useState(false);

  const activePath = "/account";

  const loadDashboard = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!currentUser) {
          router.replace("/login?redirect=/account");
          return;
        }

        setUser(currentUser);

        const [
          profileResult,
          ordersResult,
          wishlistResult,
          addressesResult,
        ] = await Promise.all([
          supabase
            .from("users")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle(),

          supabase
            .from("orders")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("created_at", {
              ascending: false,
            })
            .limit(5),

          supabase
            .from("wishlist_items")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq("user_id", currentUser.id),

          supabase
            .from("addresses")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq("user_id", currentUser.id),
        ]);

        if (profileResult.error) {
          console.warn(
            "Profile query warning:",
            profileResult.error
          );
        }

        if (ordersResult.error) {
          console.warn(
            "Orders query warning:",
            ordersResult.error
          );
        }

        if (wishlistResult.error) {
          console.warn(
            "Wishlist query warning:",
            wishlistResult.error
          );
        }

        if (addressesResult.error) {
          console.warn(
            "Addresses query warning:",
            addressesResult.error
          );
        }

        setProfile(profileResult.data || null);
        setOrders(ordersResult.data || []);
        setWishlistCount(wishlistResult.count || 0);
        setAddressCount(addressesResult.count || 0);
      } catch (err) {
        console.error("Account dashboard error:", err);

        setError(
          err?.message ||
            "Unable to load your account dashboard."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router, supabase]
  );

  useEffect(() => {
    loadDashboard();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.replace("/login");
        return;
      }

      if (session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadDashboard, router, supabase]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;

    const pendingOrders = orders.filter((order) => {
      const status = String(order?.status || "").toLowerCase();

      return [
        "pending",
        "placed",
        "processing",
        "confirmed",
      ].includes(status);
    }).length;

    const totalSpent = orders.reduce(
      (sum, order) => sum + getOrderAmount(order),
      0
    );

    return {
      totalOrders,
      pendingOrders,
      totalSpent,
      wishlistCount,
    };
  }, [orders, wishlistCount]);

  const handleNavigate = useCallback(
    (href) => {
      router.push(href);
    },
    [router]
  );

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, [router, supabase]);

  const handleOpenOrder = useCallback(
    (order) => {
      const id = order?.id;

      if (!id) return;

      router.push(
        `/account/orders/${encodeURIComponent(id)}`
      );
    },
    [router]
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-[#f5f4f0] text-neutral-950">
      <AccountSidebar
        user={user}
        profile={profile}
        activePath={activePath}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        mobileOpen={mobileMenu}
        setMobileOpen={setMobileMenu}
      />

      {/* Mobile header */}
      <header
        className="
          sticky top-0 z-30
          border-b border-black/[0.06]
          bg-[#f5f4f0]/85
          px-4 py-3
          backdrop-blur-xl
          lg:hidden
        "
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileMenu(true)}
            aria-label="Open account menu"
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl
              border border-black/[0.07]
              bg-white/70
            "
          >
            <Menu size={19} />
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2"
          >
            <div
              className="
                flex h-8 w-8 items-center justify-center
                rounded-lg
                bg-neutral-950
                text-xs font-black
                text-white
              "
            >
              R
            </div>

            <span className="text-xs font-black tracking-tight">
              RADHA OUTFIT
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/cart")}
            aria-label="Cart"
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl
              border border-black/[0.07]
              bg-white/70
            "
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </header>

      <main className="lg:pl-[260px]">
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="
              flex
              flex-col
              gap-5
              md:flex-row
              md:items-end
              md:justify-between
            "
          >
            <div>
              <div className="flex items-center gap-2">
                <Sparkles
                  size={14}
                  className="text-neutral-500"
                />

                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-400">
                  My Account
                </p>
              </div>

              <h1
                className="
                  mt-2
                  text-3xl
                  font-black
                  tracking-[-0.04em]
                  text-neutral-950
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                Welcome back,{" "}
                <span className="text-neutral-400">
                  {getCustomerName(user, profile)}
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
                Manage your orders, wishlist, addresses and
                personal account from one place.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
                className="
                  flex h-11 items-center gap-2
                  rounded-xl
                  border border-black/[0.08]
                  bg-white/80
                  px-4
                  text-xs font-bold
                  text-neutral-800
                  transition-all
                  hover:bg-white
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <RefreshCw
                  size={15}
                  className={cn(
                    refreshing && "animate-spin"
                  )}
                />

                Refresh
              </button>

              <button
                type="button"
                onClick={() => router.push("/shop")}
                className="
                  hidden h-11 items-center gap-2
                  rounded-xl
                  bg-neutral-950
                  px-5
                  text-xs font-bold
                  text-white
                  transition-transform
                  hover:scale-[1.02]
                  sm:flex
                "
              >
                Shop Now
                <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>

          {/* Error */}
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="
                mt-6
                flex items-start gap-3
                rounded-2xl
                border border-red-200
                bg-red-50
                p-4
                text-red-700
              "
            >
              <CircleAlert
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="text-sm font-bold">
                  Unable to load some account data
                </p>

                <p className="mt-1 text-xs">
                  {error}
                </p>
              </div>
            </motion.div>
          ) : null}

          {/* Stats */}
          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              index={0}
              icon={Package}
              label="Orders"
              value={stats.totalOrders}
              description="Recent orders"
            />

            <StatCard
              index={1}
              icon={Clock3}
              label="In Progress"
              value={stats.pendingOrders}
              description="Orders being processed"
            />

            <StatCard
              index={2}
              icon={CreditCard}
              label="Recent Spend"
              value={currency.format(stats.totalSpent)}
              description="From loaded orders"
            />

            <StatCard
              index={3}
              icon={Heart}
              label="Wishlist"
              value={stats.wishlistCount}
              description="Saved products"
            />
          </section>

          {/* Main grid */}
          <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            {/* Orders */}
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: 0.25,
              }}
              className="
                rounded-[28px]
                border border-black/[0.07]
                bg-white/75
                p-5
                shadow-[0_15px_50px_rgba(0,0,0,0.045)]
                backdrop-blur-xl
                sm:p-6
              "
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
                    Shopping activity
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    Recent Orders
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/account/orders")
                  }
                  className="
                    flex items-center gap-1
                    text-xs font-bold
                    text-neutral-500
                    hover:text-neutral-950
                  "
                >
                  View all
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <OrderRow
                      key={order?.id || `order-${index}`}
                      order={order}
                      index={index}
                      onOpen={handleOpenOrder}
                    />
                  ))
                ) : (
                  <div
                    className="
                      rounded-2xl
                      border border-dashed
                      border-black/[0.1]
                      bg-neutral-50
                      px-5 py-12
                      text-center
                    "
                  >
                    <div
                      className="
                        mx-auto
                        flex h-14 w-14
                        items-center justify-center
                        rounded-2xl
                        bg-white
                        shadow-sm
                      "
                    >
                      <ShoppingBag
                        size={22}
                        className="text-neutral-400"
                      />
                    </div>

                    <h3 className="mt-4 text-sm font-black">
                      No orders yet
                    </h3>

                    <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-neutral-500">
                      Your recent purchases will appear
                      here once you place your first order.
                    </p>

                    <button
                      type="button"
                      onClick={() => router.push("/shop")}
                      className="
                        mt-5
                        inline-flex items-center gap-2
                        rounded-xl
                        bg-neutral-950
                        px-4 py-2.5
                        text-xs font-bold
                        text-white
                      "
                    >
                      Start Shopping
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Profile / account */}
            <div className="space-y-6">
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.3,
                }}
                className="
                  overflow-hidden
                  rounded-[28px]
                  bg-neutral-950
                  p-6
                  text-white
                  shadow-[0_20px_60px_rgba(0,0,0,0.12)]
                "
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                      Account
                    </p>

                    <h2 className="mt-2 text-xl font-black">
                      Your Profile
                    </h2>
                  </div>

                  <div
                    className="
                      flex h-11 w-11
                      items-center justify-center
                      rounded-2xl
                      bg-white/10
                    "
                  >
                    <UserRound size={19} />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/35">
                      Name
                    </p>

                    <p className="mt-1 truncate text-sm font-bold">
                      {getCustomerName(user, profile)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/35">
                      Email
                    </p>

                    <p className="mt-1 truncate text-sm font-bold">
                      {user?.email || "Not provided"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/account/profile")
                  }
                  className="
                    mt-6
                    flex w-full
                    items-center justify-between
                    rounded-xl
                    border border-white/10
                    bg-white/5
                    px-4 py-3
                    text-xs font-bold
                    transition-colors
                    hover:bg-white/10
                  "
                >
                  Edit Profile
                  <ArrowRight size={14} />
                </button>
              </motion.section>

              {/* Security */}
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.35,
                }}
                className="
                  rounded-[28px]
                  border border-black/[0.07]
                  bg-white/75
                  p-5
                  shadow-sm
                  backdrop-blur-xl
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex h-10 w-10
                      items-center justify-center
                      rounded-xl
                      bg-emerald-50
                      text-emerald-700
                    "
                  >
                    <ShieldCheck size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-black">
                      Account Secure
                    </h3>

                    <p className="mt-0.5 text-[10px] text-neutral-500">
                      Your account is protected by Supabase
                      authentication.
                    </p>
                  </div>
                </div>
              </motion.section>
            </div>
          </section>

          {/* Quick actions */}
          <section className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: 0.4,
              }}
            >
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
                Shortcuts
              </p>

              <h2 className="mt-1 text-xl font-black">
                Quick Actions
              </h2>
            </motion.div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <QuickAction
                icon={ShoppingBag}
                title="Continue Shopping"
                description="Explore latest collections"
                onClick={() => router.push("/shop")}
              />

              <QuickAction
                icon={Heart}
                title="My Wishlist"
                description={`${wishlistCount} saved products`}
                onClick={() =>
                  router.push("/account/wishlist")
                }
              />

              <QuickAction
                icon={MapPin}
                title="My Addresses"
                description={`${addressCount} saved addresses`}
                onClick={() =>
                  router.push("/account/addresses")
                }
              />

              <QuickAction
                icon={Settings}
                title="Account Settings"
                description="Manage your preferences"
                onClick={() =>
                  router.push("/account/settings")
                }
              />
            </div>
          </section>

          {/* Mobile shop button */}
          <div className="mt-6 sm:hidden">
            <button
              type="button"
              onClick={() => router.push("/shop")}
              className="
                flex h-12 w-full
                items-center justify-center gap-2
                rounded-2xl
                bg-neutral-950
                text-sm font-bold
                text-white
              "
            >
              Continue Shopping
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav
        className="
          fixed bottom-0 left-0 right-0 z-30
          border-t border-black/[0.07]
          bg-[#f8f7f3]/90
          px-3 py-2
          backdrop-blur-xl
          lg:hidden
        "
      >
        <div className="mx-auto flex max-w-lg items-center justify-around">
          <MobileNavButton
            icon={Home}
            label="Home"
            active
            onClick={() => router.push("/account")}
          />

          <MobileNavButton
            icon={Package}
            label="Orders"
            onClick={() =>
              router.push("/account/orders")
            }
          />

          <MobileNavButton
            icon={Heart}
            label="Wishlist"
            onClick={() =>
              router.push("/account/wishlist")
            }
          />

          <MobileNavButton
            icon={User}
            label="Profile"
            onClick={() =>
              router.push("/account/profile")
            }
          />
        </div>
      </nav>
    </div>
  );
}

function MobileNavButton({
  icon: Icon,
  label,
  active = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-[62px] flex-col items-center gap-1 rounded-xl px-3 py-2",
        active
          ? "text-neutral-950"
          : "text-neutral-400"
      )}
    >
      <Icon size={17} />

      <span className="text-[9px] font-bold">
        {label}
      </span>
    </button>
  );
}