import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button, Card, Empty, Field, Input, Modal, PageHeader, Table, Td, Th } from "@/components/ui-kit";
import { fmtMoney, upper } from "@/lib/app-utils";
import { AlertTriangle, Edit, LogOut, Search, ShieldCheck, Store, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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

type ShopRow = {
  id: string;
  name: string;
  email: string | null;
  contact: string | null;
  gst: string | null;
  address: string | null;
  logo_url: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  salesTotal: number;
  salesCount: number;
  serviceTotal: number;
  serviceCount: number;
  productCount: number;
  lowStock: number;
};

function AdminShops() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  // Edit modal state
  const [editingShop, setEditingShop] = useState<ShopRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editGst, setEditGst] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editLogoUrl, setEditLogoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deletingShop, setDeletingShop] = useState<ShopRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const rows: ShopRow[] = useMemo(() => {
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

  function openEditModal(shop: ShopRow) {
    setEditingShop(shop);
    setEditName(shop.name ?? "");
    setEditEmail(shop.email ?? "");
    setEditContact(shop.contact ?? "");
    setEditGst(shop.gst ?? "");
    setEditAddress(shop.address ?? "");
    setEditLogoUrl(shop.logo_url ?? "");
  }

  async function handleSaveEdit() {
    if (!editingShop) return;
    if (!editName.trim()) {
      toast.error("Shop name is required");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("shops")
        .update({
          name: editName.trim(),
          email: editEmail.trim() || null,
          contact: editContact.trim() || null,
          gst: editGst.trim() || null,
          address: editAddress.trim() || null,
          logo_url: editLogoUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingShop.id);

      if (error) throw error;

      toast.success(`Shop "${editName.trim()}" updated successfully`);
      await qc.invalidateQueries({ queryKey: ["admin-shops"] });
      setEditingShop(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update shop";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteShop() {
    if (!deletingShop) return;
    setIsDeleting(true);
    try {
      const shopId = deletingShop.id;

      // Delete child records first to satisfy foreign keys cleanly
      await Promise.all([
        supabase.from("sales").delete().eq("shop_id", shopId),
        supabase.from("services").delete().eq("shop_id", shopId),
        supabase.from("service_items").delete().eq("shop_id", shopId),
        supabase.from("products").delete().eq("shop_id", shopId),
        supabase.from("emi_plans").delete().eq("shop_id", shopId),
        supabase.from("technicians").delete().eq("shop_id", shopId),
      ]);

      // Delete shop row
      const { error } = await supabase.from("shops").delete().eq("id", shopId);
      if (error) throw error;

      toast.success(`Shop "${deletingShop.name}" deleted successfully`);
      await qc.invalidateQueries({ queryKey: ["admin-shops"] });
      setDeletingShop(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete shop";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  const totals = rows.reduce(
    (a, r) => ({ sales: a.sales + r.salesTotal, service: a.service + r.serviceTotal }),
    { sales: 0, service: 0 },
  );

  return (
    <div className="aurora-bg min-h-screen p-4 lg:p-8">
      {/* Admin Top Header */}
      <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl glass p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/20 text-accent">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight">STOCKERZ RO — ADMIN</h1>
            <p className="truncate text-xs text-muted-foreground">Shop Management & System Control</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>

      <PageHeader title="Registered Shops" description={`Manage ${rows.length} shop(s)`} />

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

      {/* Desktop Table */}
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
                  <Th className="text-right">Actions</Th>
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
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(s)}
                          className="flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-white/10"
                          title="Edit shop details"
                        >
                          <Edit className="h-3.5 w-3.5 text-primary" /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingShop(s)}
                          className="flex items-center gap-1 rounded-md bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20"
                          title="Delete/Deactivate shop"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="mt-4 space-y-3 lg:hidden">
        {isLoading && <Empty text="Loading shops…" />}
        {!isLoading && rows.length === 0 && <Empty text="No shops found" />}
        {rows.map((s) => (
          <Card key={s.id}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
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

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => openEditModal(s)}
                  className="p-2 rounded-lg glass text-primary hover:bg-white/10"
                  title="Edit shop"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeletingShop(s)}
                  className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
                  title="Delete shop"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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

      {/* Edit Shop Modal */}
      <Modal
        open={Boolean(editingShop)}
        onClose={() => setEditingShop(null)}
        title={`Edit Shop: ${editingShop?.name ?? ""}`}
      >
        <div className="space-y-4 pt-2">
          <Field label="Shop Name">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="e.g. Aqua Pure RO Showroom"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Email Address">
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="shop@example.com"
              />
            </Field>

            <Field label="Contact Phone">
              <Input
                value={editContact}
                onChange={(e) => setEditContact(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="GSTIN Number">
              <Input
                value={editGst}
                onChange={(e) => setEditGst(e.target.value)}
                placeholder="33AAAAA0000A1Z5"
              />
            </Field>

            <Field label="Logo URL">
              <Input
                value={editLogoUrl}
                onChange={(e) => setEditLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </Field>
          </div>

          <Field label="Showroom Address">
            <Input
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              placeholder="Full shop address"
            />
          </Field>

          <div className="mt-6 flex justify-end gap-3 border-t border-glass-border pt-4">
            <Button variant="ghost" onClick={() => setEditingShop(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete / Deactivate Shop Modal */}
      <Modal
        open={Boolean(deletingShop)}
        onClose={() => setDeletingShop(null)}
        title="Confirm Shop Deletion"
      >
        <div className="pt-2">
          <div className="flex items-start gap-3 rounded-xl bg-destructive/10 p-4 border border-destructive/20 text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-sm">Warning: Irreversible Action</p>
              <p className="mt-1">
                You are about to delete <strong className="underline">{deletingShop?.name}</strong>.
                This will purge the shop record along with all associated sales, products, technicians, and service logs.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeletingShop(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteShop} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Yes, Delete Shop"}
            </Button>
          </div>
        </div>
      </Modal>
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
