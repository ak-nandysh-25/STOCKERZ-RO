import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, PageHeader, Table, Td, Th } from "@/components/ui-kit";
import { fmtMoney } from "@/lib/app-utils";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const PALETTE = ["#38bdf8", "#a78bfa", "#f472b6", "#facc15", "#34d399", "#fb923c", "#60a5fa", "#f87171", "#2dd4bf", "#c084fc", "#4ade80", "#fbbf24"];

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — STOCKERZ RO" }] }),
  component: Page,
});

function Page() {
  const { data } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const [sales, services, products] = await Promise.all([
        supabase.from("sales").select("sale_date, price, qty, source"),
        supabase.from("services").select("service_date, total"),
        supabase.from("products").select("*"),
      ]);
      const salesRows = sales.data ?? [];

      const salesDaily: Record<string, number> = {};
      const salesMonthly: Record<string, number> = {};
      const officeDaily: Record<string, number> = {};
      const officeMonthly: Record<string, number> = {};
      for (const r of salesRows) {
        const total = Number(r.price) * Number(r.qty);
        const m = r.sale_date.slice(0, 7);
        if (r.source === "office") {
          officeDaily[r.sale_date] = (officeDaily[r.sale_date] ?? 0) + total;
          officeMonthly[m] = (officeMonthly[m] ?? 0) + total;
        } else {
          salesDaily[r.sale_date] = (salesDaily[r.sale_date] ?? 0) + total;
          salesMonthly[m] = (salesMonthly[m] ?? 0) + total;
        }
      }

      const serviceDaily: Record<string, number> = {};
      const serviceMonthly: Record<string, number> = {};
      for (const s of services.data ?? []) {
        serviceDaily[s.service_date] = (serviceDaily[s.service_date] ?? 0) + 1;
        serviceMonthly[s.service_date.slice(0, 7)] = (serviceMonthly[s.service_date.slice(0, 7)] ?? 0) + 1;
      }

      const days = (o: Record<string, number>) => Object.entries(o).sort().slice(-7).map(([d, v]) => ({ d: d.slice(5), v }));
      const months = (o: Record<string, number>) => Object.entries(o).sort().slice(-6).map(([m, v]) => ({ d: m, v }));

      return {
        salesDays: days(salesDaily),
        salesMonths: months(salesMonthly),
        serviceDays: days(serviceDaily),
        serviceMonths: months(serviceMonthly),
        officeDays: days(officeDaily),
        officeMonths: months(officeMonthly),
        products: products.data ?? [],
      };
    },
  });

  return (
    <div>
      <PageHeader title="Reports" description="Sales, service and office sales analytics" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Chart title="Sales — last 7 days" rows={data?.salesDays ?? []} offset={0} />
        <Chart title="Sales — monthly" rows={data?.salesMonths ?? []} offset={3} />
        <Chart title="Service — last 7 days" rows={data?.serviceDays ?? []} offset={4} />
        <Chart title="Service — monthly" rows={data?.serviceMonths ?? []} offset={6} />
        <Chart title="Office sales — last 7 days" rows={data?.officeDays ?? []} offset={2} />
        <Chart title="Office sales — monthly" rows={data?.officeMonths ?? []} offset={8} />
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

function Chart({ title, rows, offset }: { title: string; rows: { d: string; v: number }[]; offset: number }) {
  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="d" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
            <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-glass-border)" }} />
            <Bar dataKey="v" radius={[4, 4, 0, 0]}>
              {rows.map((_, i) => <Cell key={i} fill={PALETTE[(i + offset) % PALETTE.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
