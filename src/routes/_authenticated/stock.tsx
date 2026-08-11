import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button, Card, Empty, Field, Input, Modal, PageHeader, Select, Table, Td, Th } from "@/components/ui-kit";
import { fmtMoney } from "@/lib/app-utils";
import { useState } from "react";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/stock")({
  head: () => ({ meta: [{ title: "Stock — STOCKERZ RO" }] }),
  component: StockPage,
});

type Product = { id: string; model: string; category: string; product_type: string | null; qty: number; price: number; low_stock_threshold: number };

function StockPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<Product | null | undefined>(undefined);

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("products").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); toast.success("Deleted"); },
  });

  return (
    <div>
      <PageHeader
        title="Stock"
        description="Manage products, filters and spares"
        actions={<Button onClick={() => setModal(null)}><Plus className="h-4 w-4" /> Add product</Button>}
      />

      {products.length === 0 ? (
        <Card><Empty text="No products yet. Add your first item." /></Card>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Model</Th><Th>Category</Th><Th>Type</Th><Th>Qty</Th><Th>Price</Th><Th></Th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="hover:bg-white/5">
                <Td className="font-medium">{p.model}</Td>
                <Td>{p.category}</Td>
                <Td>{p.product_type ?? "—"}</Td>
                <Td>
                  <span className={p.qty <= p.low_stock_threshold ? "inline-flex items-center gap-1 text-warning" : ""}>
                    {p.qty <= p.low_stock_threshold && <AlertTriangle className="h-3 w-3" />}
                    {p.qty}
                  </span>
                </Td>
                <Td>{fmtMoney(p.price)}</Td>
                <Td className="text-right">
                  <button className="mr-2 rounded p-1.5 hover:bg-white/10" onClick={() => setModal(p)}><Pencil className="h-4 w-4" /></button>
                  <button className="rounded p-1.5 text-destructive hover:bg-destructive/10" onClick={() => confirm("Delete?") && del.mutate(p.id)}><Trash2 className="h-4 w-4" /></button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <ProductModal open={modal !== undefined} product={modal ?? null} onClose={() => setModal(undefined)} />
    </div>
  );
}

function ProductModal({ open, product, onClose }: { open: boolean; product: Product | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({
    model: product?.model ?? "",
    category: product?.category ?? "machine",
    product_type: product?.product_type ?? "",
    qty: product?.qty ?? 0,
    price: product?.price ?? 0,
    low_stock_threshold: product?.low_stock_threshold ?? 5,
  });

  const save = useMutation({
    mutationFn: async () => {
      const shop = await supabase.from("shops").select("id").maybeSingle();
      const shop_id = shop.data?.id;
      if (!shop_id) throw new Error("No shop");
      const payload = { ...f, model: f.model.toUpperCase(), product_type: f.product_type || null, shop_id };
      if (product) {
        const { error } = await supabase.from("products").update(payload).eq("id", product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); toast.success("Saved"); onClose(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Modal open={open} onClose={onClose} title={product ? "Edit product" : "Add product"}>
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-3">
        <Field label="Model name"><Input required value={f.model} onChange={e => setF({ ...f, model: e.target.value })} className="uppercase-data" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category"><Select value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>
            <option value="machine">Machine</option><option value="filter">Filter</option><option value="spare">Spare</option>
          </Select></Field>
          <Field label="Product type"><Input value={f.product_type ?? ""} onChange={e => setF({ ...f, product_type: e.target.value })} placeholder="e.g. Membrane" /></Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Quantity"><Input type="number" min={0} value={f.qty} onChange={e => setF({ ...f, qty: Number(e.target.value) })} /></Field>
          <Field label="Price"><Input type="number" step="0.01" min={0} value={f.price} onChange={e => setF({ ...f, price: Number(e.target.value) })} /></Field>
          <Field label="Low stock alert"><Input type="number" min={0} value={f.low_stock_threshold} onChange={e => setF({ ...f, low_stock_threshold: Number(e.target.value) })} /></Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={save.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}
