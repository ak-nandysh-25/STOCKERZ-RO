import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, PageHeader } from "@/components/ui-kit";
import { fmtMoney, upper, waLink } from "@/lib/app-utils";
import { AlertTriangle, Package, ShoppingCart, TrendingUp, Wrench, MessageCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — STOCKERZ RO" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const monthStart = new Date(); monthStart.setDate(1);
      const monthStartStr = monthStart.toISOString().slice(0, 10);
      const in30 = new Date(); in30.setDate(in30.getDate() + 30);

      const [sales30, products, services, reminders, emis] = await Promise.all([
        supabase.from("sales").select("sale_date, qty, price").gte("sale_date", new Date(Date.now() - 30 * 86400000).toISOString().slice(0,10)),
        supabase.from("products").select("*"),
        supabase.from("services").select("*").order("service_date", { ascending: false }).limit(5),
        supabase.from("services").select("*").eq("is_filter_change", true).not("next_service_date", "is", null).lte("next_service_date", in30.toISOString().slice(0,10)).order("next_service_date"),
        supabase.from("emi_plans").select("*"),
      ]);

      const salesRows = sales30.data ?? [];
      const total = (rows: typeof salesRows) => rows.reduce((s, r) => s + Number(r.price) * Number(r.qty), 0);
      const todaySales = total(salesRows.filter(r => r.sale_date === today));
      const monthSales = total(salesRows.filter(r => r.sale_date >= monthStartStr));

      // daily buckets last 14 days
      const byDay: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0,10);
        byDay[d] = 0;
      }
      for (const r of salesRows) {
        if (byDay[r.sale_date] !== undefined) byDay[r.sale_date] += Number(r.price) * Number(r.qty);
      }
      const chart = Object.entries(byDay).map(([d, v]) => ({ d: d.slice(5), v }));

      const lowStock = (products.data ?? []).filter(p => p.qty <= p.low_stock_threshold);
      return {
        todaySales, monthSales,
        productCount: products.data?.length ?? 0,
        lowStock,
        chart,
        recentServices: services.data ?? [],
        reminders: reminders.data ?? [],
        emis: emis.data ?? [],
      };
    },
  });

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your shop performance" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={ShoppingCart} label="Today's Sales" value={fmtMoney(stats?.todaySales ?? 0)} accent="text-primary" />
        <Kpi icon={TrendingUp} label="Month Sales" value={fmtMoney(stats?.monthSales ?? 0)} accent="text-accent" />
        <Kpi icon={Package} label="Low Stock" value={String(stats?.lowStock.length ?? 0)} accent="text-warning" />
        <Kpi icon={Wrench} label="Reminders Due" value={String(stats?.reminders.length ?? 0)} accent="text-success" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sales — Last 14 days</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.chart ?? []}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="d" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-glass-border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="v" stroke="var(--color-primary)" strokeWidth={2} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-warning" /> Low Stock
          </h3>
          {stats?.lowStock.length ? (
            <ul className="space-y-2 text-sm">
              {stats.lowStock.map(p => (
                <li key={p.id} className="flex justify-between rounded-lg bg-white/5 px-3 py-2 uppercase-data">
                  <span>{p.model}</span>
                  <span className="text-warning">{p.qty}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">All stocked up</p>}
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Filter Reminders</h3>
            <Link to="/service" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {stats?.reminders.length ? (
            <ul className="space-y-2 text-sm">
              {stats.reminders.slice(0, 5).map(s => (
                <li key={s.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 uppercase-data">
                  <div>
                    <div className="font-medium">{s.customer_name}</div>
                    <div className="text-xs text-muted-foreground">Due {s.next_service_date}</div>
                  </div>
                  {s.phone && (
                    <a href={waLink(s.phone, `Hello ${upper(s.customer_name)}, your RO filter change is due on ${s.next_service_date}. Please book a service.`)} target="_blank" rel="noreferrer" className="rounded-lg bg-success/20 p-2 text-success hover:bg-success/30">
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">No reminders due in next 30 days</p>}
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent Services</h3>
          {stats?.recentServices.length ? (
            <ul className="space-y-2 text-sm">
              {stats.recentServices.map(s => (
                <li key={s.id} className="flex justify-between rounded-lg bg-white/5 px-3 py-2 uppercase-data">
                  <div>
                    <div className="font-medium">{s.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{s.service_type}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{s.service_date}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">No services yet</p>}
        </Card>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </motion.div>
  );
}
