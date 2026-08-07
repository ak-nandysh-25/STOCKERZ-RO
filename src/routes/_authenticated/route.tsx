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
} from "lucide-react";
import { useState } from "react";
import { upper } from "@/lib/app-utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

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

  // Load shop profile for active user (must already exist)
  const { data: shop } = useQuery({
    queryKey: ["shop"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: existingShop } = await supabase.from("shops").select("*").maybeSingle();
      if (existingShop) return existingShop;

      // If shop account does not exist or was deleted, sign out immediately
      console.warn("No shop profile found for active user. Signing out.");
      await qc.cancelQueries();
      qc.clear();
      await supabase.auth.signOut();
      toast.error("Shop account not found or has been deleted. Sign in blocked.");
      nav({ to: "/auth", replace: true });
      return null;
    },
  });

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
            <img src="/stockerz-logo.png" alt={shopTitle} className="h-8 w-8 rounded-lg object-contain border border-white/10" />
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
                <img src="/stockerz-logo.png" alt={shopTitle} className="h-9 w-9 shrink-0 rounded-lg object-contain border border-white/10" />
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
              <Link
                to="/settings"
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:brightness-110 transition shadow-md"
              >
                Fill Shop Profile →
              </Link>
            </div>
          )}

          <Outlet />
        </main>
      </div>
    </div>
  );
}
