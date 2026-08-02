import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, Empty, Input, PageHeader, Table, Td, Th } from "@/components/ui-kit";
import { fmtMoney, upper } from "@/lib/app-utils";
import { LogOut, Search, ShieldCheck, Store } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "All shops — STOCKERZ RO Admin" },
      { name: "description", content: "Admin overview of every shop registered on STOCKERZ RO with sales and service totals." },
      { property: "og:title", content: "All shops — STOCKERZ RO Admin" },
      { property: "og:description", content: "Admin overview of every shop registered on STOCKERZ RO with sales and service totals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin-login" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    if (!isAdmin) throw redirect({ to: "/admin-login" });
    return { user: data.user };
  },
  component: AdminShops,
});

function AdminShops() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-shops"],
    queryFn: async () => {
      const [shops, sales, services, serviceItems, products] = await Promise.all([
        supabase.from("shops").select("*").order("created_at", { ascending: false }),
        supabase.from("sales").select("shop_id, qty, price"),
        supabase.from("services").select("shop_id"),
        supabase.from("service_items").select("shop_id, price"),
        supabase.from("products").select("shop_id, qty, low_stock_threshold"),
      ]);
      return {
        shops: shops.data ?? [],
        sales: sales.data ?? [],
        services: services.data ?? [],
        serviceItems: serviceItems.data ?? [],
        products: products.data ?? [],
      };
    },
  });

  const rows = useMemo(() => {
    if (!data) return [];
    const term = q.trim().toLowerCase();
    return data.shops
      .map((s) => {
        const sales = data.sales.filter((r) => r.shop_id === s.id);
        const services = data.services.filter((r) => r.shop_id === s.id);
        const items = data.serviceItems.filter((r) => r.shop_id === s.id);
        const products = data.products.filter((r) => r.shop_id === s.id);
        return {
          ...s,
          salesTotal: sales.reduce((a, r) => a + Number(r.price) * Number(r.qty), 0),
          salesCount: sales.length,
          serviceTotal: items.reduce((a, r) => a + Number(r.price ?? 0), 0),
          serviceCount: services.length,
          productCount: products.length,
          lowStock: products.filter((p) => Number(p.qty) <= Number(p.low_stock_threshold)).length,
        };
      })
      .filter((s) =>
        !term
          ? true
          : [s.name, s.email, s.contact, s.gst, s.address].some((v) => (v ?? "").toLowerCase().includes(term)),
      );
  }, [data, q]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/admin-login", replace: true });
  }

  const totals = rows.reduce(
    (a, r) => ({ sales: a.sales + r.salesTotal, service: a.service + r.serviceTotal }),
    { sales: 0, service: 0 },
  );

  return (
    <div className="aurora-bg min-h-screen p-4 lg:p-8">
      <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl glass p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/20 text-accent">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight">STOCKERZ RO — ADMIN</h1>
            <p className="truncate text-xs text-muted-foreground">All registered shops</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>

      <PageHeader title="Shops" description={`${rows.length} shop(s) registered`} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total Shops" value={String(rows.length)} />
        <Stat label="Total Sales" value={fmtMoney(totals.sales)} />
        <Stat label="Total Service" value={fmtMoney(totals.service)} />
        <Stat label="Total Records" value={String(rows.reduce((a, r) => a + r.salesCount + r.serviceCount, 0))} />
      </div>

      <div className="mt-6 relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search shop name, email, phone, GST…"
          className="pl-9"
        />
      </div>

      {/* Desktop table */}
      <div className="mt-4 hidden lg:block">
        <Card>
          {isLoading ? (
            <Empty text="Loading shops…" />
          ) : rows.length === 0 ? (
            <Empty text="No shops found" />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Shop</Th>
                  <Th>Contact</Th>
                  <Th>GST</Th>
                  <Th>Products</Th>
                  <Th>Sales</Th>
                  <Th>Service</Th>
                  <Th>Joined</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id}>
                    <Td className="uppercase-data">
                      <div className="flex items-center gap-2">
                        {s.logo_url ? (
                          <img src={s.logo_url} alt={`${s.name} logo`} className="h-8 w-8 rounded-lg object-cover" />
                        ) : (
                          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/20 text-primary">
                            <Store className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{upper(s.name)}</div>
                          <div className="text-xs normal-case text-muted-foreground">{s.email ?? "—"}</div>
                        </div>
                      </div>
                    </Td>
                    <Td>{s.contact ?? "—"}</Td>
                    <Td className="uppercase-data">{s.gst ?? "—"}</Td>
                    <Td>
                      {s.productCount}
                      {s.lowStock > 0 && <span className="ml-2 text-xs text-warning">{s.lowStock} low</span>}
                    </Td>
                    <Td>
                      {fmtMoney(s.salesTotal)} <span className="text-xs text-muted-foreground">({s.salesCount})</span>
                    </Td>
                    <Td>
                      {fmtMoney(s.serviceTotal)} <span className="text-xs text-muted-foreground">({s.serviceCount})</span>
                    </Td>
                    <Td>{s.created_at.slice(0, 10)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      {/* Mobile cards */}
      <div className="mt-4 space-y-3 lg:hidden">
        {isLoading && <Empty text="Loading shops…" />}
        {!isLoading && rows.length === 0 && <Empty text="No shops found" />}
        {rows.map((s) => (
          <Card key={s.id}>
            <div className="flex items-center gap-3">
              {s.logo_url ? (
                <img src={s.logo_url} alt={`${s.name} logo`} className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/20 text-primary">
                  <Store className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate font-semibold uppercase-data">{upper(s.name)}</div>
                <div className="truncate text-xs text-muted-foreground">{s.email ?? "—"}</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <Meta label="Contact" value={s.contact ?? "—"} />
              <Meta label="GST" value={s.gst ?? "—"} />
              <Meta label="Sales" value={`${fmtMoney(s.salesTotal)} (${s.salesCount})`} />
              <Meta label="Service" value={`${fmtMoney(s.serviceTotal)} (${s.serviceCount})`} />
              <Meta label="Products" value={String(s.productCount)} />
              <Meta label="Joined" value={s.created_at.slice(0, 10)} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-2 text-xl font-bold">{value}</div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="truncate uppercase-data">{value}</div>
    </div>
  );
}
