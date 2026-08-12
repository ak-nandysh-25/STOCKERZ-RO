import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge, Card, PageHeader } from "@/components/ui-kit";
import { fmtMoney, upper, waLink, fmtDate } from "@/lib/app-utils";
import { AlertTriangle, Droplet, Package, ShoppingCart, TrendingUp, Wrench, MessageCircle, BarChart2, ArrowUpRight } from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — STOCKERZ RO" }] }),
  component: Dashboard,
});

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const salesVal = payload.find((p: any) => p.dataKey === "sales")?.value ?? 0;
  const officeVal = payload.find((p: any) => p.dataKey === "office")?.value ?? 0;
  const serviceVal = payload.find((p: any) => p.dataKey === "service")?.value ?? 0;

  return (
    <div className="rounded-2xl border border-glass-border bg-popover/95 p-4 shadow-2xl backdrop-blur-xl min-w-[170px] text-popover-foreground">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 pb-1 border-b border-border/40">{label}</div>
      <div className="space-y-2 text-xs font-medium">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0ea5e9]" />
            <span className="text-muted-foreground">Showroom Sales</span>
          </div>
          <span className="font-bold text-foreground">{fmtMoney(salesVal)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#06b6d4]" />
            <span className="text-muted-foreground">Office Sales</span>
          </div>
          <span className="font-bold text-foreground">{fmtMoney(officeVal)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
            <span className="text-muted-foreground">Service Revenue</span>
          </div>
          <span className="font-bold text-foreground">{fmtMoney(serviceVal)}</span>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { data: shop } = useQuery({
    queryKey: ["shop"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const todayStr = now.toISOString().slice(0, 10);
      const monthStartStr = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const in30 = new Date(); in30.setDate(in30.getDate() + 30);

      const [salesRes, productsRes, servicesRes, remindersRes, emisRes] = await Promise.all([
        supabase.from("sales").select("*"),
        supabase.from("products").select("*"),
        supabase.from("services").select("*, service_items(*)").order("service_date", { ascending: false }),
        supabase.from("services").select("*").eq("is_filter_change", true).not("next_service_date", "is", null).lte("next_service_date", in30.toISOString().slice(0, 10)).order("next_service_date"),
        supabase.from("emi_plans").select("*"),
      ]);

      const salesRows = salesRes.data ?? [];
      const productsRows = productsRes.data ?? [];
      const servicesRows = servicesRes.data ?? [];

      const totalSalesAmt = (rows: typeof salesRows) => rows.reduce((s, r) => s + Number(r.price || 0) * Number(r.qty || 1), 0);
      const todaySalesAmt = totalSalesAmt(salesRows.filter(r => r.sale_date === todayStr));
      const monthSalesAmt = totalSalesAmt(salesRows.filter(r => r.sale_date >= monthStartStr));

      // Build daily buckets 1..31 for current month
      const dailyMap: Record<number, { day: number; sales: number; office: number; service: number }> = {};
      for (let d = 1; d <= daysInMonth; d++) {
        dailyMap[d] = { day: d, sales: 0, office: 0, service: 0 };
      }

      salesRows.forEach(r => {
        if (!r.sale_date) return;
        const dObj = new Date(r.sale_date);
        if (dObj.getFullYear() === year && dObj.getMonth() === month) {
          const day = dObj.getDate();
          const amt = Number(r.price || 0) * Number(r.qty || 1);
          if (r.source === "office") {
            dailyMap[day].office += amt;
          } else {
            dailyMap[day].sales += amt;
          }
        }
      });

      servicesRows.forEach(s => {
        if (!s.service_date) return;
        const dObj = new Date(s.service_date);
        if (dObj.getFullYear() === year && dObj.getMonth() === month) {
          const day = dObj.getDate();
          const itemsTotal = (s.service_items ?? []).reduce((acc: number, item: any) => acc + Number(item.price || 0), 0);
          dailyMap[day].service += itemsTotal;
        }
      });

      const dailyRevenueChart = Object.values(dailyMap);

      // Today's transactions
      const todaySalesList = salesRows.filter(r => r.sale_date === todayStr).map(r => ({
        id: r.id,
        type: r.source === "office" ? "Office" : "Sales",
        name: r.product_name,
        customer: r.customer_name || "Direct Sale",
        amount: Number(r.price || 0) * Number(r.qty || 1),
      }));

      const todayServiceList = servicesRows.filter(s => s.service_date === todayStr).map(s => {
        const amt = (s.service_items ?? []).reduce((acc: number, item: any) => acc + Number(item.price || 0), 0);
        return {
          id: s.id,
          type: "Service",
          name: s.service_type || "Service",
          customer: s.customer_name,
          amount: amt,
        };
      });

      const todayTransactions = [...todaySalesList, ...todayServiceList];
      const lowStock = productsRows.filter(p => Number(p.qty) <= Number(p.low_stock_threshold ?? 2));

      return {
        todaySales: todaySalesAmt,
        monthSales: monthSalesAmt,
        productCount: productsRows.length,
        lowStock,
        dailyRevenueChart,
        todayTransactions,
        recentServices: servicesRows.slice(0, 5),
        reminders: remindersRes.data ?? [],
        emis: emisRes.data ?? [],
      };
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={shop?.name ? `${shop.name} Overview` : "Showroom Command Center"}
        description="Real-time analytics, daily revenue breakdown, and recurring filter service engine"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          icon={ShoppingCart}
          label="Today's Sales"
          value={fmtMoney(stats?.todaySales ?? 0)}
          color="from-blue-500/20 to-cyan-500/20 text-primary border-primary/30"
          badge="Live Today"
        />
        <Kpi
          icon={TrendingUp}
          label="Month Revenue"
          value={fmtMoney(stats?.monthSales ?? 0)}
          color="from-cyan-500/20 to-teal-500/20 text-accent border-accent/30"
          badge="Current Month"
        />
        <Kpi
          icon={Package}
          label="Low Stock Alerts"
          value={String(stats?.lowStock.length ?? 0)}
          color="from-amber-500/20 to-yellow-500/20 text-amber-500 dark:text-amber-400 border-amber-500/30"
          badge="Reorder Needed"
        />
        <Kpi
          icon={Wrench}
          label="Reminders Due"
          value={String(stats?.reminders.length ?? 0)}
          color="from-sky-500/20 to-cyan-500/20 text-cyan-500 dark:text-cyan-400 border-cyan-500/30"
          badge="30-Day Window"
        />
      </div>

      {/* Daily Revenue Chart */}
      <Card hover className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-primary">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground tracking-tight">Daily Revenue Trend</h3>
              <p className="text-xs text-muted-foreground">Stacked breakdown of Showroom Sales, Office Sales & Services</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#0ea5e9]" /> Showroom</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#06b6d4]" /> Office</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#38bdf8]" /> Service</span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.dailyRevenueChart ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 11 }} className="text-muted-foreground" interval={1} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 11 }} className="text-muted-foreground" />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "currentColor", opacity: 0.05 }} />
              <Bar dataKey="sales" name="Sales ₹" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} />
              <Bar dataKey="office" name="Office ₹" stackId="a" fill="#06b6d4" radius={[0, 0, 0, 0]} />
              <Bar dataKey="service" name="Service ₹" stackId="a" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Filter Reminders & Recent Services */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card hover className="p-6">
          <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Filter Reminders (30 Days)</h3>
            </div>
            <Link to="/service" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              View All <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {stats?.reminders.length ? (
            <ul className="space-y-2.5 text-sm">
              {stats.reminders.slice(0, 5).map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-xl glass p-3 uppercase-data border border-border/50 hover:border-primary/30 transition">
                  <div>
                    <div className="font-bold text-foreground">{s.customer_name}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">Due {fmtDate(s.next_service_date)}</div>
                  </div>
                  {s.phone && (
                    <a
                      href={waLink(s.phone, `Hello ${upper(s.customer_name)}, your RO filter change is due on ${fmtDate(s.next_service_date)}. Please book a service.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 px-3 py-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/25 transition cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground py-6 text-center">No filter replacement reminders due in next 30 days</p>}
        </Card>

        <Card hover className="p-6">
          <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Recent Service Calls</h3>
            </div>
            <Link to="/service" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              Manage Tickets <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {stats?.recentServices.length ? (
            <ul className="space-y-2.5 text-sm">
              {stats.recentServices.map((s) => (
                <li key={s.id} className="flex justify-between items-center rounded-xl glass p-3 uppercase-data border border-border/50 hover:border-primary/30 transition">
                  <div>
                    <div className="font-bold text-foreground">{s.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{s.service_type}</div>
                  </div>
                  <Badge variant="muted">{fmtDate(s.service_date)}</Badge>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground py-6 text-center">No service records logged yet</p>}
        </Card>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, color, badge }: { icon: any; label: string; value: string; color: string; badge?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="glass glass-hover group relative overflow-hidden rounded-2xl p-4 md:p-5 flex flex-col justify-between border border-glass-border shadow-xl shadow-black/5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={`widget-icon-box grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-r ${color} border shadow-md`}>
          <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl md:text-3xl font-black tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
          {value}
        </div>
        {badge && (
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{badge}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-ping" />
          </div>
        )}
      </div>
      <div className={`mt-3 h-1 w-full rounded-full bg-gradient-to-r ${color} opacity-70 group-hover:opacity-100 transition-opacity duration-300`} />
    </motion.div>
  );
}

