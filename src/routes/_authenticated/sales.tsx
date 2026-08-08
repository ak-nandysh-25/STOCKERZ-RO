import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button, Card, Empty, Field, Input, PageHeader, Table, Td, Th } from "@/components/ui-kit";
import { fmtMoney } from "@/lib/app-utils";
import { useMemo, useState } from "react";
import { Building2, FileText, Package, Search, ShoppingCart, Store } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/sales")({
  head: () => ({ meta: [{ title: "Sales & Office Entry — STOCKERZ RO" }] }),
  component: SalesPage,
});

type MainTab = "showroom" | "office" | "all";

export function SalesPage() {
  const [mainTab, setMainTab] = useState<MainTab>("showroom");
  const [showroomSubTab, setShowroomSubTab] = useState<"stock" | "manual">("stock");
  const [searchQuery, setSearchQuery] = useState("");
  const qc = useQueryClient();

  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => (await supabase.from("sales").select("*").order("sale_date", { ascending: false }).limit(200)).data ?? [],
  });

  const showroomSales = useMemo(() => {
    return sales.filter((s: any) => s.source !== "office");
  }, [sales]);

  const officeSales = useMemo(() => {
    return sales.filter((s: any) => s.source === "office");
  }, [sales]);

  const filterBySearch = (list: any[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((s: any) =>
      (s.product_name ?? "").toLowerCase().includes(q) ||
      (s.customer_name ?? "").toLowerCase().includes(q) ||
      (s.phone ?? "").toLowerCase().includes(q) ||
      (s.address ?? "").toLowerCase().includes(q)
    );
  };

  const filteredShowroomSales = filterBySearch(showroomSales);
  const filteredOfficeSales = filterBySearch(officeSales);
  const filteredAllSales = filterBySearch(sales);

  const showroomTotal = showroomSales.reduce((acc, s) => acc + Number(s.price) * Number(s.qty), 0);
  const officeTotal = officeSales.reduce((acc, s) => acc + Number(s.price) * Number(s.qty), 0);

  return (
    <div>
      <PageHeader
        title="Sales OS"
        description="Separated entry and dedicated history tracking for Showroom and Office Sales"
      />

      {/* Primary Section Switcher */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 rounded-2xl glass p-1.5 overflow-x-auto">
          <button
            onClick={() => setMainTab("showroom")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shrink-0 ${
              mainTab === "showroom"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <Store className="h-4 w-4" />
            Showroom Sales ({showroomSales.length})
          </button>

          <button
            onClick={() => setMainTab("office")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shrink-0 ${
              mainTab === "office"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Office Sales ({officeSales.length})
          </button>

          <button
            onClick={() => setMainTab("all")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shrink-0 ${
              mainTab === "all"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            Combined History ({sales.length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, phone, item..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* TAB 1: SHOWROOM SALES */}
      {mainTab === "showroom" && (
        <div className="space-y-6">
          {/* Showroom Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Showroom Sales Revenue</div>
                <div className="mt-1 text-2xl font-black text-primary">{fmtMoney(showroomTotal)}</div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/20 text-primary">
                <Store className="h-5 w-5" />
              </div>
            </Card>
            <Card className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Showroom Entries</div>
                <div className="mt-1 text-2xl font-black">{showroomSales.length} Records</div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Package className="h-5 w-5" />
              </div>
            </Card>
          </div>

          {/* Showroom Entry Form */}
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" /> New Showroom Sale Entry
              </h2>
              <div className="flex gap-1 rounded-lg bg-white/5 p-1">
                <button
                  onClick={() => setShowroomSubTab("stock")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                    showroomSubTab === "stock" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  From Inventory Stock
                </button>
                <button
                  onClick={() => setShowroomSubTab("manual")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                    showroomSubTab === "manual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Manual Entry
                </button>
              </div>
            </div>

            {showroomSubTab === "stock" ? (
              <StockSaleForm onDone={() => qc.invalidateQueries({ queryKey: ["sales"] })} />
            ) : (
              <ManualSaleForm source="manual" onDone={() => qc.invalidateQueries({ queryKey: ["sales"] })} />
            )}
          </Card>

          {/* Showroom Sales History Table */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" /> Showroom Sales History ({filteredShowroomSales.length})
            </h3>
            {filteredShowroomSales.length === 0 ? (
              <Card><Empty text="No showroom sales records found" /></Card>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Date</Th>
                    <Th>Product / Item</Th>
                    <Th>Source</Th>
                    <Th>Qty</Th>
                    <Th>Total</Th>
                    <Th>Customer</Th>
                    <Th>Phone</Th>
                    <Th className="text-right">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShowroomSales.map((s: any) => (
                    <tr key={s.id} className="hover:bg-white/5">
                      <Td>{s.sale_date}</Td>
                      <Td className="font-semibold uppercase-data">{s.product_name}</Td>
                      <Td>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          s.source === "stock" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}>
                          {s.source === "stock" ? "Stock" : "Manual"}
                        </span>
                      </Td>
                      <Td>{s.qty}</Td>
                      <Td className="font-bold text-emerald-400">{fmtMoney(Number(s.price) * Number(s.qty))}</Td>
                      <Td className="uppercase-data">{s.customer_name ?? "—"}</Td>
                      <Td>{s.phone ?? "—"}</Td>
                      <Td className="text-right">
                        <Link
                          to="/invoice/$id"
                          params={{ id: s.id }}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/25 transition"
                        >
                          <FileText className="h-3.5 w-3.5" /> Invoice
                        </Link>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: OFFICE SALES */}
      {mainTab === "office" && (
        <div className="space-y-6">
          {/* Office Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Office Total Sales Revenue</div>
                <div className="mt-1 text-2xl font-black text-amber-400">{fmtMoney(officeTotal)}</div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                <Building2 className="h-5 w-5" />
              </div>
            </Card>
            <Card className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Office Sale Entries</div>
                <div className="mt-1 text-2xl font-black">{officeSales.length} Records</div>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/20 text-purple-400">
                <FileText className="h-5 w-5" />
              </div>
            </Card>
          </div>

          {/* Dedicated Office Entry Form */}
          <Card>
            <div className="mb-4 border-b border-white/10 pb-3">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-amber-400" /> New Office Sale Entry
              </h2>
              <p className="text-xs text-muted-foreground">Record corporate, B2B or office sales separately from showroom inventory</p>
            </div>
            <ManualSaleForm source="office" onDone={() => qc.invalidateQueries({ queryKey: ["sales"] })} />
          </Card>

          {/* Dedicated Office Sales History Table */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-400" /> Dedicated Office Sales History ({filteredOfficeSales.length})
            </h3>
            {filteredOfficeSales.length === 0 ? (
              <Card><Empty text="No office sales recorded yet" /></Card>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Date</Th>
                    <Th>Item / Product</Th>
                    <Th>Type</Th>
                    <Th>Qty</Th>
                    <Th>Total</Th>
                    <Th>Customer / Company</Th>
                    <Th>Contact</Th>
                    <Th>Address / Place</Th>
                    <Th className="text-right">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOfficeSales.map((s: any) => (
                    <tr key={s.id} className="hover:bg-white/5">
                      <Td>{s.sale_date}</Td>
                      <Td className="font-semibold uppercase-data">{s.product_name}</Td>
                      <Td className="text-muted-foreground">{s.product_type ?? "—"}</Td>
                      <Td>{s.qty}</Td>
                      <Td className="font-bold text-amber-400">{fmtMoney(Number(s.price) * Number(s.qty))}</Td>
                      <Td className="uppercase-data font-medium">{s.customer_name ?? "—"}</Td>
                      <Td>{s.phone ?? "—"}</Td>
                      <Td className="uppercase-data text-xs text-muted-foreground">{s.address ?? "—"}</Td>
                      <Td className="text-right">
                        <Link
                          to="/invoice/$id"
                          params={{ id: s.id }}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/25 transition"
                        >
                          <FileText className="h-3.5 w-3.5" /> Invoice
                        </Link>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COMBINED ALL SALES HISTORY */}
      {mainTab === "all" && (
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" /> Combined Sales History ({filteredAllSales.length})
          </h3>
          {filteredAllSales.length === 0 ? (
            <Card><Empty text="No sales history found" /></Card>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Product / Item</Th>
                  <Th>Source</Th>
                  <Th>Qty</Th>
                  <Th>Total</Th>
                  <Th>Customer</Th>
                  <Th>Phone</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {filteredAllSales.map((s: any) => (
                  <tr key={s.id} className="hover:bg-white/5">
                    <Td>{s.sale_date}</Td>
                    <Td className="font-semibold uppercase-data">{s.product_name}</Td>
                    <Td>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        s.source === "office"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : s.source === "stock"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}>
                        {s.source === "office" ? "Office" : s.source === "stock" ? "Stock" : "Manual"}
                      </span>
                    </Td>
                    <Td>{s.qty}</Td>
                    <Td className="font-bold text-emerald-400">{fmtMoney(Number(s.price) * Number(s.qty))}</Td>
                    <Td className="uppercase-data">{s.customer_name ?? "—"}</Td>
                    <Td>{s.phone ?? "—"}</Td>
                    <Td className="text-right">
                      <Link
                        to="/invoice/$id"
                        params={{ id: s.id }}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/25 transition"
                      >
                        <FileText className="h-3.5 w-3.5" /> Invoice
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}

function StockSaleForm({ onDone }: { onDone: () => void }) {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await supabase.from("products").select("*").order("model")).data ?? [],
  });
  const [f, setF] = useState({ product_id: "", price: 0, qty: 1, customer_name: "", phone: "", address: "", sale_date: new Date().toISOString().slice(0, 10) });
  const selected: any = products.find((p: any) => p.id === f.product_id);

  const submit = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error("Select a product from inventory");
      if (Number(f.qty) > Number(selected.qty)) throw new Error("Not enough stock available");
      const { error } = await supabase.from("sales").insert({
        shop_id: selected.shop_id,
        source: "stock",
        product_id: selected.id,
        product_name: String(selected.model).toUpperCase(),
        product_type: selected.product_type ?? null,
        price: f.price || Number(selected.price),
        qty: f.qty,
        customer_name: f.customer_name.trim().toUpperCase() || null,
        phone: f.phone.trim() || null,
        address: f.address.trim().toUpperCase() || null,
        sale_date: f.sale_date,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Stock sale recorded");
      setF({ product_id: "", price: 0, qty: 1, customer_name: "", phone: "", address: "", sale_date: new Date().toISOString().slice(0, 10) });
      onDone();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <form onSubmit={e => { e.preventDefault(); submit.mutate(); }} className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Field label="Product from stock">
        <select
          required
          value={f.product_id}
          onChange={e => {
            const p: any = products.find((x: any) => x.id === e.target.value);
            setF({ ...f, product_id: e.target.value, price: p ? Number(p.price) : 0 });
          }}
          className="w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select product from inventory</option>
          {products.map((p: any) => (
            <option key={p.id} value={p.id}>{String(p.model).toUpperCase()} — {p.qty} in stock</option>
          ))}
        </select>
      </Field>
      <Field label="Price (₹)"><Input type="number" step="0.01" min={0} value={f.price} onChange={e => setF({ ...f, price: Number(e.target.value) })} /></Field>
      <Field label={`Quantity${selected ? ` (max ${selected.qty})` : ""}`}><Input type="number" min={1} value={f.qty} onChange={e => setF({ ...f, qty: Number(e.target.value) })} /></Field>
      <Field label="Date"><Input type="date" value={f.sale_date} onChange={e => setF({ ...f, sale_date: e.target.value })} /></Field>
      <Field label="Customer name"><Input value={f.customer_name} onChange={e => setF({ ...f, customer_name: e.target.value })} className="uppercase-data" /></Field>
      <Field label="Phone"><Input maxLength={10} value={f.phone} onChange={e => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10-digit mobile number" className="font-mono tracking-wider" /></Field>
      <Field label="Place / Address"><Input value={f.address} onChange={e => setF({ ...f, address: e.target.value })} className="uppercase-data" /></Field>
      <div className="md:col-span-2 flex justify-end">
        <Button disabled={submit.isPending}>
          {submit.isPending ? "Recording..." : "Record Stock Sale"}
        </Button>
      </div>
    </form>
  );
}

function ManualSaleForm({ source, onDone }: { source: "manual" | "office"; onDone: () => void }) {
  const [f, setF] = useState({
    product_name: "",
    product_type: "",
    price: 0,
    qty: 1,
    customer_name: "",
    phone: "",
    address: "",
    sale_date: new Date().toISOString().slice(0, 10),
  });

  const submit = useMutation({
    mutationFn: async () => {
      const shop = await supabase.from("shops").select("id").maybeSingle();
      if (!shop.data?.id) throw new Error("No active shop found");

      const { error } = await supabase.from("sales").insert({
        shop_id: shop.data.id,
        source,
        product_name: f.product_name.trim().toUpperCase(),
        product_type: f.product_type.trim() || null,
        price: f.price,
        qty: f.qty,
        customer_name: f.customer_name.trim().toUpperCase() || null,
        phone: f.phone.trim() || null,
        address: f.address.trim().toUpperCase() || null,
        sale_date: f.sale_date,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${source === "office" ? "Office" : "Manual"} sale recorded`);
      setF({
        product_name: "",
        product_type: "",
        price: 0,
        qty: 1,
        customer_name: "",
        phone: "",
        address: "",
        sale_date: new Date().toISOString().slice(0, 10),
      });
      onDone();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <form onSubmit={e => { e.preventDefault(); submit.mutate(); }} className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Field label="Product / Item name">
        <Input
          required
          value={f.product_name}
          onChange={e => setF({ ...f, product_name: e.target.value })}
          placeholder={source === "office" ? "e.g. COMMERCIAL RO PLANT 500 LPH" : "e.g. SPARE FILTERS KIT"}
          className="uppercase-data"
        />
      </Field>
      <Field label="Product type">
        <Input
          value={f.product_type}
          onChange={e => setF({ ...f, product_type: e.target.value })}
          placeholder="e.g. Commercial / Industrial / Spare"
        />
      </Field>
      <Field label="Price (₹)">
        <Input type="number" step="0.01" min={0} value={f.price} onChange={e => setF({ ...f, price: Number(e.target.value) })} />
      </Field>
      <Field label="Quantity">
        <Input type="number" min={1} value={f.qty} onChange={e => setF({ ...f, qty: Number(e.target.value) })} />
      </Field>
      <Field label="Customer / Company name">
        <Input
          value={f.customer_name}
          onChange={e => setF({ ...f, customer_name: e.target.value })}
          placeholder="Customer or Organization Name"
          className="uppercase-data"
        />
      </Field>
      <Field label="Phone number">
        <Input maxLength={10} value={f.phone} onChange={e => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10-digit mobile number" className="font-mono tracking-wider" />
      </Field>
      <Field label="Place / Address">
        <Input
          value={f.address}
          onChange={e => setF({ ...f, address: e.target.value })}
          placeholder="Installation site or office location"
          className="uppercase-data"
        />
      </Field>
      <Field label="Sale Date">
        <Input type="date" value={f.sale_date} onChange={e => setF({ ...f, sale_date: e.target.value })} />
      </Field>
      <div className="md:col-span-2 flex justify-end">
        <Button disabled={submit.isPending}>
          {submit.isPending ? "Recording..." : `Record ${source === "office" ? "Office" : "Manual"} Sale`}
        </Button>
      </div>
    </form>
  );
}
