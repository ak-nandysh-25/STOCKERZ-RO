import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, Empty, Input, PageHeader } from "@/components/ui-kit";
import { fmtMoney, upper, waLink, fmtDate } from "@/lib/app-utils";
import { useMemo, useState } from "react";
import { Search, Phone, User, ShoppingCart, Wrench, MessageCircle, FileText, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/customers")({
  head: () => ({ meta: [{ title: "Customers — STOCKERZ RO" }] }),
  component: CustomersPage,
});

type Row = { name: string; phone: string | null; address: string | null; lastDate: string; salesCount: number; servicesCount: number; totalSpent: number; key: string };

function CustomersPage() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["customers-all"],
    queryFn: async () => {
      const [sales, services] = await Promise.all([
        supabase.from("sales").select("*").order("sale_date", { ascending: false }),
        supabase.from("services").select("*, service_items(*)").order("service_date", { ascending: false }),
      ]);
      return { sales: sales.data ?? [], services: services.data ?? [] };
    },
  });

  const customers = useMemo<Row[]>(() => {
    if (!data) return [];
    const map = new Map<string, Row>();
    const key = (n: string | null, p: string | null) => (p?.replace(/\D/g, "") || (n ?? "").trim().toLowerCase()) || "__unknown";

    for (const s of data.sales) {
      if (!s.customer_name && !s.phone) continue;
      const k = key(s.customer_name, s.phone);
      const cur = map.get(k) ?? { key: k, name: s.customer_name ?? "—", phone: s.phone, address: s.address, lastDate: s.sale_date, salesCount: 0, servicesCount: 0, totalSpent: 0 };
      cur.name = cur.name === "—" ? (s.customer_name ?? "—") : cur.name;
      cur.phone = cur.phone ?? s.phone;
      cur.address = cur.address ?? s.address;
      cur.salesCount += 1;
      cur.totalSpent += Number(s.price) * Number(s.qty);
      if (s.sale_date > cur.lastDate) cur.lastDate = s.sale_date;
      map.set(k, cur);
    }
    for (const s of data.services) {
      const k = key(s.customer_name, s.phone);
      const cur = map.get(k) ?? { key: k, name: s.customer_name, phone: s.phone, address: s.address, lastDate: s.service_date, salesCount: 0, servicesCount: 0, totalSpent: 0 };
      cur.phone = cur.phone ?? s.phone;
      cur.address = cur.address ?? s.address;
      cur.servicesCount += 1;
      cur.totalSpent += (s.service_items ?? []).reduce((a: number, it: any) => a + Number(it.price), 0);
      if (s.service_date > cur.lastDate) cur.lastDate = s.service_date;
      map.set(k, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.lastDate.localeCompare(a.lastDate));
  }, [data]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(c => c.name.toLowerCase().includes(term) || (c.phone ?? "").toLowerCase().includes(term) || (c.address ?? "").toLowerCase().includes(term));
  }, [q, customers]);

  const active = selected ? customers.find(c => c.key === selected) : null;

  if (active && data) {
    const sales = data.sales.filter(s => {
      const k = (s.phone?.replace(/\D/g, "") || (s.customer_name ?? "").trim().toLowerCase()) || "__unknown";
      return k === active.key;
    });
    const services = data.services.filter(s => {
      const k = (s.phone?.replace(/\D/g, "") || (s.customer_name ?? "").trim().toLowerCase()) || "__unknown";
      return k === active.key;
    });
    return (
      <div>
        <button onClick={() => setSelected(null)} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to customers
        </button>

        <Card className="mb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold uppercase-data md:text-2xl">{active.name}</h1>
              <div className="mt-1 space-y-0.5 text-sm text-muted-foreground uppercase-data">
                {active.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {active.phone}</div>}
                {active.address && <div>{active.address}</div>}
              </div>
            </div>
            {active.phone && (
              <a href={waLink(active.phone, `Hello ${upper(active.name)},`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-success/20 px-3 py-2 text-sm text-success hover:bg-success/30">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Stat label="Sales" value={String(active.salesCount)} />
            <Stat label="Services" value={String(active.servicesCount)} />
            <Stat label="Total" value={fmtMoney(active.totalSpent)} />
          </div>
        </Card>

        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sales history</h3>
        {sales.length === 0 ? <Card className="mb-4"><Empty text="No sales" /></Card> : (
          <div className="mb-4 space-y-2">
            {sales.map(s => (
              <Card key={s.id} className="!p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 uppercase-data">
                    <div className="truncate font-medium">{s.product_name}</div>
                    <div className="text-xs text-muted-foreground">{s.sale_date} • QTY {s.qty} • {s.source}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{fmtMoney(Number(s.price) * Number(s.qty))}</div>
                    <Link to="/invoice/$id" params={{ id: s.id }} className="mt-1 inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-1 text-xs text-primary hover:bg-primary/25">
                      <FileText className="h-3 w-3" /> Invoice
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Service history</h3>
        {services.length === 0 ? <Card><Empty text="No services" /></Card> : (
          <div className="space-y-2">
            {services.map((s: any) => {
              const total = (s.service_items ?? []).reduce((a: number, it: any) => a + Number(it.price), 0);
              return (
                <Card key={s.id} className="!p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 uppercase-data">
                      <div className="truncate font-medium">{s.service_type}</div>
                      <div className="text-xs text-muted-foreground">{fmtDate(s.service_date)} • {s.service_items?.length ?? 0} ITEMS {s.next_service_date ? `• NEXT ${fmtDate(s.next_service_date)}` : ""}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{fmtMoney(total)}</div>
                      <Link to="/service-invoice/$id" params={{ id: s.id }} className="mt-1 inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-1 text-xs text-primary hover:bg-primary/25">
                        <FileText className="h-3 w-3" /> Invoice
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Customers" description="Search customer records across sales and services" />

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, phone or place…" className="pl-9" />
      </div>

      {filtered.length === 0 ? <Card><Empty text={q ? "No matches" : "No customers yet"} /></Card> : (
        <div className="grid gap-2 sm:grid-cols-2">
          {filtered.map(c => (
            <button key={c.key} onClick={() => setSelected(c.key)} className="glass rounded-2xl p-4 text-left transition hover:bg-white/10">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 uppercase-data">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary"><User className="h-4 w-4" /></div>
                    <span className="truncate font-semibold">{c.name}</span>
                  </div>
                  {c.phone && <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> {c.phone}</div>}
                  {c.address && <div className="mt-0.5 truncate text-xs text-muted-foreground uppercase-data">{c.address}</div>}
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{fmtMoney(c.totalSpent)}</div>
                  <div className="mt-1 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
                    <span className="inline-flex items-center gap-0.5"><ShoppingCart className="h-3 w-3" />{c.salesCount}</span>
                    <span className="inline-flex items-center gap-0.5"><Wrench className="h-3 w-3" />{c.servicesCount}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-2">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-bold">{value}</div>
    </div>
  );
}
