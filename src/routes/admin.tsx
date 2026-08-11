import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button, Card, Empty, Field, Input, Modal, PageHeader, Table, Td, Th, Select } from "@/components/ui-kit";
import { fmtMoney, upper, fmtDate } from "@/lib/app-utils";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  AlertTriangle,
  Edit,
  LogOut,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Store,
  Trash2,
  Users,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getAdminMasterDataServerFn,
  adminCreateShopServerFn,
  adminDeleteShopServerFn,
} from "@/lib/admin-provision-server";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "System Admin Command Center — STOCKERZ RO" },
      { name: "description", content: "Admin management portal for shops, sales, stock, and service tickets." },
      { property: "og:title", content: "System Admin Command Center — STOCKERZ RO" },
      { property: "og:description", content: "Manage all shops, delete shop records, view global sales & stock." },
      { property: "og:type", content: "website" },
    ],
  }),
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin-login" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    if (!isAdmin) throw redirect({ to: "/admin-login" });
    return { user: data.user };
  },
  component: AdminControlCenter,
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

type ActiveTab = "shops" | "sales" | "inventory" | "services";

function AdminControlCenter() {
  const nav = useNavigate();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<ActiveTab>("shops");
  const [q, setQ] = useState("");

  // Add Shop Modal State
  const [isAddShopOpen, setIsAddShopOpen] = useState(false);
  const [newShopName, setNewShopName] = useState("");
  const [newShopEmail, setNewShopEmail] = useState("");
  const [newShopContact, setNewShopContact] = useState("");
  const [newShopGst, setNewShopGst] = useState("");
  const [newShopAddress, setNewShopAddress] = useState("");
  const [newShopLogo, setNewShopLogo] = useState("");
  const [isCreatingShop, setIsCreatingShop] = useState(false);

  // Edit Shop Modal State
  const [editingShop, setEditingShop] = useState<ShopRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editGst, setEditGst] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editLogoUrl, setEditLogoUrl] = useState("");
  const [isSavingShop, setIsSavingShop] = useState(false);

  // Delete Shop Modal State
  const [deletingShop, setDeletingShop] = useState<ShopRow | null>(null);
  const [isDeletingShop, setIsDeletingShop] = useState(false);

  // Purge Non-Admin Users State
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isPurgingNonAdmin, setIsPurgingNonAdmin] = useState(false);

  // Fetch all administrative data (Server function bypasses RLS to always return all registered shops)
  const { data, isLoading } = useQuery({
    queryKey: ["admin-master-data"],
    queryFn: async () => {
      try {
        const sData = await getAdminMasterDataServerFn();
        if (sData && sData.success) {
          return {
            shops: sData.shops ?? [],
            sales: sData.sales ?? [],
            services: sData.services ?? [],
            serviceItems: sData.serviceItems ?? [],
            products: sData.products ?? [],
            technicians: sData.technicians ?? [],
          };
        }
      } catch (err) {
        console.warn("Server admin master data notice:", err);
      }

      // Fallback to client query
      const [shops, sales, services, serviceItems, products, technicians] = await Promise.all([
        supabase.from("shops").select("*").order("created_at", { ascending: false }),
        supabase.from("sales").select("*").order("created_at", { ascending: false }),
        supabase.from("services").select("*").order("created_at", { ascending: false }),
        supabase.from("service_items").select("*"),
        supabase.from("products").select("*").order("model", { ascending: true }),
        supabase.from("technicians").select("*"),
      ]);

      return {
        shops: shops.data ?? [],
        sales: sales.data ?? [],
        services: services.data ?? [],
        serviceItems: serviceItems.data ?? [],
        products: products.data ?? [],
        technicians: technicians.data ?? [],
      };
    },
  });

  // Processed Shops
  const shopsList: ShopRow[] = useMemo(() => {
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

  // Processed Global Sales
  const filteredSales = useMemo(() => {
    if (!data) return [];
    const term = q.trim().toLowerCase();
    return data.sales.filter((s) => {
      if (!term) return true;
      const shopName = data.shops.find((shp) => shp.id === s.shop_id)?.name ?? "";
      return [s.product_name, s.customer_name, s.phone, s.source, shopName]
        .some((v) => (v ?? "").toLowerCase().includes(term));
    });
  }, [data, q]);

  // Processed Global Inventory
  const filteredProducts = useMemo(() => {
    if (!data) return [];
    const term = q.trim().toLowerCase();
    return data.products.filter((p) => {
      if (!term) return true;
      const shopName = data.shops.find((shp) => shp.id === p.shop_id)?.name ?? "";
      return [p.model, p.category, p.product_type, shopName]
        .some((v) => (v ?? "").toLowerCase().includes(term));
    });
  }, [data, q]);

  // Processed Global Services
  const filteredServices = useMemo(() => {
    if (!data) return [];
    const term = q.trim().toLowerCase();
    return data.services.filter((svc) => {
      if (!term) return true;
      const shopName = data.shops.find((shp) => shp.id === svc.shop_id)?.name ?? "";
      const techName = data.technicians.find((t) => t.id === svc.technician_id)?.name ?? "";
      return [svc.customer_name, svc.phone, svc.service_type, shopName, techName]
        .some((v) => (v ?? "").toLowerCase().includes(term));
    });
  }, [data, q]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/admin-login", replace: true });
  }

  // Create New Shop or Link Existing User
  async function handleCreateShop() {
    if (!newShopName.trim()) {
      toast.error("Shop name is required");
      return;
    }
    if (!newShopEmail.trim()) {
      toast.error("Shop email is required");
      return;
    }
    setIsCreatingShop(true);
    try {
      const cleanEmail = newShopEmail.trim().toLowerCase();
      // Check if email is already in use by another shop
      if (data?.shops?.some((s) => s.email?.toLowerCase() === cleanEmail)) {
        toast.error(`A shop is already registered with email ${cleanEmail}. One email is allowed per shop.`);
        setIsCreatingShop(false);
        return;
      }

      const res = await adminCreateShopServerFn({
        data: {
          name: newShopName.trim(),
          email: cleanEmail,
          password: "password123",
          contact: newShopContact.trim() || "",
          gst: newShopGst.trim() || "",
          address: newShopAddress.trim() || "",
          logo_url: newShopLogo.trim() || "",
        },
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message || `Shop "${newShopName.trim()}" registered successfully`);
      await qc.invalidateQueries({ queryKey: ["admin-master-data"] });
      setIsAddShopOpen(false);
      setNewShopName("");
      setNewShopEmail("");
      setNewShopContact("");
      setNewShopGst("");
      setNewShopAddress("");
      setNewShopLogo("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create shop";
      toast.error(msg);
    } finally {
      setIsCreatingShop(false);
    }
  }

  // Edit Shop
  function openEditModal(shop: ShopRow) {
    setEditingShop(shop);
    setEditName(shop.name ?? "");
    setEditEmail(shop.email ?? "");
    setEditContact(shop.contact ?? "");
    setEditGst(shop.gst ?? "");
    setEditAddress(shop.address ?? "");
    setEditLogoUrl(shop.logo_url ?? "");
  }

  async function handleSaveShopEdit() {
    if (!editingShop) return;
    if (!editName.trim()) {
      toast.error("Shop name is required");
      return;
    }

    setIsSavingShop(true);
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
      await qc.invalidateQueries({ queryKey: ["admin-master-data"] });
      setEditingShop(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update shop";
      toast.error(msg);
    } finally {
      setIsSavingShop(false);
    }
  }

  // Delete Shop Cascade & User Account
  async function handleDeleteShop() {
    if (!deletingShop) return;
    setIsDeletingShop(true);
    try {
      const shopId = deletingShop.id;
      const shopName = deletingShop.name;

      const res = await adminDeleteShopServerFn({ data: { shopId } });
      if (!res.success) {
        // Fallback to client RPC or direct deletes
        await (supabase.rpc as any)("delete_shop_and_user", { _shop_id: shopId });
      }

      toast.success(`Shop "${shopName}" and user account deleted`);

      // Optimistically update React Query cache so row disappears instantly
      qc.setQueryData(["admin-master-data"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          shops: (oldData.shops ?? []).filter((s: any) => s.id !== shopId),
          sales: (oldData.sales ?? []).filter((s: any) => s.shop_id !== shopId),
          services: (oldData.services ?? []).filter((s: any) => s.shop_id !== shopId),
          serviceItems: (oldData.serviceItems ?? []).filter((s: any) => s.shop_id !== shopId),
          products: (oldData.products ?? []).filter((p: any) => p.shop_id !== shopId),
          technicians: (oldData.technicians ?? []).filter((t: any) => t.shop_id !== shopId),
        };
      });

      await qc.invalidateQueries({ queryKey: ["admin-master-data"] });
      setDeletingShop(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete shop";
      toast.error(msg);
    } finally {
      setIsDeletingShop(false);
    }
  }

  // Delete Individual Sale Record (Admin Action)
  async function handleDeleteSale(saleId: string, productName: string) {
    if (!confirm(`Are you sure you want to delete sale record for "${productName}"?`)) return;
    try {
      const { error } = await supabase.from("sales").delete().eq("id", saleId);
      if (error) throw error;
      toast.success("Sale record deleted");
      await qc.invalidateQueries({ queryKey: ["admin-master-data"] });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete sale");
    }
  }

  // Delete Individual Product Record (Admin Action)
  async function handleDeleteProduct(productId: string, model: string) {
    if (!confirm(`Are you sure you want to delete product "${model}"?`)) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;
      toast.success("Product deleted");
      await qc.invalidateQueries({ queryKey: ["admin-master-data"] });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete product");
    }
  }

  // Purge All Non-Admin Users
  async function handlePurgeNonAdminUsers() {
    setIsPurgingNonAdmin(true);
    try {
      const { data: count, error } = await (supabase.rpc as any)("purge_non_admin_users");
      if (error) throw error;
      toast.success(`Purged ${count ?? 0} non-admin user account(s) and their data`);
      await qc.invalidateQueries({ queryKey: ["admin-master-data"] });
      setIsPurgeModalOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to purge non-admin users");
    } finally {
      setIsPurgingNonAdmin(false);
    }
  }

  // System Stats
  const systemTotals = useMemo(() => {
    const salesSum = (data?.sales ?? []).reduce((a, r) => a + Number(r.price) * Number(r.qty), 0);
    const serviceItemsSum = (data?.serviceItems ?? []).reduce((a, r) => a + Number(r.price ?? 0), 0);
    return {
      shopsCount: data?.shops?.length ?? 0,
      totalSalesRevenue: salesSum,
      totalServiceRevenue: serviceItemsSum,
      totalProductsCount: data?.products?.length ?? 0,
    };
  }, [data]);

  return (
    <div className="aurora-bg min-h-screen p-4 lg:p-8 text-foreground">
      {/* Top Navigation Header */}
      <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl glass p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/20 text-accent shadow-inner">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black tracking-tight">STOCKERZ RO — SYSTEM ADMIN</h1>
            <p className="truncate text-xs text-muted-foreground">Full Master Control & Multi-Tenant Operations</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="danger" onClick={() => setIsPurgeModalOpen(true)}>
            <Trash2 className="h-4 w-4" /> Purge Non-Admin Users
          </Button>
          <Button variant="primary" onClick={() => setIsAddShopOpen(true)}>
            <Plus className="h-4 w-4" /> Add Shop
          </Button>
          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded-lg glass px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/10 transition"
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>

      <PageHeader title="Master Management" description="Monitor and control all registered RO showrooms, sales, stock, and service tickets." />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total Shops" value={String(systemTotals.shopsCount)} icon={Store} color="text-primary" />
        <Stat label="Global Sales Revenue" value={fmtMoney(systemTotals.totalSalesRevenue)} icon={ShoppingCart} color="text-emerald-400" />
        <Stat label="Global Service Revenue" value={fmtMoney(systemTotals.totalServiceRevenue)} icon={Wrench} color="text-amber-400" />
        <Stat label="Total Product SKUs" value={String(systemTotals.totalProductsCount)} icon={Package} color="text-purple-400" />
      </div>

      {/* Admin Control Tabs & Search */}
      <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl glass overflow-x-auto">
          {[
            { key: "shops", label: `Shops (${shopsList.length})`, icon: Store },
            { key: "sales", label: `All Sales (${filteredSales.length})`, icon: ShoppingCart },
            { key: "inventory", label: `Global Stock (${filteredProducts.length})`, icon: Package },
            { key: "services", label: `Service Calls (${filteredServices.length})`, icon: Wrench },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as ActiveTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Search Bar */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by keyword, shop, customer…"
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* TAB 1: SHOPS MANAGEMENT */}
      {activeTab === "shops" && (
        <div className="mt-6">
          <div className="hidden lg:block">
            <Card>
              {isLoading ? (
                <Empty text="Loading system shops…" />
              ) : shopsList.length === 0 ? (
                <Empty text="No shops found" />
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <Th>Shop Name & Owner</Th>
                      <Th>Contact</Th>
                      <Th>GSTIN</Th>
                      <Th>Products</Th>
                      <Th>Total Sales</Th>
                      <Th>Total Service</Th>
                      <Th>Joined Date</Th>
                      <Th className="text-right">Admin Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopsList.map((s) => (
                      <tr key={s.id}>
                        <Td className="uppercase-data">
                          <div className="flex items-center gap-2.5">
                            {s.logo_url ? (
                              <img src={s.logo_url} alt={`${s.name} logo`} className="h-9 w-9 rounded-xl object-cover" />
                            ) : (
                              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/20 text-primary">
                                <Store className="h-5 w-5" />
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-foreground">{upper(s.name)}</div>
                              <div className="text-xs normal-case text-muted-foreground">{s.email ?? "No email"}</div>
                            </div>
                          </div>
                        </Td>
                        <Td>{s.contact ?? "—"}</Td>
                        <Td className="uppercase-data">{s.gst ?? "—"}</Td>
                        <Td>
                          <span className="font-semibold">{s.productCount}</span>
                          {s.lowStock > 0 && <span className="ml-2 text-xs text-warning font-bold">({s.lowStock} low)</span>}
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
                              className="flex items-center gap-1 rounded-lg glass px-3 py-1.5 text-xs font-semibold text-primary hover:bg-white/10"
                            >
                              <Edit className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => setDeletingShop(s)}
                              className="flex items-center gap-1 rounded-lg bg-destructive/15 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/30"
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

          {/* Mobile Shops Cards */}
          <div className="space-y-3 lg:hidden">
            {isLoading && <Empty text="Loading shops…" />}
            {!isLoading && shopsList.length === 0 && <Empty text="No shops found" />}
            {shopsList.map((s) => (
              <Card key={s.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {s.logo_url ? (
                      <img src={s.logo_url} alt={`${s.name} logo`} className="h-10 w-10 rounded-xl object-cover" />
                    ) : (
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/20 text-primary">
                        <Store className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="truncate font-bold uppercase-data">{upper(s.name)}</div>
                      <div className="truncate text-xs text-muted-foreground">{s.email ?? "—"}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditModal(s)}
                      className="p-2 rounded-xl glass text-primary hover:bg-white/10"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingShop(s)}
                      className="p-2 rounded-xl bg-destructive/15 text-destructive hover:bg-destructive/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Meta label="Contact" value={s.contact ?? "—"} />
                  <Meta label="GSTIN" value={s.gst ?? "—"} />
                  <Meta label="Sales Revenue" value={`${fmtMoney(s.salesTotal)} (${s.salesCount})`} />
                  <Meta label="Service Revenue" value={`${fmtMoney(s.serviceTotal)} (${s.serviceCount})`} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL SALES MANAGEMENT */}
      {activeTab === "sales" && (
        <div className="mt-6">
          <Card>
            {isLoading ? (
              <Empty text="Loading sales records…" />
            ) : filteredSales.length === 0 ? (
              <Empty text="No sales records found" />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Shop</Th>
                    <Th>Customer</Th>
                    <Th>Model / Item</Th>
                    <Th>Qty</Th>
                    <Th>Total Amount</Th>
                    <Th>Payment</Th>
                    <Th>Date</Th>
                    <Th className="text-right">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => {
                    const shop = data?.shops?.find((shp) => shp.id === sale.shop_id);
                    return (
                      <tr key={sale.id}>
                        <Td className="font-semibold text-primary">{upper(shop?.name ?? "Unknown Shop")}</Td>
                        <Td>
                          <div className="font-medium">{sale.customer_name}</div>
                          <div className="text-xs text-muted-foreground">{sale.phone ?? "—"}</div>
                        </Td>
                        <Td className="font-medium">{sale.product_name}</Td>
                        <Td>{sale.qty}</Td>
                        <Td className="font-bold text-emerald-400">{fmtMoney(Number(sale.price) * Number(sale.qty))}</Td>
                        <Td className="uppercase text-xs font-semibold">{sale.source ?? "CASH"}</Td>
                        <Td>{sale.sale_date ? sale.sale_date.slice(0, 10) : sale.created_at.slice(0, 10)}</Td>
                        <Td className="text-right">
                          <button
                            onClick={() => handleDeleteSale(sale.id, sale.product_name)}
                            className="p-1.5 rounded-lg text-destructive hover:bg-destructive/20"
                            title="Delete sale entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Card>
        </div>
      )}

      {/* TAB 3: GLOBAL INVENTORY MANAGEMENT */}
      {activeTab === "inventory" && (
        <div className="mt-6">
          <Card>
            {isLoading ? (
              <Empty text="Loading global stock items…" />
            ) : filteredProducts.length === 0 ? (
              <Empty text="No products found in inventory" />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Shop</Th>
                    <Th>Product Model</Th>
                    <Th>Category</Th>
                    <Th>Stock Qty</Th>
                    <Th>Price</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((prod) => {
                    const shop = data?.shops?.find((shp) => shp.id === prod.shop_id);
                    const isLow = Number(prod.qty) <= Number(prod.low_stock_threshold);
                    return (
                      <tr key={prod.id}>
                        <Td className="font-semibold text-primary">{upper(shop?.name ?? "Unknown Shop")}</Td>
                        <Td className="font-bold">{prod.model}</Td>
                        <Td>{prod.category}</Td>
                        <Td className="font-mono text-base font-bold">{prod.qty}</Td>
                        <Td>{fmtMoney(prod.price)}</Td>
                        <Td>
                          {isLow ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs">
                              Low Stock ({prod.qty})
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-xs">
                              In Stock
                            </span>
                          )}
                        </Td>
                        <Td className="text-right">
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.model)}
                            className="p-1.5 rounded-lg text-destructive hover:bg-destructive/20"
                            title="Delete product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Card>
        </div>
      )}

      {/* TAB 4: SERVICE CALLS & TECHNICIANS */}
      {activeTab === "services" && (
        <div className="mt-6">
          <Card>
            {isLoading ? (
              <Empty text="Loading service tickets…" />
            ) : filteredServices.length === 0 ? (
              <Empty text="No service tickets found" />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Shop</Th>
                    <Th>Customer</Th>
                    <Th>Service Type</Th>
                    <Th>Assigned Tech</Th>
                    <Th>Service Date</Th>
                    <Th>Next Service (90d)</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map((svc) => {
                    const shop = data?.shops?.find((shp) => shp.id === svc.shop_id);
                    const tech = data?.technicians?.find((t) => t.id === svc.technician_id);
                    return (
                      <tr key={svc.id}>
                        <Td className="font-semibold text-primary">{upper(shop?.name ?? "Unknown Shop")}</Td>
                        <Td>
                          <div className="font-bold">{svc.customer_name}</div>
                          <div className="text-xs text-muted-foreground">{svc.phone ?? "—"}</div>
                        </Td>
                        <Td>
                          <span className="font-semibold">{svc.service_type}</span>
                          {svc.is_filter_change && (
                            <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                              Filter Replace
                            </span>
                          )}
                        </Td>
                        <Td>{tech ? tech.name : "Unassigned"}</Td>
                        <Td>{fmtDate(svc.service_date)}</Td>
                        <Td className="text-amber-400 font-medium font-mono">
                          {fmtDate(svc.next_service_date)}
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Card>
        </div>
      )}

      {/* MODAL 1: REGISTER NEW SHOP */}
      <Modal open={isAddShopOpen} onClose={() => setIsAddShopOpen(false)} title="Register New RO Showroom">
        <div className="space-y-4 pt-2">
          <Field label="Shop Name *">
            <Input
              value={newShopName}
              onChange={(e) => setNewShopName(e.target.value)}
              placeholder="e.g. Royal Aqua RO Sales & Service"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Contact Email">
              <Input
                type="email"
                value={newShopEmail}
                onChange={(e) => setNewShopEmail(e.target.value)}
                placeholder="owner@royalaqua.com"
              />
            </Field>

            <Field label="Phone Number">
              <Input
                maxLength={10}
                value={newShopContact}
                onChange={(e) => setNewShopContact(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                className="font-mono tracking-wider"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="GSTIN Number">
              <Input
                value={newShopGst}
                onChange={(e) => setNewShopGst(e.target.value)}
                placeholder="33AAAAA0000A1Z5"
              />
            </Field>

            <Field label="Logo URL">
              <Input
                value={newShopLogo}
                onChange={(e) => setNewShopLogo(e.target.value)}
                placeholder="https://domain.com/logo.png"
              />
            </Field>
          </div>

          <Field label="Showroom Address">
            <Input
              value={newShopAddress}
              onChange={(e) => setNewShopAddress(e.target.value)}
              placeholder="Full shop address"
            />
          </Field>

          <div className="mt-6 flex justify-end gap-3 border-t border-glass-border pt-4">
            <Button variant="ghost" onClick={() => setIsAddShopOpen(false)} disabled={isCreatingShop}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateShop} disabled={isCreatingShop}>
              {isCreatingShop ? "Creating..." : "Create Shop"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: EDIT SHOP DETAILS */}
      <Modal open={Boolean(editingShop)} onClose={() => setEditingShop(null)} title={`Edit Shop: ${editingShop?.name ?? ""}`}>
        <div className="space-y-4 pt-2">
          <Field label="Shop Name *">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Shop name"
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
                maxLength={10}
                value={editContact}
                onChange={(e) => setEditContact(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                className="font-mono tracking-wider"
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
                placeholder="Logo URL"
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
            <Button variant="ghost" onClick={() => setEditingShop(null)} disabled={isSavingShop}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveShopEdit} disabled={isSavingShop}>
              {isSavingShop ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: DELETE SHOP CONFIRMATION */}
      <Modal open={Boolean(deletingShop)} onClose={() => setDeletingShop(null)} title="Confirm Shop Deletion">
        <div className="pt-2">
          <div className="flex items-start gap-3 rounded-2xl bg-destructive/10 p-4 border border-destructive/20 text-destructive">
            <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-sm">Warning: Irreversible System Action</p>
              <p className="mt-1">
                You are about to delete <strong className="underline font-black">{deletingShop?.name}</strong>.
              </p>
              <p className="mt-1 font-semibold">
                This will permanently purge this shop along with all associated sales, products, technicians, service logs, and EMI records.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeletingShop(null)} disabled={isDeletingShop}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteShop} disabled={isDeletingShop}>
              {isDeletingShop ? "Deleting Shop..." : "Yes, Permanently Delete Shop"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: PURGE NON-ADMIN USERS CONFIRMATION */}
      <Modal open={isPurgeModalOpen} onClose={() => setIsPurgeModalOpen(false)} title="Purge Non-Admin Users">
        <div className="pt-2">
          <div className="flex items-start gap-3 rounded-2xl bg-destructive/10 p-4 border border-destructive/20 text-destructive">
            <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-sm">Purge All Non-Admin Users</p>
              <p className="mt-1">
                This action will delete <strong>ALL user accounts and shops</strong> in Supabase, keeping <strong>ONLY Admin accounts</strong>.
              </p>
              <p className="mt-1 font-semibold">
                All associated sales, services, products, and shop data for non-admin accounts will be permanently wiped.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsPurgeModalOpen(false)} disabled={isPurgingNonAdmin}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handlePurgeNonAdminUsers} disabled={isPurgingNonAdmin}>
              {isPurgingNonAdmin ? "Purging..." : "Yes, Purge Non-Admin Users"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  color = "text-foreground",
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="glass rounded-2xl p-4 flex items-center justify-between">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-1.5 text-xl font-black">{value}</div>
      </div>
      <div className={`grid h-10 w-10 place-items-center rounded-xl bg-white/5 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</div>
      <div className="truncate uppercase-data font-medium mt-0.5">{value}</div>
    </div>
  );
}
