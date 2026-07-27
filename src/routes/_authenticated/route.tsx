import { createFileRoute, Link, Outlet, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Package, ShoppingCart, Wrench, Users, CreditCard, BarChart3, Settings, LogOut, Droplet, Menu, X, Contact,
} from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
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

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  return (
    <div className="aurora-bg min-h-screen">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-glass-border bg-background/60 px-4 py-3 backdrop-blur lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/20 text-primary"><Droplet className="h-4 w-4" /></div>
          <span className="font-bold">STOCKERZ RO</span>
        </Link>
        <button onClick={() => setOpen((v) => !v)} className="rounded p-1.5 glass">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-glass-border bg-background/80 backdrop-blur-xl transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="hidden items-center gap-2 px-6 py-6 lg:flex">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/20 text-primary"><Droplet className="h-5 w-5" /></div>
            <span className="font-bold tracking-tight">STOCKERZ RO</span>
          </div>
          <nav className="space-y-1 px-3 pb-4 pt-4 lg:pt-0">
            {NAV.map((n) => {
              const active = loc.pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
                >
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              );
            })}
            <button onClick={signOut} className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </aside>

        {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
