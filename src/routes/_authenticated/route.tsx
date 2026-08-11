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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

    // OTP Auth session check
    if (typeof window !== "undefined") {
      const otpEmail = localStorage.getItem("stockerz_otp_user");
      if (otpEmail) {
        return { user: { id: "otp-user-" + btoa(otpEmail), email: otpEmail } };
      }
    }

    throw redirect({ to: "/auth" });
  },
  component: Shell,
});

const NAV_SECTIONS = [
  {
    title: "MAIN",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "BUSINESS",
    items: [
      { to: "/stock", label: "Stock", icon: Package },
      { to: "/sales", label: "Sales", icon: ShoppingCart },
      { to: "/customers", label: "Customers", icon: Contact },
      { to: "/service", label: "Service", icon: Wrench },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { to: "/technicians", label: "Technicians", icon: Users },
      { to: "/emi", label: "EMI Plans", icon: CreditCard },
    ],
  },
  {
    title: "ANALYTICS",
    items: [
      { to: "/reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      { to: "/settings", label: "Shop Profile", icon: Settings },
    ],
  },
] as const;

function Shell() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [confirmSignOutOpen, setConfirmSignOutOpen] = useState(false);

  // Load shop profile for active user (resolves by owner_id, email link, or auto-creation)
  const { data: shop } = useQuery({
    queryKey: ["shop"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let activeUser = user;

      if (!activeUser) {
        const { data: sessionData } = await supabase.auth.getSession();
        activeUser = sessionData?.session?.user ?? null;
      }

      let otpEmail: string | null = null;
      if (typeof window !== "undefined") {
        otpEmail = localStorage.getItem("stockerz_otp_user");
      }

      if (!activeUser && otpEmail) {
        activeUser = { id: "otp-user-" + btoa(otpEmail), email: otpEmail } as any;
      }

      if (!activeUser) return null;

      // 1. Check shop by owner_id
      const { data: existingShop } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", activeUser.id)
        .maybeSingle();

      if (existingShop) return existingShop;

      // 2. If not found by owner_id, check by email link
      const emailToSearch = activeUser.email || otpEmail;
      if (emailToSearch) {
        const { data: shopByEmail } = await supabase
          .from("shops")
          .select("*")
          .eq("email", emailToSearch)
          .maybeSingle();

        if (shopByEmail) {
          const { data: updatedShop } = await supabase
            .from("shops")
            .update({ owner_id: activeUser.id })
            .eq("id", shopByEmail.id)
            .select("*")
            .single();

          if (updatedShop) return updatedShop;
        }
      }

      // 3. Auto-upsert shop profile so valid logged-in users are never blocked
      const shopName = activeUser.user_metadata?.shop_name || "MY SHOP";
      const { data: newShop } = await supabase
        .from("shops")
        .upsert(
          {
            owner_id: activeUser.id,
            name: shopName,
            email: emailToSearch ?? null,
          },
          { onConflict: "owner_id" }
        )
        .select("*")
        .single();

      return newShop ?? null;
    },
  });

  async function signOut() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("stockerz_otp_user");
    }
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
    <div className="aurora-bg h-screen overflow-hidden flex flex-col lg:flex-row">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-glass-border bg-background/60 px-4 py-3 backdrop-blur lg:hidden shrink-0">
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

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 h-screen border-r border-glass-border bg-background/85 backdrop-blur-xl transition-[width,transform] duration-300 ease-in-out lg:translate-x-0 flex flex-col justify-between ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-20" : "lg:w-64"} w-64`}
      >
        {/* Brand Header & Collapse Toggle */}
        <div className={`hidden lg:flex items-center justify-between border-b border-glass-border/40 shrink-0 transition-all duration-300 ${
          collapsed ? "px-3 py-4 flex-col gap-3" : "px-5 py-5"
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            {shop?.logo_url ? (
              <img src={shop.logo_url} alt={shopTitle} className="h-9 w-9 shrink-0 rounded-lg object-cover border border-white/10" />
            ) : (
              <img src="/stockerz-logo.png" alt={shopTitle} className="h-9 w-9 shrink-0 rounded-lg object-contain border border-white/10" />
            )}
            {!collapsed && (
              <div className="min-w-0">
                <span className="font-bold tracking-tight truncate block text-sm uppercase-data">{shopTitle}</span>
                <span className="text-[10px] text-muted-foreground block truncate">RO Showroom OS</span>
              </div>
            )}
          </div>

          <div className={`flex items-center ${collapsed ? "flex-col gap-2" : "gap-1"}`}>
            {!collapsed && <ThemeToggle />}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition cursor-pointer"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 space-y-4 px-3 py-4 overflow-y-auto">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={section.title} className="space-y-1">
              {!collapsed ? (
                <div className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">
                  {section.title}
                </div>
              ) : (
                idx > 0 && <div className="my-2 border-t border-glass-border/30" />
              )}
              {section.items.map((n) => {
                const active = loc.pathname.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    title={collapsed ? n.label : undefined}
                    className={`group relative flex items-center gap-3 rounded-xl py-2.5 text-sm transition-all duration-150 ease-in-out cursor-pointer ${
                      collapsed ? "justify-center px-0" : "px-3"
                    } ${
                      active
                        ? "bg-primary/15 text-primary font-semibold shadow-[0_0_12px_rgba(59,130,246,0.2)] border-l-2 border-primary"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <n.icon
                      className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    />
                    {!collapsed && <span className="truncate">{n.label}</span>}

                    {/* Floating Tooltip when Collapsed */}
                    {collapsed && (
                      <span className="hidden lg:block absolute left-full ml-3 px-2.5 py-1 bg-popover border border-glass-border text-popover-foreground text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-50 whitespace-nowrap">
                        {n.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Account / Footer Area */}
        <div className="p-3 border-t border-glass-border/40 shrink-0">
          {!collapsed && (
            <div className="mb-2 px-3 py-1.5 rounded-lg bg-white/5 border border-glass-border/30">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Logged in User</div>
              <div className="text-xs font-semibold truncate text-foreground">{shop?.email || "User"}</div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center mb-2 lg:flex hidden">
              <ThemeToggle />
            </div>
          )}
          <button
            onClick={() => setConfirmSignOutOpen(true)}
            title={collapsed ? "Sign out" : undefined}
            className={`group relative flex w-full items-center gap-3 rounded-xl py-2.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150 ease-in-out cursor-pointer ${
              collapsed ? "justify-center px-0" : "px-3"
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110" />
            {!collapsed && <span className="font-medium">Sign out</span>}

            {/* Floating Tooltip when Collapsed */}
            {collapsed && (
              <span className="hidden lg:block absolute left-full ml-3 px-2.5 py-1 bg-popover border border-glass-border text-popover-foreground text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-50 whitespace-nowrap">
                Sign out
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main Content Area */}
      <main className={`flex-1 h-full lg:h-screen overflow-y-auto p-4 lg:p-8 min-w-0 transition-[margin] duration-300 ease-in-out ${
        collapsed ? "lg:ml-20" : "lg:ml-64"
      }`}>
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

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={confirmSignOutOpen} onOpenChange={setConfirmSignOutOpen}>
        <AlertDialogContent className="glass border-glass-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <LogOut className="h-5 w-5 text-destructive" />
              Sign Out Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to sign out of <strong className="text-foreground">{shopTitle}</strong>? You will need to sign back in to manage your showroom.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="glass hover:bg-white/10 text-foreground cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmSignOutOpen(false);
                signOut();
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold cursor-pointer"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
