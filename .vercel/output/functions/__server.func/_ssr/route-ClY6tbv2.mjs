import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BDeaICjQ.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { f as Outlet, g as Link, l as useLocation, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Package, D as LogOut, E as Menu, F as CreditCard, I as Contact, W as ChartColumn, _ as Settings, h as ShoppingCart, i as Users, k as LayoutDashboard, n as X, r as Wrench, z as CircleAlert } from "../_libs/lucide-react.mjs";
import { a as upper } from "./router-BGA5OOaq.mjs";
import { t as ThemeToggle } from "./theme-toggle-Du9IrxTh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-ClY6tbv2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NAV = [
	{
		to: "/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/stock",
		label: "Stock",
		icon: Package
	},
	{
		to: "/sales",
		label: "Sales",
		icon: ShoppingCart
	},
	{
		to: "/service",
		label: "Service",
		icon: Wrench
	},
	{
		to: "/customers",
		label: "Customers",
		icon: Contact
	},
	{
		to: "/technicians",
		label: "Technicians",
		icon: Users
	},
	{
		to: "/emi",
		label: "EMI Plans",
		icon: CreditCard
	},
	{
		to: "/reports",
		label: "Reports",
		icon: ChartColumn
	},
	{
		to: "/settings",
		label: "Shop Profile",
		icon: Settings
	}
];
function Shell() {
	const nav = useNavigate();
	const qc = useQueryClient();
	const loc = useLocation();
	const [open, setOpen] = (0, import_react.useState)(false);
	const { data: shop } = useQuery({
		queryKey: ["shop"],
		queryFn: async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return null;
			const { data: existingShop } = await supabase.from("shops").select("*").maybeSingle();
			if (existingShop) return existingShop;
			console.warn("No shop profile found for active user. Signing out.");
			await qc.cancelQueries();
			qc.clear();
			await supabase.auth.signOut();
			toast.error("Shop account not found or has been deleted. Sign in blocked.");
			nav({
				to: "/auth",
				replace: true
			});
			return null;
		}
	});
	async function signOut() {
		await qc.cancelQueries();
		qc.clear();
		await supabase.auth.signOut();
		nav({
			to: "/auth",
			replace: true
		});
	}
	const isIncomplete = !shop || !shop.name || shop.name.toUpperCase() === "MY SHOP" || !shop.contact || !shop.address;
	const shopTitle = shop?.name ? upper(shop.name) : "MY SHOP";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "aurora-bg min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between border-b border-glass-border bg-background/60 px-4 py-3 backdrop-blur lg:hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/dashboard",
				className: "flex items-center gap-2 min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: shop?.logo_url || "/stockerz-logo.png",
					alt: shopTitle,
					className: "h-8 w-8 rounded-lg object-contain border border-white/10"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-bold truncate text-sm uppercase-data",
					children: shopTitle
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setOpen((v) => !v),
					className: "rounded p-1.5 glass",
					children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-5 w-5" })
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: `fixed inset-y-0 left-0 z-40 w-64 border-r border-glass-border bg-background/80 backdrop-blur-xl transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden items-center justify-between px-6 py-6 lg:flex min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: shop?.logo_url || "/stockerz-logo.png",
								alt: shopTitle,
								className: "h-9 w-9 shrink-0 rounded-lg object-contain border border-white/10"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold tracking-tight truncate block text-sm uppercase-data",
									children: shopTitle
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] text-muted-foreground block truncate",
									children: "RO Showroom OS"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "space-y-1 px-3 pb-4 pt-4 lg:pt-0",
						children: [NAV.map((n) => {
							const active = loc.pathname.startsWith(n.to);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: n.to,
								onClick: () => setOpen(false),
								className: `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-primary/15 text-primary font-semibold" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(n.icon, { className: "h-4 w-4" }),
									" ",
									n.label
								]
							}, n.to);
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: signOut,
							className: "mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), " Sign out"]
						})]
					})]
				}),
				open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "fixed inset-0 z-30 bg-black/60 lg:hidden",
					onClick: () => setOpen(false)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "flex-1 p-4 lg:p-8 min-w-0",
					children: [isIncomplete && !loc.pathname.includes("/settings") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 backdrop-blur-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-5 w-5 shrink-0 text-amber-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-bold text-sm",
									children: "Complete Your Shop Profile"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground mt-0.5",
									children: "Add your business name, contact phone, logo, and GSTIN so your printed invoices display your showroom details."
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/settings",
							className: "rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:brightness-110 transition shadow-md",
							children: "Fill Shop Profile →"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})]
				})
			]
		})]
	});
}
//#endregion
export { Shell as component };
