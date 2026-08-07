import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BDeaICjQ.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Package, D as LogOut, b as Plus, d as Store, f as SquarePen, h as ShoppingCart, l as Trash2, r as Wrench, s as TriangleAlert, v as Search } from "../_libs/lucide-react.mjs";
import { a as upper, c as Card, d as Input, f as Modal, g as Td, h as Table, i as fmtMoney, l as Empty, p as PageHeader, s as Button, u as Field, v as Th } from "./router-BGA5OOaq.mjs";
import { t as ThemeToggle } from "./theme-toggle-Du9IrxTh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-B4hxObZy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminControlCenter() {
	const nav = useNavigate();
	const qc = useQueryClient();
	const [activeTab, setActiveTab] = (0, import_react.useState)("shops");
	const [q, setQ] = (0, import_react.useState)("");
	const [isAddShopOpen, setIsAddShopOpen] = (0, import_react.useState)(false);
	const [newShopName, setNewShopName] = (0, import_react.useState)("");
	const [newShopEmail, setNewShopEmail] = (0, import_react.useState)("");
	const [newShopContact, setNewShopContact] = (0, import_react.useState)("");
	const [newShopGst, setNewShopGst] = (0, import_react.useState)("");
	const [newShopAddress, setNewShopAddress] = (0, import_react.useState)("");
	const [newShopLogo, setNewShopLogo] = (0, import_react.useState)("");
	const [isCreatingShop, setIsCreatingShop] = (0, import_react.useState)(false);
	const [editingShop, setEditingShop] = (0, import_react.useState)(null);
	const [editName, setEditName] = (0, import_react.useState)("");
	const [editEmail, setEditEmail] = (0, import_react.useState)("");
	const [editContact, setEditContact] = (0, import_react.useState)("");
	const [editGst, setEditGst] = (0, import_react.useState)("");
	const [editAddress, setEditAddress] = (0, import_react.useState)("");
	const [editLogoUrl, setEditLogoUrl] = (0, import_react.useState)("");
	const [isSavingShop, setIsSavingShop] = (0, import_react.useState)(false);
	const [deletingShop, setDeletingShop] = (0, import_react.useState)(null);
	const [isDeletingShop, setIsDeletingShop] = (0, import_react.useState)(false);
	const [isPurgeModalOpen, setIsPurgeModalOpen] = (0, import_react.useState)(false);
	const [isPurgingNonAdmin, setIsPurgingNonAdmin] = (0, import_react.useState)(false);
	const { data, isLoading } = useQuery({
		queryKey: ["admin-master-data"],
		queryFn: async () => {
			const [shops, sales, services, serviceItems, products, technicians] = await Promise.all([
				supabase.from("shops").select("*").order("created_at", { ascending: false }),
				supabase.from("sales").select("*").order("created_at", { ascending: false }),
				supabase.from("services").select("*").order("created_at", { ascending: false }),
				supabase.from("service_items").select("*"),
				supabase.from("products").select("*").order("model", { ascending: true }),
				supabase.from("technicians").select("*")
			]);
			return {
				shops: shops.data ?? [],
				sales: sales.data ?? [],
				services: services.data ?? [],
				serviceItems: serviceItems.data ?? [],
				products: products.data ?? [],
				technicians: technicians.data ?? []
			};
		}
	});
	const shopsList = (0, import_react.useMemo)(() => {
		if (!data) return [];
		const term = q.trim().toLowerCase();
		return data.shops.map((s) => {
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
				lowStock: products.filter((p) => Number(p.qty) <= Number(p.low_stock_threshold)).length
			};
		}).filter((s) => !term ? true : [
			s.name,
			s.email,
			s.contact,
			s.gst,
			s.address
		].some((v) => (v ?? "").toLowerCase().includes(term)));
	}, [data, q]);
	const filteredSales = (0, import_react.useMemo)(() => {
		if (!data) return [];
		const term = q.trim().toLowerCase();
		return data.sales.filter((s) => {
			if (!term) return true;
			const shopName = data.shops.find((shp) => shp.id === s.shop_id)?.name ?? "";
			return [
				s.product_name,
				s.customer_name,
				s.phone,
				s.source,
				shopName
			].some((v) => (v ?? "").toLowerCase().includes(term));
		});
	}, [data, q]);
	const filteredProducts = (0, import_react.useMemo)(() => {
		if (!data) return [];
		const term = q.trim().toLowerCase();
		return data.products.filter((p) => {
			if (!term) return true;
			const shopName = data.shops.find((shp) => shp.id === p.shop_id)?.name ?? "";
			return [
				p.model,
				p.category,
				p.product_type,
				shopName
			].some((v) => (v ?? "").toLowerCase().includes(term));
		});
	}, [data, q]);
	const filteredServices = (0, import_react.useMemo)(() => {
		if (!data) return [];
		const term = q.trim().toLowerCase();
		return data.services.filter((svc) => {
			if (!term) return true;
			const shopName = data.shops.find((shp) => shp.id === svc.shop_id)?.name ?? "";
			const techName = data.technicians.find((t) => t.id === svc.technician_id)?.name ?? "";
			return [
				svc.customer_name,
				svc.phone,
				svc.service_type,
				shopName,
				techName
			].some((v) => (v ?? "").toLowerCase().includes(term));
		});
	}, [data, q]);
	async function signOut() {
		await qc.cancelQueries();
		qc.clear();
		await supabase.auth.signOut();
		nav({
			to: "/admin-login",
			replace: true
		});
	}
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
			const { error } = await supabase.rpc("admin_create_shop", {
				_name: newShopName.trim(),
				_email: newShopEmail.trim(),
				_password: "password123",
				_contact: newShopContact.trim() || null,
				_gst: newShopGst.trim() || null,
				_address: newShopAddress.trim() || null,
				_logo_url: newShopLogo.trim() || null
			});
			if (error) {
				console.warn("RPC admin_create_shop notice:", error.message);
				const currentUser = (await supabase.auth.getUser()).data.user;
				const { error: fallbackErr } = await supabase.from("shops").upsert({
					name: newShopName.trim(),
					email: newShopEmail.trim() || null,
					contact: newShopContact.trim() || null,
					gst: newShopGst.trim() || null,
					address: newShopAddress.trim() || null,
					logo_url: newShopLogo.trim() || null,
					owner_id: currentUser?.id ?? "00000000-0000-0000-0000-000000000000"
				}, { onConflict: "owner_id" });
				if (fallbackErr) throw fallbackErr;
			}
			toast.success(`Shop "${newShopName.trim()}" registered successfully`);
			await qc.invalidateQueries({ queryKey: ["admin-master-data"] });
			setIsAddShopOpen(false);
			setNewShopName("");
			setNewShopEmail("");
			setNewShopContact("");
			setNewShopGst("");
			setNewShopAddress("");
			setNewShopLogo("");
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to create shop";
			toast.error(msg);
		} finally {
			setIsCreatingShop(false);
		}
	}
	function openEditModal(shop) {
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
			const { error } = await supabase.from("shops").update({
				name: editName.trim(),
				email: editEmail.trim() || null,
				contact: editContact.trim() || null,
				gst: editGst.trim() || null,
				address: editAddress.trim() || null,
				logo_url: editLogoUrl.trim() || null,
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", editingShop.id);
			if (error) throw error;
			toast.success(`Shop "${editName.trim()}" updated successfully`);
			await qc.invalidateQueries({ queryKey: ["admin-master-data"] });
			setEditingShop(null);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to update shop";
			toast.error(msg);
		} finally {
			setIsSavingShop(false);
		}
	}
	async function handleDeleteShop() {
		if (!deletingShop) return;
		setIsDeletingShop(true);
		try {
			const shopId = deletingShop.id;
			const shopName = deletingShop.name;
			const { error: rpcErr } = await supabase.rpc("delete_shop_and_user", { _shop_id: shopId });
			if (rpcErr) {
				console.warn("RPC delete_shop_and_user fallback:", rpcErr.message);
				await Promise.allSettled([
					supabase.from("sales").delete().eq("shop_id", shopId),
					supabase.from("services").delete().eq("shop_id", shopId),
					supabase.from("service_items").delete().eq("shop_id", shopId),
					supabase.from("products").delete().eq("shop_id", shopId),
					supabase.from("emi_plans").delete().eq("shop_id", shopId),
					supabase.from("technicians").delete().eq("shop_id", shopId)
				]);
				const { error: delErr } = await supabase.from("shops").delete().eq("id", shopId);
				if (delErr) throw delErr;
			}
			toast.success(`Shop "${shopName}" and user account deleted`);
			qc.setQueryData(["admin-master-data"], (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					shops: (oldData.shops ?? []).filter((s) => s.id !== shopId),
					sales: (oldData.sales ?? []).filter((s) => s.shop_id !== shopId),
					services: (oldData.services ?? []).filter((s) => s.shop_id !== shopId),
					serviceItems: (oldData.serviceItems ?? []).filter((s) => s.shop_id !== shopId),
					products: (oldData.products ?? []).filter((p) => p.shop_id !== shopId),
					technicians: (oldData.technicians ?? []).filter((t) => t.shop_id !== shopId)
				};
			});
			await qc.invalidateQueries({ queryKey: ["admin-master-data"] });
			setDeletingShop(null);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to delete shop";
			toast.error(msg);
		} finally {
			setIsDeletingShop(false);
		}
	}
	async function handleDeleteSale(saleId, productName) {
		if (!confirm(`Are you sure you want to delete sale record for "${productName}"?`)) return;
		try {
			const { error } = await supabase.from("sales").delete().eq("id", saleId);
			if (error) throw error;
			toast.success("Sale record deleted");
			await qc.invalidateQueries({ queryKey: ["admin-master-data"] });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to delete sale");
		}
	}
	async function handleDeleteProduct(productId, model) {
		if (!confirm(`Are you sure you want to delete product "${model}"?`)) return;
		try {
			const { error } = await supabase.from("products").delete().eq("id", productId);
			if (error) throw error;
			toast.success("Product deleted");
			await qc.invalidateQueries({ queryKey: ["admin-master-data"] });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to delete product");
		}
	}
	async function handlePurgeNonAdminUsers() {
		setIsPurgingNonAdmin(true);
		try {
			const { data: count, error } = await supabase.rpc("purge_non_admin_users");
			if (error) throw error;
			toast.success(`Purged ${count ?? 0} non-admin user account(s) and their data`);
			await qc.invalidateQueries({ queryKey: ["admin-master-data"] });
			setIsPurgeModalOpen(false);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to purge non-admin users");
		} finally {
			setIsPurgingNonAdmin(false);
		}
	}
	const systemTotals = (0, import_react.useMemo)(() => {
		const salesSum = (data?.sales ?? []).reduce((a, r) => a + Number(r.price) * Number(r.qty), 0);
		const serviceItemsSum = (data?.serviceItems ?? []).reduce((a, r) => a + Number(r.price ?? 0), 0);
		return {
			shopsCount: data?.shops.length ?? 0,
			totalSalesRevenue: salesSum,
			totalServiceRevenue: serviceItemsSum,
			totalProductsCount: data?.products.length ?? 0
		};
	}, [data]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "aurora-bg min-h-screen p-4 lg:p-8 text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-center justify-between gap-3 rounded-2xl glass p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/stockerz-logo.png",
						alt: "STOCKERZ RO",
						className: "h-11 w-11 shrink-0 rounded-xl object-contain shadow-md"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "truncate text-lg font-black tracking-tight",
							children: "STOCKERZ RO — SYSTEM ADMIN"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: "Full Master Control & Multi-Tenant Operations"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "danger",
							onClick: () => setIsPurgeModalOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" }), " Purge Non-Admin Users"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "primary",
							onClick: () => setIsAddShopOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Shop"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: signOut,
							className: "flex items-center gap-2 rounded-lg glass px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/10 transition",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline",
									children: "Sign out"
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Master Management",
				description: "Monitor and control all registered RO showrooms, sales, stock, and service tickets."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Total Shops",
						value: String(systemTotals.shopsCount),
						icon: Store,
						color: "text-primary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Global Sales Revenue",
						value: fmtMoney(systemTotals.totalSalesRevenue),
						icon: ShoppingCart,
						color: "text-emerald-400"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Global Service Revenue",
						value: fmtMoney(systemTotals.totalServiceRevenue),
						icon: Wrench,
						color: "text-amber-400"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Total Product SKUs",
						value: String(systemTotals.totalProductsCount),
						icon: Package,
						color: "text-purple-400"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2 p-1.5 rounded-2xl glass overflow-x-auto",
					children: [
						{
							key: "shops",
							label: `Shops (${shopsList.length})`,
							icon: Store
						},
						{
							key: "sales",
							label: `All Sales (${filteredSales.length})`,
							icon: ShoppingCart
						},
						{
							key: "inventory",
							label: `Global Stock (${filteredProducts.length})`,
							icon: Package
						},
						{
							key: "services",
							label: `Service Calls (${filteredServices.length})`,
							icon: Wrench
						}
					].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setActiveTab(tab.key),
						className: `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${activeTab === tab.key ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(tab.icon, { className: "h-3.5 w-3.5" }), tab.label]
					}, tab.key))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative min-w-[240px] sm:w-72",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Filter by keyword, shop, customer…",
						className: "pl-9 text-xs"
					})]
				})]
			}),
			activeTab === "shops" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden lg:block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "Loading system shops…" }) : shopsList.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No shops found" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Shop Name & Owner" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Contact" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "GSTIN" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Products" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Total Sales" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Total Service" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Joined Date" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "text-right",
							children: "Admin Actions"
						})
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: shopsList.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "uppercase-data",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2.5",
								children: [s.logo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: s.logo_url,
									alt: `${s.name} logo`,
									className: "h-9 w-9 rounded-xl object-cover"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid h-9 w-9 place-items-center rounded-xl bg-primary/20 text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-bold text-foreground",
									children: upper(s.name)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs normal-case text-muted-foreground",
									children: s.email ?? "No email"
								})] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: s.contact ?? "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "uppercase-data",
							children: s.gst ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Td, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: s.productCount
						}), s.lowStock > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ml-2 text-xs text-warning font-bold",
							children: [
								"(",
								s.lowStock,
								" low)"
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Td, { children: [
							fmtMoney(s.salesTotal),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: [
									"(",
									s.salesCount,
									")"
								]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Td, { children: [
							fmtMoney(s.serviceTotal),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: [
									"(",
									s.serviceCount,
									")"
								]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: s.created_at.slice(0, 10) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-end gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => openEditModal(s),
									className: "flex items-center gap-1 rounded-lg glass px-3 py-1.5 text-xs font-semibold text-primary hover:bg-white/10",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "h-3.5 w-3.5" }), " Edit"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setDeletingShop(s),
									className: "flex items-center gap-1 rounded-lg bg-destructive/15 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/30",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), " Delete"]
								})]
							})
						})
					] }, s.id)) })] }) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 lg:hidden",
					children: [
						isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "Loading shops…" }),
						!isLoading && shopsList.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No shops found" }),
						shopsList.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 min-w-0",
								children: [s.logo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: s.logo_url,
									alt: `${s.name} logo`,
									className: "h-10 w-10 rounded-xl object-cover"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid h-10 w-10 place-items-center rounded-xl bg-primary/20 text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "truncate font-bold uppercase-data",
										children: upper(s.name)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "truncate text-xs text-muted-foreground",
										children: s.email ?? "—"
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => openEditModal(s),
									className: "p-2 rounded-xl glass text-primary hover:bg-white/10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "h-4 w-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setDeletingShop(s),
									className: "p-2 rounded-xl bg-destructive/15 text-destructive hover:bg-destructive/30",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid grid-cols-2 gap-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
									label: "Contact",
									value: s.contact ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
									label: "GSTIN",
									value: s.gst ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
									label: "Sales Revenue",
									value: `${fmtMoney(s.salesTotal)} (${s.salesCount})`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
									label: "Service Revenue",
									value: `${fmtMoney(s.serviceTotal)} (${s.serviceCount})`
								})
							]
						})] }, s.id))
					]
				})]
			}),
			activeTab === "sales" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "Loading sales records…" }) : filteredSales.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No sales records found" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Shop" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Customer" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Model / Item" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Qty" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Total Amount" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Payment" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "text-right",
						children: "Action"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredSales.map((sale) => {
					const shop = data?.shops.find((shp) => shp.id === sale.shop_id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "font-semibold text-primary",
							children: upper(shop?.name ?? "Unknown Shop")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Td, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium",
							children: sale.customer_name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: sale.phone ?? "—"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "font-medium",
							children: sale.product_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: sale.qty }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "font-bold text-emerald-400",
							children: fmtMoney(Number(sale.price) * Number(sale.qty))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "uppercase text-xs font-semibold",
							children: sale.source ?? "CASH"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: sale.sale_date ? sale.sale_date.slice(0, 10) : sale.created_at.slice(0, 10) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => handleDeleteSale(sale.id, sale.product_name),
								className: "p-1.5 rounded-lg text-destructive hover:bg-destructive/20",
								title: "Delete sale entry",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
							})
						})
					] }, sale.id);
				}) })] }) })
			}),
			activeTab === "inventory" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "Loading global stock items…" }) : filteredProducts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No products found in inventory" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Shop" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Product Model" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Category" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Stock Qty" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Price" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "text-right",
						children: "Action"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredProducts.map((prod) => {
					const shop = data?.shops.find((shp) => shp.id === prod.shop_id);
					const isLow = Number(prod.qty) <= Number(prod.low_stock_threshold);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "font-semibold text-primary",
							children: upper(shop?.name ?? "Unknown Shop")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "font-bold",
							children: prod.model
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: prod.category }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "font-mono text-base font-bold",
							children: prod.qty
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: fmtMoney(prod.price) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: isLow ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs",
							children: [
								"Low Stock (",
								prod.qty,
								")"
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-xs",
							children: "In Stock"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => handleDeleteProduct(prod.id, prod.model),
								className: "p-1.5 rounded-lg text-destructive hover:bg-destructive/20",
								title: "Delete product",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
							})
						})
					] }, prod.id);
				}) })] }) })
			}),
			activeTab === "services" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "Loading service tickets…" }) : filteredServices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No service tickets found" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Shop" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Customer" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Service Type" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Assigned Tech" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Service Date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Next Service (90d)" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredServices.map((svc) => {
					const shop = data?.shops.find((shp) => shp.id === svc.shop_id);
					const tech = data?.technicians.find((t) => t.id === svc.technician_id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "font-semibold text-primary",
							children: upper(shop?.name ?? "Unknown Shop")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Td, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-bold",
							children: svc.customer_name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: svc.phone ?? "—"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Td, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: svc.service_type
						}), svc.is_filter_change && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300",
							children: "Filter Replace"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: tech ? tech.name : "Unassigned" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: svc.service_date.slice(0, 10) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "text-amber-400 font-medium",
							children: svc.next_service_date ? svc.next_service_date.slice(0, 10) : "—"
						})
					] }, svc.id);
				}) })] }) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: isAddShopOpen,
				onClose: () => setIsAddShopOpen(false),
				title: "Register New RO Showroom",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 pt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Shop Name *",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: newShopName,
								onChange: (e) => setNewShopName(e.target.value),
								placeholder: "e.g. Royal Aqua RO Sales & Service"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Contact Email",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "email",
									value: newShopEmail,
									onChange: (e) => setNewShopEmail(e.target.value),
									placeholder: "owner@royalaqua.com"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Phone Number",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: newShopContact,
									onChange: (e) => setNewShopContact(e.target.value),
									placeholder: "+91 98765 43210"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "GSTIN Number",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: newShopGst,
									onChange: (e) => setNewShopGst(e.target.value),
									placeholder: "33AAAAA0000A1Z5"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Logo URL",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: newShopLogo,
									onChange: (e) => setNewShopLogo(e.target.value),
									placeholder: "https://domain.com/logo.png"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Showroom Address",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: newShopAddress,
								onChange: (e) => setNewShopAddress(e.target.value),
								placeholder: "Full shop address"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex justify-end gap-3 border-t border-glass-border pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => setIsAddShopOpen(false),
								disabled: isCreatingShop,
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "primary",
								onClick: handleCreateShop,
								disabled: isCreatingShop,
								children: isCreatingShop ? "Creating..." : "Create Shop"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: Boolean(editingShop),
				onClose: () => setEditingShop(null),
				title: `Edit Shop: ${editingShop?.name ?? ""}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 pt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Shop Name *",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: editName,
								onChange: (e) => setEditName(e.target.value),
								placeholder: "Shop name"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Email Address",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "email",
									value: editEmail,
									onChange: (e) => setEditEmail(e.target.value),
									placeholder: "shop@example.com"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Contact Phone",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: editContact,
									onChange: (e) => setEditContact(e.target.value),
									placeholder: "+91 98765 43210"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "GSTIN Number",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: editGst,
									onChange: (e) => setEditGst(e.target.value),
									placeholder: "33AAAAA0000A1Z5"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Logo URL",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: editLogoUrl,
									onChange: (e) => setEditLogoUrl(e.target.value),
									placeholder: "Logo URL"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Showroom Address",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: editAddress,
								onChange: (e) => setEditAddress(e.target.value),
								placeholder: "Full shop address"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex justify-end gap-3 border-t border-glass-border pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => setEditingShop(null),
								disabled: isSavingShop,
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "primary",
								onClick: handleSaveShopEdit,
								disabled: isSavingShop,
								children: isSavingShop ? "Saving..." : "Save Changes"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: Boolean(deletingShop),
				onClose: () => setDeletingShop(null),
				title: "Confirm Shop Deletion",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3 rounded-2xl bg-destructive/10 p-4 border border-destructive/20 text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-6 w-6 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs leading-relaxed",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-bold text-sm",
									children: "Warning: Irreversible System Action"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1",
									children: [
										"You are about to delete ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "underline font-black",
											children: deletingShop?.name
										}),
										"."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-semibold",
									children: "This will permanently purge this shop along with all associated sales, products, technicians, service logs, and EMI records."
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex justify-end gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setDeletingShop(null),
							disabled: isDeletingShop,
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "danger",
							onClick: handleDeleteShop,
							disabled: isDeletingShop,
							children: isDeletingShop ? "Deleting Shop..." : "Yes, Permanently Delete Shop"
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
				open: isPurgeModalOpen,
				onClose: () => setIsPurgeModalOpen(false),
				title: "Purge Non-Admin Users",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3 rounded-2xl bg-destructive/10 p-4 border border-destructive/20 text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-6 w-6 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs leading-relaxed",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-bold text-sm",
									children: "Purge All Non-Admin Users"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1",
									children: [
										"This action will delete ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "ALL user accounts and shops" }),
										" in Supabase, keeping ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "ONLY Admin accounts" }),
										"."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-semibold",
									children: "All associated sales, services, products, and shop data for non-admin accounts will be permanently wiped."
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex justify-end gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setIsPurgeModalOpen(false),
							disabled: isPurgingNonAdmin,
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "danger",
							onClick: handlePurgeNonAdminUsers,
							disabled: isPurgingNonAdmin,
							children: isPurgingNonAdmin ? "Purging..." : "Yes, Purge Non-Admin Users"
						})]
					})]
				})
			})
		]
	});
}
function Stat({ label, value, icon: Icon, color = "text-foreground" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass rounded-2xl p-4 flex items-center justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1.5 text-xl font-black",
			children: value
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `grid h-10 w-10 place-items-center rounded-xl bg-white/5 ${color}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
		})]
	});
}
function Meta({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-white/5 px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] uppercase tracking-wide text-muted-foreground font-semibold",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "truncate uppercase-data font-medium mt-0.5",
			children: value
		})]
	});
}
//#endregion
export { AdminControlCenter as component };
