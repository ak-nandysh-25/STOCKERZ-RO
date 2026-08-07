import { t as supabase } from "./client-BDeaICjQ.mjs";
import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { c as Card, g as Td, h as Table, i as fmtMoney, p as PageHeader, v as Th } from "./router-BGA5OOaq.mjs";
import { a as Bar, c as Tooltip, i as CartesianGrid, n as YAxis, o as Cell, r as XAxis, s as ResponsiveContainer, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-BxdxitW2.js
var import_jsx_runtime = require_jsx_runtime();
var PALETTE = [
	"#38bdf8",
	"#a78bfa",
	"#f472b6",
	"#facc15",
	"#34d399",
	"#fb923c",
	"#60a5fa",
	"#f87171",
	"#2dd4bf",
	"#c084fc",
	"#4ade80",
	"#fbbf24"
];
function Page() {
	const { data } = useQuery({
		queryKey: ["reports"],
		queryFn: async () => {
			const [sales, services, products] = await Promise.all([
				supabase.from("sales").select("sale_date, price, qty, source"),
				supabase.from("services").select("service_date"),
				supabase.from("products").select("*")
			]);
			const salesRows = sales.data ?? [];
			const salesDaily = {};
			const salesMonthly = {};
			const officeDaily = {};
			const officeMonthly = {};
			for (const r of salesRows) {
				const total = Number(r.price) * Number(r.qty);
				const m = r.sale_date.slice(0, 7);
				if (r.source === "office") {
					officeDaily[r.sale_date] = (officeDaily[r.sale_date] ?? 0) + total;
					officeMonthly[m] = (officeMonthly[m] ?? 0) + total;
				} else {
					salesDaily[r.sale_date] = (salesDaily[r.sale_date] ?? 0) + total;
					salesMonthly[m] = (salesMonthly[m] ?? 0) + total;
				}
			}
			const serviceDaily = {};
			const serviceMonthly = {};
			for (const s of services.data ?? []) {
				serviceDaily[s.service_date] = (serviceDaily[s.service_date] ?? 0) + 1;
				serviceMonthly[s.service_date.slice(0, 7)] = (serviceMonthly[s.service_date.slice(0, 7)] ?? 0) + 1;
			}
			const days = (o) => Object.entries(o).sort().slice(-7).map(([d, v]) => ({
				d: d.slice(5),
				v
			}));
			const months = (o) => Object.entries(o).sort().slice(-6).map(([m, v]) => ({
				d: m,
				v
			}));
			return {
				salesDays: days(salesDaily),
				salesMonths: months(salesMonthly),
				serviceDays: days(serviceDaily),
				serviceMonths: months(serviceMonthly),
				officeDays: days(officeDaily),
				officeMonths: months(officeMonthly),
				products: products.data ?? []
			};
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Reports",
			description: "Sales, service and office sales analytics"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chart, {
					title: "Sales — last 7 days",
					rows: data?.salesDays ?? [],
					offset: 0
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chart, {
					title: "Sales — monthly",
					rows: data?.salesMonths ?? [],
					offset: 3
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chart, {
					title: "Service — last 7 days",
					rows: data?.serviceDays ?? [],
					offset: 4
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chart, {
					title: "Service — monthly",
					rows: data?.serviceMonths ?? [],
					offset: 6
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chart, {
					title: "Office sales — last 7 days",
					rows: data?.officeDays ?? [],
					offset: 2
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chart, {
					title: "Office sales — monthly",
					rows: data?.officeMonths ?? [],
					offset: 8
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground",
			children: "Remaining stock"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Model" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Category" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Type" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Qty" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Price" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Value" })
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (data?.products ?? []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
			className: "hover:bg-white/5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
					className: "font-medium",
					children: p.model
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: p.category }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: p.product_type ?? "—" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: p.qty }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: fmtMoney(p.price) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: fmtMoney(Number(p.price) * Number(p.qty)) })
			]
		}, p.id)) })] })
	] });
}
function Chart({ title, rows, offset }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: "mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-64",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
				data: rows,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, { stroke: "rgba(255,255,255,0.05)" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "d",
						tick: {
							fill: "var(--color-muted-foreground)",
							fontSize: 11
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: {
						fill: "var(--color-muted-foreground)",
						fontSize: 11
					} }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
						background: "var(--color-card)",
						border: "1px solid var(--color-glass-border)"
					} }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
						dataKey: "v",
						radius: [
							4,
							4,
							0,
							0
						],
						children: rows.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: PALETTE[(i + offset) % PALETTE.length] }, i))
					})
				]
			})
		})
	})] });
}
//#endregion
export { Page as component };
