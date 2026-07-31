import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, PageHeader, Table, Td, Th } from "@/components/ui-kit";
import { fmtMoney } from "@/lib/app-utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — STOCKERZ RO" }] }),
  component: Page,
});

function Page() {
  const { data } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const [sales, services, products] = await Promise.all([
        supabase.from("sales").select("sale_date, price, qty"),
        supabase.from("services").select("service_date"),
        supabase.from("products").select("*"),
      ]);
      const salesRows = sales.data ?? [];
      const daily: Record<string, number> = {};
      const monthly: Record<string, number> = {};
      for (const r of salesRows) {
        const total = Number(r.price) * Number(r.qty);
        daily[r.sale_date] = (daily[r.sale_date] ?? 0) + total;
        const m = r.sale_date.slice(0, 7);
        monthly[m] = (monthly[m] ?? 0) + total;
      }
      const serviceDaily: Record<string, number> = {};
      const serviceMonthly: Record<string, number> = {};
      for (const s of services.data ?? []) {
        serviceDaily[s.service_date] = (serviceDaily[s.service_date] ?? 0) + 1;
        serviceMonthly[s.service_date.slice(0, 7)] = (serviceMonthly[s.service_date.slice(0, 7)] ?? 0) + 1;
      }
      const lastDays = Object.entries(daily).sort().slice(-7).map(([d, v]) => ({ d: d.slice(5), v }));
      const lastMonths = Object.entries(monthly).sort().slice(-6).map(([m, v]) => ({ m, v }));
      const serviceMonths = Object.entries(serviceMonthly).sort().slice(-6).map(([m, v]) => ({ m, v }));
      return { lastDays, lastMonths, serviceMonths, products: products.data ?? [] };
    },
  });

  return (
    <div>
      <PageHeader title="Reports" description="Sales, service and stock analytics" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Daily sales (last 7 days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.lastDays ?? []}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="d" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-glass-border)" }} />
                <Bar dataKey="v" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Monthly sales</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.lastMonths ?? []}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="m" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-glass-border)" }} />
                <Bar dataKey="v" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Monthly services</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.serviceMonths ?? []}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="m" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-glass-border)" }} />
                <Bar dataKey="v" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <h3 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Remaining stock</h3>
      <Table>
        <thead><tr><Th>Model</Th><Th>Category</Th><Th>Type</Th><Th>Qty</Th><Th>Price</Th><Th>Value</Th></tr></thead>
        <tbody>
          {(data?.products ?? []).map((p: any) => (
            <tr key={p.id} className="hover:bg-white/5">
              <Td className="font-medium">{p.model}</Td>
              <Td>{p.category}</Td>
              <Td>{p.product_type ?? "—"}</Td>
              <Td>{p.qty}</Td>
              <Td>{fmtMoney(p.price)}</Td>
              <Td>{fmtMoney(Number(p.price) * Number(p.qty))}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
