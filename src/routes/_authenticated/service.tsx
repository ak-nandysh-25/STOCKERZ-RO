import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button, Card, Empty, Field, Input, PageHeader, Select, Table, Td, Th } from "@/components/ui-kit";
import { fmtMoney, upper, waLink } from "@/lib/app-utils";
import { useState } from "react";
import { Plus, Trash2, MessageCircle, FileText } from "lucide-react";
import { toast } from "sonner";


export const Route = createFileRoute("/_authenticated/service")({
  head: () => ({ meta: [{ title: "Service — STOCKERZ RO" }] }),
  component: ServicePage,
});

function ServicePage() {
  const qc = useQueryClient();
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => (await supabase.from("services").select("*, service_items(*)").order("service_date", { ascending: false }).limit(50)).data ?? [],
  });
  const { data: technicians = [] } = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => (await supabase.from("technicians").select("*")).data ?? [],
  });

  const [items, setItems] = useState([{ product_name: "", price: 0 }]);
  const [f, setF] = useState({
    customer_name: "", phone: "", service_type: "Filter Change", technician_id: "", address: "",
    is_filter_change: true, service_date: new Date().toISOString().slice(0, 10),
  });

  const submit = useMutation({
    mutationFn: async () => {
      const shop = await supabase.from("shops").select("id").maybeSingle();
      const { data: created, error } = await supabase.from("services").insert({
        shop_id: shop.data!.id,
        customer_name: f.customer_name.toUpperCase(),
        phone: f.phone || null,
        service_type: f.service_type.toUpperCase(),
        technician_id: f.technician_id || null,
        address: f.address.toUpperCase() || null,
        is_filter_change: f.is_filter_change,
        service_date: f.service_date,
      }).select().single();
      if (error) throw error;
      const valid = items.filter(i => i.product_name.trim());
      if (valid.length) {
        const { error: e2 } = await supabase.from("service_items").insert(
          valid.map(i => ({ service_id: created.id, shop_id: shop.data!.id, product_name: i.product_name.toUpperCase(), price: i.price }))
        );
        if (e2) throw e2;
      }
    },
    onSuccess: () => {
      toast.success("Service recorded");
      setF({ ...f, customer_name: "", phone: "", address: "" });
      setItems([{ product_name: "", price: 0 }]);
      qc.invalidateQueries();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from("services").delete().eq("id", id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });

  return (
    <div>
      <PageHeader title="Service" description="Record customer service jobs" />

      <Card className="mb-6">
        <form onSubmit={e => { e.preventDefault(); submit.mutate(); }} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Customer name"><Input required value={f.customer_name} onChange={e => setF({ ...f, customer_name: e.target.value })} className="uppercase-data" /></Field>
          <Field label="Phone"><Input required maxLength={10} value={f.phone} onChange={e => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10-digit mobile number" className="font-mono tracking-wider" /></Field>
          <Field label="Service type"><Input value={f.service_type} onChange={e => setF({ ...f, service_type: e.target.value })} className="uppercase-data" /></Field>
          <Field label="Technician (optional)"><Select value={f.technician_id} onChange={e => setF({ ...f, technician_id: e.target.value })}>
            <option value="">—</option>
            {technicians.map((t: any) => <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>)}
          </Select></Field>
          <Field label="Place / Address"><Input value={f.address} onChange={e => setF({ ...f, address: e.target.value })} className="uppercase-data" /></Field>
          <Field label="Date"><Input type="date" value={f.service_date} onChange={e => setF({ ...f, service_date: e.target.value })} /></Field>
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={f.is_filter_change} onChange={e => setF({ ...f, is_filter_change: e.target.checked })} />
              Filter change (auto-sets next service date +3 months)
            </label>
          </div>

          <div className="md:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Products / Items</span>
              <Button type="button" variant="outline" onClick={() => setItems([...items, { product_name: "", price: 0 }])}>
                <Plus className="h-3 w-3" /> Add item
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-[1fr_120px_40px] gap-2">
                  <Input placeholder="PRODUCT NAME" value={it.product_name} onChange={e => { const c = [...items]; c[i].product_name = e.target.value; setItems(c); }} className="uppercase-data" />
                  <Input type="number" step="0.01" placeholder="Price" value={it.price} onChange={e => { const c = [...items]; c[i].price = Number(e.target.value); setItems(c); }} />
                  <button type="button" onClick={() => setItems(items.filter((_, x) => x !== i))} className="rounded p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end"><Button disabled={submit.isPending}>Record service</Button></div>
        </form>
      </Card>

      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent services</h3>
      {services.length === 0 ? <Card><Empty text="No services yet" /></Card> : (
        <Table>
          <thead><tr><Th>Date</Th><Th>Customer</Th><Th>Type</Th><Th>Items</Th><Th>Total</Th><Th>Next</Th><Th></Th></tr></thead>
          <tbody>
            {services.map((s: any) => {
              const total = (s.service_items ?? []).reduce((sum: number, it: any) => sum + Number(it.price), 0);
              return (
                <tr key={s.id} className="hover:bg-white/5">
                  <Td>{s.service_date}</Td>
                  <Td className="font-medium">{s.customer_name}</Td>
                  <Td>{s.service_type}</Td>
                  <Td>{s.service_items?.length ?? 0}</Td>
                  <Td>{fmtMoney(total)}</Td>
                  <Td className={s.next_service_date ? "text-warning" : ""}>{s.next_service_date ?? "—"}</Td>
                  <Td className="text-right">
                    <Link to="/service-invoice/$id" params={{ id: s.id }} className="mr-2 inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-1 text-xs text-primary hover:bg-primary/25">
                      <FileText className="h-3 w-3" /> Invoice
                    </Link>
                    {s.phone && s.next_service_date && (
                      <a href={waLink(s.phone, `Hello ${upper(s.customer_name)}, your RO filter change is due on ${s.next_service_date}.`)} target="_blank" rel="noreferrer" className="mr-2 inline-flex rounded bg-success/15 p-1.5 text-success"><MessageCircle className="h-3.5 w-3.5" /></a>
                    )}
                    <button onClick={() => confirm("Delete?") && del.mutate(s.id)} className="rounded p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
