import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button, Card, Empty, Field, Input, PageHeader, Select, Table, Td, Th } from "@/components/ui-kit";
import { fmtMoney } from "@/lib/app-utils";
import { useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/sales")({
  head: () => ({ meta: [{ title: "Sales — STOCKERZ RO" }] }),
  component: SalesPage,
});

const TABS = [
  { k: "stock", label: "From Stock" },
  { k: "manual", label: "Manual Entry" },
  { k: "office", label: "Office Sales" },
] as const;
type Tab = typeof TABS[number]["k"];

function SalesPage() {
  const [tab, setTab] = useState<Tab>("stock");
  const qc = useQueryClient();

  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => (await supabase.from("sales").select("*").order("sale_date", { ascending: false }).limit(50)).data ?? [],
  });
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await supabase.from("products").select("*").order("model")).data ?? [],
  });

  return (
    <div>
      <PageHeader title="Sales" description="Record sales in three modes" />

      <div className="mb-4 flex gap-1 rounded-xl glass p-1">
        {TABS.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${tab === t.k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <Card className="mb-6">
        {tab === "stock" ? <StockSaleForm products={products} onDone={() => qc.invalidateQueries()} />
          : tab === "manual" ? <ManualSaleForm source="manual" onDone={() => qc.invalidateQueries()} />
          : <ManualSaleForm source="office" onDone={() => qc.invalidateQueries()} />}
      </Card>

      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent sales</h3>
      {sales.length === 0 ? <Card><Empty text="No sales yet" /></Card> : (
        <Table>
          <thead><tr><Th>Date</Th><Th>Product</Th><Th>Qty</Th><Th>Total</Th><Th>Customer</Th><Th>Phone</Th><Th>Source</Th><Th></Th></tr></thead>
          <tbody>
            {sales.map((s: any) => (
              <tr key={s.id} className="hover:bg-white/5">
                <Td>{s.sale_date}</Td>
                <Td className="font-medium">{s.product_name}</Td>
                <Td>{s.qty}</Td>
                <Td>{fmtMoney(Number(s.price) * Number(s.qty))}</Td>
                <Td>{s.customer_name ?? "—"}</Td>
                <Td>{s.phone ?? "—"}</Td>
                <Td>{s.source}</Td>
                <Td>
                  <Link to="/invoice/$id" params={{ id: s.id }} className="inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-1 text-xs text-primary hover:bg-primary/25">
                    <FileText className="h-3 w-3" /> Invoice
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

function StockSaleForm({ products, onDone }: { products: any[]; onDone: () => void }) {
  const [f, setF] = useState({ product_id: "", qty: 1, customer_name: "", phone: "", address: "", sale_date: new Date().toISOString().slice(0, 10) });
  const submit = useMutation({
    mutationFn: async () => {
      const p = products.find(x => x.id === f.product_id);
      if (!p) throw new Error("Select product");
      if (p.qty < f.qty) throw new Error("Not enough stock");
      const shop = await supabase.from("shops").select("id").maybeSingle();
      const { error } = await supabase.from("sales").insert({
        shop_id: shop.data!.id, source: "stock", product_id: p.id, product_name: p.model,
        product_type: p.product_type, qty: f.qty, price: p.price,
        customer_name: f.customer_name.toUpperCase() || null, phone: f.phone || null, address: f.address.toUpperCase() || null,
        sale_date: f.sale_date,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Sale recorded"); setF({ ...f, product_id: "", qty: 1, customer_name: "", phone: "", address: "" }); onDone(); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <form onSubmit={e => { e.preventDefault(); submit.mutate(); }} className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Field label="Product">
        <Select required value={f.product_id} onChange={e => setF({ ...f, product_id: e.target.value })}>
          <option value="">Select…</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.model.toUpperCase()} ({p.qty} in stock, {fmtMoney(p.price)})</option>)}
        </Select>
      </Field>
      <Field label="Quantity"><Input type="number" min={1} value={f.qty} onChange={e => setF({ ...f, qty: Number(e.target.value) })} /></Field>
      <Field label="Customer name (optional)"><Input value={f.customer_name} onChange={e => setF({ ...f, customer_name: e.target.value })} className="uppercase-data" /></Field>
      <Field label="Phone (optional)"><Input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></Field>
      <Field label="Place / Address"><Input value={f.address} onChange={e => setF({ ...f, address: e.target.value })} className="uppercase-data" /></Field>
      <Field label="Date"><Input type="date" value={f.sale_date} onChange={e => setF({ ...f, sale_date: e.target.value })} /></Field>
      <div className="md:col-span-2 flex justify-end"><Button disabled={submit.isPending}>Record sale</Button></div>
    </form>
  );
}

function ManualSaleForm({ source, onDone }: { source: "manual" | "office"; onDone: () => void }) {
  const [f, setF] = useState({ product_name: "", product_type: "", price: 0, qty: 1, customer_name: "", phone: "", address: "", sale_date: new Date().toISOString().slice(0, 10) });
  const submit = useMutation({
    mutationFn: async () => {
      const shop = await supabase.from("shops").select("id").maybeSingle();
      const { error } = await supabase.from("sales").insert({
        shop_id: shop.data!.id, source, product_name: f.product_name.toUpperCase(),
        product_type: f.product_type || null, price: f.price, qty: f.qty,
        customer_name: f.customer_name.toUpperCase() || null, phone: f.phone || null, address: f.address.toUpperCase() || null,
        sale_date: f.sale_date,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Sale recorded"); setF({ ...f, product_name: "", product_type: "", price: 0, qty: 1, customer_name: "", phone: "", address: "" }); onDone(); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <form onSubmit={e => { e.preventDefault(); submit.mutate(); }} className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Field label="Product / Item name"><Input required value={f.product_name} onChange={e => setF({ ...f, product_name: e.target.value })} className="uppercase-data" /></Field>
      <Field label="Product type"><Input value={f.product_type} onChange={e => setF({ ...f, product_type: e.target.value })} /></Field>
      <Field label="Price"><Input type="number" step="0.01" min={0} value={f.price} onChange={e => setF({ ...f, price: Number(e.target.value) })} /></Field>
      <Field label="Quantity"><Input type="number" min={1} value={f.qty} onChange={e => setF({ ...f, qty: Number(e.target.value) })} /></Field>
      <Field label="Customer name (optional)"><Input value={f.customer_name} onChange={e => setF({ ...f, customer_name: e.target.value })} className="uppercase-data" /></Field>
      <Field label="Phone (optional)"><Input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></Field>
      <Field label="Place / Address (optional)"><Input value={f.address} onChange={e => setF({ ...f, address: e.target.value })} className="uppercase-data" /></Field>
      <Field label="Date"><Input type="date" value={f.sale_date} onChange={e => setF({ ...f, sale_date: e.target.value })} /></Field>
      <div className="md:col-span-2 flex justify-end"><Button disabled={submit.isPending}>Record {source} sale</Button></div>
    </form>
  );
}
