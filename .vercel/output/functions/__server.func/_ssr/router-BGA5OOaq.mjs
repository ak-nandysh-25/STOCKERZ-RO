import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BDeaICjQ.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, r as QueryClientProvider, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { M as redirect, b as useRouter, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as objectType, t as enumType } from "../_libs/zod.mjs";
import { A as FileText, C as Package, G as Building2, d as Store, h as ShoppingCart, v as Search } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BGA5OOaq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var styles_default = "/assets/styles-CNd2po2S.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	window.__lovableReportRuntimeError?.({
		message,
		stack: error instanceof Error ? error.stack : void 0,
		filename: window.location.pathname
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$17 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "STOCKERZ RO — Stock & Service Management" },
			{
				name: "description",
				content: "Multi-shop stock, sales, service and EMI management for RO water purifier businesses."
			},
			{
				property: "og:title",
				content: "STOCKERZ RO"
			},
			{
				property: "og:description",
				content: "Stock, sales, service, EMI and reports for RO water purifier shops."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/stockerz-logo.png",
				type: "image/png"
			},
			{
				rel: "shortcut icon",
				href: "/stockerz-logo.png",
				type: "image/png"
			},
			{
				rel: "apple-touch-icon",
				href: "/stockerz-logo.png"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: `(function(){try{var t=localStorage.getItem("stockerz-theme");if(t==="light"||t==="dark"){document.documentElement.classList.add(t)}else{document.documentElement.classList.add("dark")}}catch(e){}})()` } })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$17.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			theme: "dark",
			position: "top-right",
			richColors: true
		})]
	});
}
var $$splitComponentImporter$15 = () => import("./routes-CJ48Sb8e.mjs");
var Route$16 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "STOCKERZ RO — Complete Business OS for RO Water Purifier Shops" },
		{
			name: "description",
			content: "Run your RO water purifier business end-to-end: stock inventory, 3-month filter replacement reminders, custom EMI plans, field technicians, GST invoices, and sales reports."
		},
		{
			property: "og:title",
			content: "STOCKERZ RO — Command Center for RO Shops"
		},
		{
			property: "og:description",
			content: "Automate filter change reminders, sales, EMI tracking, and stock management for your RO shop."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./route-ClY6tbv2.mjs");
var Route$15 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		if (typeof window !== "undefined") {
			const hasHash = window.location.hash.includes("access_token");
			const hasCode = window.location.search.includes("code=");
			if (hasHash || hasCode) {
				const { data: sessionData } = await supabase.auth.getSession();
				if (sessionData.session?.user) return { user: sessionData.session.user };
			}
		}
		const { data } = await supabase.auth.getUser();
		if (data?.user) return { user: data.user };
		const { data: sessionData } = await supabase.auth.getSession();
		if (sessionData?.session?.user) return { user: sessionData.session.user };
		throw redirect({ to: "/auth" });
	},
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./admin-B4hxObZy.mjs");
var Route$14 = createFileRoute("/admin")({
	ssr: false,
	head: () => ({ meta: [
		{ title: "System Admin Command Center — STOCKERZ RO" },
		{
			name: "description",
			content: "Admin management portal for shops, sales, stock, and service tickets."
		},
		{
			property: "og:title",
			content: "System Admin Command Center — STOCKERZ RO"
		},
		{
			property: "og:description",
			content: "Manage all shops, delete shop records, view global sales & stock."
		},
		{
			property: "og:type",
			content: "website"
		}
	] }),
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/admin-login" });
		const { data: isAdmin } = await supabase.rpc("has_role", {
			_user_id: data.user.id,
			_role: "admin"
		});
		if (!isAdmin) throw redirect({ to: "/admin-login" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./admin-login-7sR3MZ-e.mjs");
var Route$13 = createFileRoute("/admin-login")({
	ssr: false,
	head: () => ({ meta: [
		{ title: "Admin sign in — STOCKERZ RO" },
		{
			name: "description",
			content: "Administrator access to view every shop registered on STOCKERZ RO."
		},
		{
			property: "og:title",
			content: "Admin sign in — STOCKERZ RO"
		},
		{
			property: "og:description",
			content: "Administrator access to view every shop registered on STOCKERZ RO."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./auth-U5OC04SC.mjs");
var searchSchema = objectType({ mode: enumType([
	"login",
	"signup",
	"forgot"
]).optional() });
var Route$12 = createFileRoute("/auth")({
	ssr: false,
	head: () => ({ meta: [
		{ title: "Sign in — STOCKERZ RO" },
		{
			name: "description",
			content: "Sign in with your email and password or register your STOCKERZ RO shop."
		},
		{
			property: "og:title",
			content: "Sign in — STOCKERZ RO"
		},
		{
			property: "og:description",
			content: "Sign in with your email and password or register your STOCKERZ RO shop."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	validateSearch: searchSchema,
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./reset-password-aaszx2IB.mjs");
var Route$11 = createFileRoute("/reset-password")({
	ssr: false,
	head: () => ({ meta: [{ title: "Reset password — STOCKERZ RO" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./customers-DR9YZ72J.mjs");
var Route$10 = createFileRoute("/_authenticated/customers")({
	head: () => ({ meta: [{ title: "Customers — STOCKERZ RO" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./dashboard-DBQW0er1.mjs");
var Route$9 = createFileRoute("/_authenticated/dashboard")({
	head: () => ({ meta: [{ title: "Dashboard — STOCKERZ RO" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./emi-CUFv9maW.mjs");
var Route$8 = createFileRoute("/_authenticated/emi")({
	head: () => ({ meta: [{ title: "EMI Plans — STOCKERZ RO" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./reports-BxdxitW2.mjs");
var Route$7 = createFileRoute("/_authenticated/reports")({
	head: () => ({ meta: [{ title: "Reports — STOCKERZ RO" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
function Card({ className = "", children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `glass rounded-2xl p-5 ${className}`,
		children
	});
}
function PageHeader({ title, description, actions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6 flex flex-wrap items-end justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-bold tracking-tight md:text-3xl",
			children: title
		}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: description
		})] }), actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-2",
			children: actions
		})]
	});
}
function Button({ variant = "primary", className = "", ...props }) {
	const styles = {
		primary: "bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/25 active:scale-[0.98] transition-all",
		ghost: "hover:bg-white/5 text-foreground",
		outline: "glass hover:bg-white/10",
		danger: "bg-destructive text-destructive-foreground hover:brightness-110"
	}[variant];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		...props,
		className: `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${styles} ${className}`
	});
}
function Input(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		...props,
		className: `w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary ${props.className ?? ""}`
	});
}
function Select(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		...props,
		className: `w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary ${props.className ?? ""}`
	});
}
function Textarea(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		...props,
		className: `w-full rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary ${props.className ?? ""}`
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground",
			children: label
		}), children]
	});
}
function Table({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "glass overflow-hidden rounded-2xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
				className: "w-full text-sm",
				children
			})
		})
	});
}
function Th({ children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: `border-b border-glass-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground ${className}`,
		children
	});
}
function Td({ children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
		className: `border-b border-glass-border/60 px-4 py-3 uppercase-data ${className}`,
		children
	});
}
function Empty({ text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "py-16 text-center text-sm text-muted-foreground",
		children: text
	});
}
function Modal({ open, onClose, title, children }) {
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center bg-black/70 p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass w-full max-w-lg rounded-2xl p-6",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "text-muted-foreground hover:text-foreground",
					children: "✕"
				})]
			}), children]
		})
	});
}
function fmtMoney(n) {
	return "₹" + Number(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
function upper(s) {
	return (s ?? "").toString().toUpperCase();
}
function waLink(phone, text) {
	return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
var Route$6 = createFileRoute("/_authenticated/sales")({
	head: () => ({ meta: [{ title: "Sales & Office Entry — STOCKERZ RO" }] }),
	component: SalesPage
});
function SalesPage() {
	const [mainTab, setMainTab] = (0, import_react.useState)("showroom");
	const [showroomSubTab, setShowroomSubTab] = (0, import_react.useState)("stock");
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const qc = useQueryClient();
	const { data: sales = [] } = useQuery({
		queryKey: ["sales"],
		queryFn: async () => (await supabase.from("sales").select("*").order("sale_date", { ascending: false }).limit(200)).data ?? []
	});
	const showroomSales = (0, import_react.useMemo)(() => {
		return sales.filter((s) => s.source !== "office");
	}, [sales]);
	const officeSales = (0, import_react.useMemo)(() => {
		return sales.filter((s) => s.source === "office");
	}, [sales]);
	const filterBySearch = (list) => {
		if (!searchQuery.trim()) return list;
		const q = searchQuery.toLowerCase().trim();
		return list.filter((s) => (s.product_name ?? "").toLowerCase().includes(q) || (s.customer_name ?? "").toLowerCase().includes(q) || (s.phone ?? "").toLowerCase().includes(q) || (s.address ?? "").toLowerCase().includes(q));
	};
	const filteredShowroomSales = filterBySearch(showroomSales);
	const filteredOfficeSales = filterBySearch(officeSales);
	const filteredAllSales = filterBySearch(sales);
	const showroomTotal = showroomSales.reduce((acc, s) => acc + Number(s.price) * Number(s.qty), 0);
	const officeTotal = officeSales.reduce((acc, s) => acc + Number(s.price) * Number(s.qty), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Sales OS",
			description: "Separated entry and dedicated history tracking for Showroom and Office Sales"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-1.5 rounded-2xl glass p-1.5 overflow-x-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setMainTab("showroom"),
						className: `flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shrink-0 ${mainTab === "showroom" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "h-4 w-4" }),
							"Showroom Sales (",
							showroomSales.length,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setMainTab("office"),
						className: `flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shrink-0 ${mainTab === "office" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4" }),
							"Office Sales (",
							officeSales.length,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setMainTab("all"),
						className: `flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shrink-0 ${mainTab === "all" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4" }),
							"Combined History (",
							sales.length,
							")"
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative w-full sm:w-64",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: searchQuery,
					onChange: (e) => setSearchQuery(e.target.value),
					placeholder: "Search customer, phone, item...",
					className: "pl-9 text-xs"
				})]
			})]
		}),
		mainTab === "showroom" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
							children: "Showroom Sales Revenue"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-2xl font-black text-primary",
							children: fmtMoney(showroomTotal)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-10 w-10 place-items-center rounded-xl bg-primary/20 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "h-5 w-5" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
							children: "Total Showroom Entries"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 text-2xl font-black",
							children: [showroomSales.length, " Records"]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-5 w-5" })
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-base font-bold flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "h-4 w-4 text-primary" }), " New Showroom Sale Entry"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1 rounded-lg bg-white/5 p-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setShowroomSubTab("stock"),
							className: `rounded-md px-3 py-1 text-xs font-semibold transition ${showroomSubTab === "stock" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
							children: "From Inventory Stock"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setShowroomSubTab("manual"),
							className: `rounded-md px-3 py-1 text-xs font-semibold transition ${showroomSubTab === "manual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
							children: "Manual Entry"
						})]
					})]
				}), showroomSubTab === "stock" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockSaleForm, { onDone: () => qc.invalidateQueries({ queryKey: ["sales"] }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManualSaleForm, {
					source: "manual",
					onDone: () => qc.invalidateQueries({ queryKey: ["sales"] })
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "h-4 w-4 text-primary" }),
						" Showroom Sales History (",
						filteredShowroomSales.length,
						")"
					]
				}), filteredShowroomSales.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No showroom sales records found" }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Product / Item" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Source" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Qty" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Total" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Customer" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Phone" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "text-right",
						children: "Action"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredShowroomSales.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "hover:bg-white/5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: s.sale_date }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "font-semibold uppercase-data",
							children: s.product_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${s.source === "stock" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"}`,
							children: s.source === "stock" ? "Stock" : "Manual"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: s.qty }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "font-bold text-emerald-400",
							children: fmtMoney(Number(s.price) * Number(s.qty))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "uppercase-data",
							children: s.customer_name ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: s.phone ?? "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/invoice/$id",
								params: { id: s.id },
								className: "inline-flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/25 transition",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" }), " Invoice"]
							})
						})
					]
				}, s.id)) })] })] })
			]
		}),
		mainTab === "office" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
							children: "Office Total Sales Revenue"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-2xl font-black text-amber-400",
							children: fmtMoney(officeTotal)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-5 w-5" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
							children: "Office Sale Entries"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 text-2xl font-black",
							children: [officeSales.length, " Records"]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-10 w-10 place-items-center rounded-xl bg-purple-500/20 text-purple-400",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-5 w-5" })
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 border-b border-white/10 pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-base font-bold flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4 text-amber-400" }), " New Office Sale Entry"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Record corporate, B2B or office sales separately from showroom inventory"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManualSaleForm, {
					source: "office",
					onDone: () => qc.invalidateQueries({ queryKey: ["sales"] })
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4 text-amber-400" }),
						" Dedicated Office Sales History (",
						filteredOfficeSales.length,
						")"
					]
				}), filteredOfficeSales.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No office sales recorded yet" }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Date" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Item / Product" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Type" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Qty" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Total" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Customer / Company" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Contact" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Address / Place" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
						className: "text-right",
						children: "Action"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredOfficeSales.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "hover:bg-white/5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: s.sale_date }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "font-semibold uppercase-data",
							children: s.product_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "text-muted-foreground",
							children: s.product_type ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: s.qty }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "font-bold text-amber-400",
							children: fmtMoney(Number(s.price) * Number(s.qty))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "uppercase-data font-medium",
							children: s.customer_name ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: s.phone ?? "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "uppercase-data text-xs text-muted-foreground",
							children: s.address ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/invoice/$id",
								params: { id: s.id },
								className: "inline-flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/25 transition",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" }), " Invoice"]
							})
						})
					]
				}, s.id)) })] })] })
			]
		}),
		mainTab === "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4 text-primary" }),
					" Combined Sales History (",
					filteredAllSales.length,
					")"
				]
			}), filteredAllSales.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No sales history found" }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Date" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Product / Item" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Source" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Qty" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Total" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Customer" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Phone" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
					className: "text-right",
					children: "Action"
				})
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredAllSales.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "hover:bg-white/5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: s.sale_date }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						className: "font-semibold uppercase-data",
						children: s.product_name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${s.source === "office" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : s.source === "stock" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"}`,
						children: s.source === "office" ? "Office" : s.source === "stock" ? "Stock" : "Manual"
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: s.qty }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						className: "font-bold text-emerald-400",
						children: fmtMoney(Number(s.price) * Number(s.qty))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						className: "uppercase-data",
						children: s.customer_name ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: s.phone ?? "—" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/invoice/$id",
							params: { id: s.id },
							className: "inline-flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/25 transition",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" }), " Invoice"]
						})
					})
				]
			}, s.id)) })] })]
		})
	] });
}
function StockSaleForm({ onDone }) {
	const { data: products = [] } = useQuery({
		queryKey: ["products"],
		queryFn: async () => (await supabase.from("products").select("*").order("model")).data ?? []
	});
	const [f, setF] = (0, import_react.useState)({
		product_id: "",
		price: 0,
		qty: 1,
		customer_name: "",
		phone: "",
		address: "",
		sale_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
	});
	const selected = products.find((p) => p.id === f.product_id);
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
				sale_date: f.sale_date
			});
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("Stock sale recorded");
			setF({
				product_id: "",
				price: 0,
				qty: 1,
				customer_name: "",
				phone: "",
				address: "",
				sale_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
			});
			onDone();
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (e) => {
			e.preventDefault();
			submit.mutate();
		},
		className: "grid grid-cols-1 gap-3 md:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Product from stock",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					required: true,
					value: f.product_id,
					onChange: (e) => {
						const p = products.find((x) => x.id === e.target.value);
						setF({
							...f,
							product_id: e.target.value,
							price: p ? Number(p.price) : 0
						});
					},
					className: "w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Select product from inventory"
					}), products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: p.id,
						children: [
							String(p.model).toUpperCase(),
							" — ",
							p.qty,
							" in stock"
						]
					}, p.id))]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Price (₹)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "number",
					step: "0.01",
					min: 0,
					value: f.price,
					onChange: (e) => setF({
						...f,
						price: Number(e.target.value)
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: `Quantity${selected ? ` (max ${selected.qty})` : ""}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "number",
					min: 1,
					value: f.qty,
					onChange: (e) => setF({
						...f,
						qty: Number(e.target.value)
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Date",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "date",
					value: f.sale_date,
					onChange: (e) => setF({
						...f,
						sale_date: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Customer name (optional)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: f.customer_name,
					onChange: (e) => setF({
						...f,
						customer_name: e.target.value
					}),
					className: "uppercase-data"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Phone (optional)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: f.phone,
					onChange: (e) => setF({
						...f,
						phone: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Place / Address (optional)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: f.address,
					onChange: (e) => setF({
						...f,
						address: e.target.value
					}),
					className: "uppercase-data"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "md:col-span-2 flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: submit.isPending,
					children: submit.isPending ? "Recording..." : "Record Stock Sale"
				})
			})
		]
	});
}
function ManualSaleForm({ source, onDone }) {
	const [f, setF] = (0, import_react.useState)({
		product_name: "",
		product_type: "",
		price: 0,
		qty: 1,
		customer_name: "",
		phone: "",
		address: "",
		sale_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
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
				sale_date: f.sale_date
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
				sale_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
			});
			onDone();
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (e) => {
			e.preventDefault();
			submit.mutate();
		},
		className: "grid grid-cols-1 gap-3 md:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Product / Item name",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					required: true,
					value: f.product_name,
					onChange: (e) => setF({
						...f,
						product_name: e.target.value
					}),
					placeholder: source === "office" ? "e.g. COMMERCIAL RO PLANT 500 LPH" : "e.g. SPARE FILTERS KIT",
					className: "uppercase-data"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Product type",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: f.product_type,
					onChange: (e) => setF({
						...f,
						product_type: e.target.value
					}),
					placeholder: "e.g. Commercial / Industrial / Spare"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Price (₹)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "number",
					step: "0.01",
					min: 0,
					value: f.price,
					onChange: (e) => setF({
						...f,
						price: Number(e.target.value)
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Quantity",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "number",
					min: 1,
					value: f.qty,
					onChange: (e) => setF({
						...f,
						qty: Number(e.target.value)
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Customer / Company name (optional)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: f.customer_name,
					onChange: (e) => setF({
						...f,
						customer_name: e.target.value
					}),
					placeholder: "Customer or Organization Name",
					className: "uppercase-data"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Phone number (optional)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: f.phone,
					onChange: (e) => setF({
						...f,
						phone: e.target.value
					}),
					placeholder: "10-digit mobile number"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Place / Address (optional)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: f.address,
					onChange: (e) => setF({
						...f,
						address: e.target.value
					}),
					placeholder: "Installation site or office location",
					className: "uppercase-data"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Sale Date",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "date",
					value: f.sale_date,
					onChange: (e) => setF({
						...f,
						sale_date: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "md:col-span-2 flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: submit.isPending,
					children: submit.isPending ? "Recording..." : `Record ${source === "office" ? "Office" : "Manual"} Sale`
				})
			})
		]
	});
}
var $$splitComponentImporter$5 = () => import("./service-2oCF4zaV.mjs");
var Route$5 = createFileRoute("/_authenticated/service")({
	head: () => ({ meta: [{ title: "Service — STOCKERZ RO" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./settings-Drpmqzec.mjs");
var Route$4 = createFileRoute("/_authenticated/settings")({
	head: () => ({ meta: [{ title: "Shop Profile — STOCKERZ RO" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./stock-DDZdZIVn.mjs");
var Route$3 = createFileRoute("/_authenticated/stock")({
	head: () => ({ meta: [{ title: "Stock — STOCKERZ RO" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./technicians-BbFwU0G3.mjs");
var Route$2 = createFileRoute("/_authenticated/technicians")({
	head: () => ({ meta: [{ title: "Technicians — STOCKERZ RO" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./invoice._id-CGsh5pvs.mjs");
var Route$1 = createFileRoute("/_authenticated/invoice/$id")({
	head: () => ({ meta: [{ title: "Invoice — STOCKERZ RO" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./service-invoice._id-CD1AY9oh.mjs");
var Route = createFileRoute("/_authenticated/service-invoice/$id")({
	head: () => ({ meta: [{ title: "Service Invoice — STOCKERZ RO" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$16.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$17
});
var AuthenticatedRouteRoute = Route$15.update({
	id: "/_authenticated",
	getParentRoute: () => Route$17
});
var AdminRoute = Route$14.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$17
});
var AdminLoginRoute = Route$13.update({
	id: "/admin-login",
	path: "/admin-login",
	getParentRoute: () => Route$17
});
var AuthRoute = Route$12.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$17
});
var ResetPasswordRoute = Route$11.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => Route$17
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedCustomersRoute: Route$10.update({
		id: "/customers",
		path: "/customers",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedDashboardRoute: Route$9.update({
		id: "/dashboard",
		path: "/dashboard",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedEmiRoute: Route$8.update({
		id: "/emi",
		path: "/emi",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedReportsRoute: Route$7.update({
		id: "/reports",
		path: "/reports",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedSalesRoute: Route$6.update({
		id: "/sales",
		path: "/sales",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedServiceRoute: Route$5.update({
		id: "/service",
		path: "/service",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedSettingsRoute: Route$4.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedStockRoute: Route$3.update({
		id: "/stock",
		path: "/stock",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedTechniciansRoute: Route$2.update({
		id: "/technicians",
		path: "/technicians",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedInvoiceIdRoute: Route$1.update({
		id: "/invoice/$id",
		path: "/invoice/$id",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedServiceInvoiceIdRoute: Route.update({
		id: "/service-invoice/$id",
		path: "/service-invoice/$id",
		getParentRoute: () => AuthenticatedRouteRoute
	})
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AdminRoute,
	AdminLoginRoute,
	AuthRoute,
	ResetPasswordRoute
};
var routeTree = Route$17._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { Textarea as _, upper as a, Card as c, Input as d, Modal as f, Td as g, Table as h, fmtMoney as i, Empty as l, Select as m, Route as n, waLink as o, PageHeader as p, Route$1 as r, Button as s, router_exports as t, Field as u, Th as v };
