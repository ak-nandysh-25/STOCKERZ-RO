import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, PageHeader } from "@/components/ui-kit";
import { fmtMoney, upper, waLink } from "@/lib/app-utils";
import { AlertTriangle, Droplet, Package, ShoppingCart, TrendingUp, Wrench, MessageCircle, BarChart2 } from "lucide-react";
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
    <div className="rounded-xl border border-white/10 bg-[#0e1017] p-3.5 shadow-2xl backdrop-blur-md min-w-[150px]">
      <div className="text-sm font-bold text-white mb-2">{label}</div>
      <div className="space-y-1.5 text-xs font-medium">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#8b5cf6]" />
            <span className="text-slate-300">Sales ₹</span>
          </div>
          <span className="font-semibold text-white">{salesVal.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#10b981]" />
            <span className="text-slate-300">Office ₹</span>
          </div>
          <span className="font-semibold text-white">{officeVal.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#f59e0b]" />
            <span className="text-slate-300">Service ₹</span>
          </div>
          <span className="font-semibold text-white">{serviceVal.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { data: shop } = useQuery({
    queryKey: ["shop"],
    queryFn: async () => {
      const { data } = await supabase.from("shops").select("*").maybeSingle();
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
    <div>
      <PageHeader title="Dashboard" description="Overview of your shop performance" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={ShoppingCart} label="Today's Sales" value={fmtMoney(stats?.todaySales ?? 0)} accent="text-primary" />
        <Kpi icon={TrendingUp} label="Month Sales" value={fmtMoney(stats?.monthSales ?? 0)} accent="text-accent" />
        <Kpi icon={Package} label="Low Stock" value={String(stats?.lowStock.length ?? 0)} accent="text-warning" />
        <Kpi icon={Wrench} label="Reminders Due" value={String(stats?.reminders.length ?? 0)} accent="text-success" />
      </div>

      {/* Daily Revenue Chart */}
      <div className="mt-6">
        <Card className="bg-[#0e1017] border-white/10 rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-purple-400" />
              <h3 className="text-base font-bold text-white tracking-wide">Daily Revenue</h3>
            </div>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.dailyRevenueChart ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tick={{ fill: "#64748b", fontSize: 11 }} interval={1} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.05)" }} />
                <Bar dataKey="sales" name="Sales ₹" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="office" name="Office ₹" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="service" name="Service ₹" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Filter Reminders & Recent Services */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="bg-[#0e1017] border-white/10 rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Filter Reminders</h3>
            <Link to="/service" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {stats?.reminders.length ? (
            <ul className="space-y-2 text-sm">
              {stats.reminders.slice(0, 5).map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 uppercase-data">
                  <div>
                    <div className="font-medium text-white">{s.customer_name}</div>
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

        <Card className="bg-[#0e1017] border-white/10 rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent Services</h3>
          {stats?.recentServices.length ? (
            <ul className="space-y-2 text-sm">
              {stats.recentServices.map((s) => (
                <li key={s.id} className="flex justify-between rounded-lg bg-white/5 px-3 py-2 uppercase-data">
                  <div>
                    <div className="font-medium text-white">{s.customer_name}</div>
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

