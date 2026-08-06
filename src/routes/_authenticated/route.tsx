import { createFileRoute, Link, Outlet, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wrench,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Droplet,
  Menu,
  X,
  Contact,
  AlertCircle,
  Sparkles,
  Loader2,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { upper } from "@/lib/app-utils";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // If URL has OAuth callback hash or query code, give Supabase SDK time to process session
    if (typeof window !== "undefined") {
      const hasHash = window.location.hash.includes("access_token");
      const hasCode = window.location.search.includes("code=");
      if (hasHash || hasCode) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          return { user: sessionData.session.user };
        }
      }
    }

    const { data } = await supabase.auth.getUser();
    if (data?.user) return { user: data.user };

    // Fallback check for active session
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user) {
      return { user: sessionData.session.user };
    }

    throw redirect({ to: "/auth" });
  },
  component: Shell,
});

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/stock", label: "Stock", icon: Package },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/service", label: "Service", icon: Wrench },
  { to: "/customers", label: "Customers", icon: Contact },
  { to: "/technicians", label: "Technicians", icon: Users },
  { to: "/emi", label: "EMI Plans", icon: CreditCard },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Shop Profile", icon: Settings },
] as const;

function Shell() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState({ name: "", contact: "", gst: "", address: "" });
  const [onboardingSaving, setOnboardingSaving] = useState(false);

  // Load shop profile for active user (auto-creating if missing, e.g. for Google OAuth)
  const { data: shop } = useQuery({
    queryKey: ["shop"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Check for draft shop details saved before Google OAuth redirect
      const pendingRaw = localStorage.getItem("stockerz_pending_shop");
      if (pendingRaw) {
        try {
          const pending = JSON.parse(pendingRaw);
          localStorage.removeItem("stockerz_pending_shop");
          if (pending && (pending.name || pending.contact || pending.address)) {
            const { data: updatedShop } = await supabase
              .from("shops")
              .upsert(
                {
                  owner_id: user.id,
                  name: pending.name?.toUpperCase() || (user.user_metadata?.full_name ? `${user.user_metadata.full_name.toUpperCase()}'S SHOP` : "MY SHOP"),
                  contact: pending.contact || null,
                  email: user.email ?? null,
                  gst: pending.gst?.toUpperCase() || null,
                  address: pending.address?.toUpperCase() || null,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "owner_id" }
              )
              .select("*")
              .maybeSingle();
            if (updatedShop) return updatedShop;
          }
        } catch (e) {
          console.warn("Failed to apply pending shop from Google OAuth:", e);
        }
      }

      const { data: existingShop } = await supabase.from("shops").select("*").maybeSingle();
      if (existingShop) return existingShop;

      // Auto-create shop if missing for this user
      const defaultName = user.user_metadata?.full_name
        ? `${user.user_metadata.full_name.toUpperCase()}'S SHOP`
        : "MY SHOP";

      const { data: newShop, error } = await supabase
        .from("shops")
        .insert({
          owner_id: user.id,
          name: defaultName,
          email: user.email ?? null,
        })
        .select("*")
        .maybeSingle();

      if (error) {
        console.warn("Auto shop creation notice:", error.message);
        const { data: retryShop } = await supabase.from("shops").select("*").maybeSingle();
        return retryShop;
      }
      return newShop;
    },
  });

  // Sync state & check if onboarding modal should open automatically
  useEffect(() => {
    if (shop) {
      setOnboardingData({
        name: shop.name && shop.name !== "MY SHOP" ? shop.name : "",
        contact: shop.contact ?? "",
        gst: shop.gst ?? "",
        address: shop.address ?? "",
      });

      const isProfileIncomplete =
        !shop.name ||
        shop.name.toUpperCase() === "MY SHOP" ||
        !shop.contact ||
        !shop.address;

      const dismissedKey = `stockerz_onboarding_dismissed_${shop.id}`;
      const hasDismissed = localStorage.getItem(dismissedKey);

      if (isProfileIncomplete && !hasDismissed) {
        setShowOnboarding(true);
      }
    }
  }, [shop]);

  async function handleSaveOnboarding(e: React.FormEvent) {
    e.preventDefault();
    setOnboardingSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const payload = {
        owner_id: user.id,
        name: onboardingData.name.toUpperCase() || "MY SHOP",
        contact: onboardingData.contact || null,
        email: user.email ?? null,
        gst: onboardingData.gst.toUpperCase() || null,
        address: onboardingData.address.toUpperCase() || null,
        updated_at: new Date().toISOString(),
      };

      if (shop?.id) {
        const { error } = await supabase.from("shops").update(payload).eq("id", shop.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("shops").upsert(payload, { onConflict: "owner_id" });
        if (error) throw error;
      }

      toast.success("Shop profile updated successfully!");
      setShowOnboarding(false);
      qc.invalidateQueries({ queryKey: ["shop"] });
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update shop details");
    } finally {
      setOnboardingSaving(false);
    }
  }

  function handleDismissOnboarding() {
    if (shop?.id) {
      localStorage.setItem(`stockerz_onboarding_dismissed_${shop.id}`, "true");
    }
    setShowOnboarding(false);
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  // Check if shop profile requires setup
  const isIncomplete =
    !shop ||
    !shop.name ||
    shop.name.toUpperCase() === "MY SHOP" ||
    !shop.contact ||
    !shop.address;

  const shopTitle = shop?.name ? upper(shop.name) : "MY SHOP";

  return (
    <div className="aurora-bg min-h-screen">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-glass-border bg-background/60 px-4 py-3 backdrop-blur lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
          {shop?.logo_url ? (
            <img src={shop.logo_url} alt={shopTitle} className="h-8 w-8 rounded-lg object-cover border border-white/10" />
          ) : (
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/20 text-primary">
              <Droplet className="h-4 w-4" />
            </div>
          )}
          <span className="font-bold truncate text-sm uppercase-data">{shopTitle}</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setOpen((v) => !v)} className="rounded p-1.5 glass">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-glass-border bg-background/80 backdrop-blur-xl transition-transform lg:static lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="hidden items-center justify-between px-6 py-6 lg:flex min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              {shop?.logo_url ? (
                <img src={shop.logo_url} alt={shopTitle} className="h-9 w-9 shrink-0 rounded-lg object-cover border border-white/10" />
              ) : (
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/20 text-primary">
                  <Droplet className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0">
                <span className="font-bold tracking-tight truncate block text-sm uppercase-data">{shopTitle}</span>
                <span className="text-[10px] text-muted-foreground block truncate">RO Showroom OS</span>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <nav className="space-y-1 px-3 pb-4 pt-4 lg:pt-0">
            {NAV.map((n) => {
              const active = loc.pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    active ? "bg-primary/15 text-primary font-semibold" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              );
            })}
            <button
              onClick={signOut}
              className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </aside>

        {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}

        <main className="flex-1 p-4 lg:p-8 min-w-0">
          {/* Complete Profile Alert Banner */}
          {isIncomplete && !loc.pathname.includes("/settings") && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
                <div className="text-xs">
                  <p className="font-bold text-sm">Complete Your Shop Profile</p>
                  <p className="text-muted-foreground mt-0.5">
                    Add your business name, contact phone, logo, and GSTIN so your printed invoices display your showroom details.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOnboarding(true)}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:brightness-110 transition shadow-md"
              >
                Fill Shop Profile →
              </button>
            </div>
          )}

          <Outlet />
        </main>
      </div>

      {/* Onboarding / Shop Setup Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20 relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/20 text-primary">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-snug">Welcome to STOCKERZ RO!</h3>
                  <p className="text-xs text-muted-foreground">Set up your RO Showroom profile to get started</p>
                </div>
              </div>
              <button
                onClick={handleDismissOnboarding}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOnboarding} className="mt-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Showroom / Shop Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={onboardingData.name}
                  onChange={(e) => setOnboardingData({ ...onboardingData, name: e.target.value })}
                  placeholder="e.g. AQUA PURE RO SALES & SERVICE"
                  className="w-full rounded-xl bg-input px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary uppercase-data border border-white/10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Contact Number <span className="text-primary">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={onboardingData.contact}
                    onChange={(e) => setOnboardingData({ ...onboardingData, contact: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl bg-input px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary border border-white/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={onboardingData.gst}
                    onChange={(e) => setOnboardingData({ ...onboardingData, gst: e.target.value })}
                    placeholder="33AAAAA0000A1Z5"
                    className="w-full rounded-xl bg-input px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary uppercase-data border border-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Showroom Address <span className="text-primary">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={onboardingData.address}
                  onChange={(e) => setOnboardingData({ ...onboardingData, address: e.target.value })}
                  placeholder="Full showroom address for printed invoices..."
                  className="w-full rounded-xl bg-input px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary uppercase-data border border-white/10"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleDismissOnboarding}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-white/5 transition"
                >
                  I'll do this later
                </button>
                <button
                  type="submit"
                  disabled={onboardingSaving}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 disabled:opacity-60 transition"
                >
                  {onboardingSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span>Save & Launch Showroom</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

