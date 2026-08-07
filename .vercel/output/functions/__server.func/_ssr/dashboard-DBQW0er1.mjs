import { t as supabase } from "./client-BDeaICjQ.mjs";
import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Package, T as MessageCircle, U as ChartNoAxesColumn, c as TrendingUp, h as ShoppingCart, r as Wrench } from "../_libs/lucide-react.mjs";
import { a as upper, c as Card, i as fmtMoney, o as waLink, p as PageHeader } from "./router-BGA5OOaq.mjs";
import { a as Bar, c as Tooltip, i as CartesianGrid, n as YAxis, r as XAxis, s as ResponsiveContainer, t as BarChart } from "../_libs/recharts+[...].mjs";
import { t as motion } from "../_libs/framer-motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-DBQW0er1.js
var import_jsx_runtime = require_jsx_runtime();
function CustomTooltip({ active, payload, label }) {
	if (!active || !payload || !payload.length) return null;
	const salesVal = payload.find((p) => p.dataKey === "sales")?.value ?? 0;
	const officeVal = payload.find((p) => p.dataKey === "office")?.value ?? 0;
	const serviceVal = payload.find((p) => p.dataKey === "service")?.value ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-white/10 bg-[#0e1017] p-3.5 shadow-2xl backdrop-blur-md min-w-[150px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm font-bold text-white mb-2",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-1.5 text-xs font-medium",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2.5 w-2.5 rounded-sm bg-[#8b5cf6]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-slate-300",
							children: "Sales ₹"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-white",
						children: salesVal.toLocaleString("en-IN")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2.5 w-2.5 rounded-sm bg-[#10b981]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-slate-300",
							children: "Office ₹"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-white",
						children: officeVal.toLocaleString("en-IN")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2.5 w-2.5 rounded-sm bg-[#f59e0b]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-slate-300",
							children: "Service ₹"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-white",
						children: serviceVal.toLocaleString("en-IN")
					})]
				})
			]
		})]
	});
}
function Dashboard() {
	const { data: shop } = useQuery({
		queryKey: ["shop"],
		queryFn: async () => {
			const { data } = await supabase.from("shops").select("*").maybeSingle();
			return data;
		}
	});
	const { data: stats } = useQuery({
		queryKey: ["dashboard"],
		queryFn: async () => {
			const now = /* @__PURE__ */ new Date();
			const year = now.getFullYear();
			const month = now.getMonth();
			const daysInMonth = new Date(year, month + 1, 0).getDate();
			const todayStr = now.toISOString().slice(0, 10);
			const monthStartStr = `${year}-${String(month + 1).padStart(2, "0")}-01`;
			const in30 = /* @__PURE__ */ new Date();
			in30.setDate(in30.getDate() + 30);
			const [salesRes, productsRes, servicesRes, remindersRes, emisRes] = await Promise.all([
				supabase.from("sales").select("*"),
				supabase.from("products").select("*"),
				supabase.from("services").select("*, service_items(*)").order("service_date", { ascending: false }),
				supabase.from("services").select("*").eq("is_filter_change", true).not("next_service_date", "is", null).lte("next_service_date", in30.toISOString().slice(0, 10)).order("next_service_date"),
				supabase.from("emi_plans").select("*")
			]);
			const salesRows = salesRes.data ?? [];
			const productsRows = productsRes.data ?? [];
			const servicesRows = servicesRes.data ?? [];
			const totalSalesAmt = (rows) => rows.reduce((s, r) => s + Number(r.price || 0) * Number(r.qty || 1), 0);
			const todaySalesAmt = totalSalesAmt(salesRows.filter((r) => r.sale_date === todayStr));
			const monthSalesAmt = totalSalesAmt(salesRows.filter((r) => r.sale_date >= monthStartStr));
			const dailyMap = {};
			for (let d = 1; d <= daysInMonth; d++) dailyMap[d] = {
				day: d,
				sales: 0,
				office: 0,
				service: 0
			};
			salesRows.forEach((r) => {
				if (!r.sale_date) return;
				const dObj = new Date(r.sale_date);
				if (dObj.getFullYear() === year && dObj.getMonth() === month) {
					const day = dObj.getDate();
					const amt = Number(r.price || 0) * Number(r.qty || 1);
					if (r.source === "office") dailyMap[day].office += amt;
					else dailyMap[day].sales += amt;
				}
			});
			servicesRows.forEach((s) => {
				if (!s.service_date) return;
				const dObj = new Date(s.service_date);
				if (dObj.getFullYear() === year && dObj.getMonth() === month) {
					const day = dObj.getDate();
					const itemsTotal = (s.service_items ?? []).reduce((acc, item) => acc + Number(item.price || 0), 0);
					dailyMap[day].service += itemsTotal;
				}
			});
			const dailyRevenueChart = Object.values(dailyMap);
			const todaySalesList = salesRows.filter((r) => r.sale_date === todayStr).map((r) => ({
				id: r.id,
				type: r.source === "office" ? "Office" : "Sales",
				name: r.product_name,
				customer: r.customer_name || "Direct Sale",
				amount: Number(r.price || 0) * Number(r.qty || 1)
			}));
			const todayServiceList = servicesRows.filter((s) => s.service_date === todayStr).map((s) => {
				const amt = (s.service_items ?? []).reduce((acc, item) => acc + Number(item.price || 0), 0);
				return {
					id: s.id,
					type: "Service",
					name: s.service_type || "Service",
					customer: s.customer_name,
					amount: amt
				};
			});
			const todayTransactions = [...todaySalesList, ...todayServiceList];
			const lowStock = productsRows.filter((p) => Number(p.qty) <= Number(p.low_stock_threshold ?? 2));
			return {
				todaySales: todaySalesAmt,
				monthSales: monthSalesAmt,
				productCount: productsRows.length,
				lowStock,
				dailyRevenueChart,
				todayTransactions,
				recentServices: servicesRows.slice(0, 5),
				reminders: remindersRes.data ?? [],
				emis: emisRes.data ?? []
			};
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Dashboard",
			description: "Overview of your shop performance"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
					icon: ShoppingCart,
					label: "Today's Sales",
					value: fmtMoney(stats?.todaySales ?? 0),
					accent: "text-primary"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
					icon: TrendingUp,
					label: "Month Sales",
					value: fmtMoney(stats?.monthSales ?? 0),
					accent: "text-accent"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
					icon: Package,
					label: "Low Stock",
					value: String(stats?.lowStock.length ?? 0),
					accent: "text-warning"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
					icon: Wrench,
					label: "Reminders Due",
					value: String(stats?.reminders.length ?? 0),
					accent: "text-success"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "bg-[#0e1017] border-white/10 rounded-2xl p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-4 flex items-center justify-between",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartNoAxesColumn, { className: "h-4 w-4 text-purple-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-bold text-white tracking-wide",
							children: "Daily Revenue"
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-64 sm:h-72 w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: stats?.dailyRevenueChart ?? [],
							margin: {
								top: 10,
								right: 10,
								left: -20,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "rgba(255,255,255,0.05)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "day",
									tickLine: false,
									axisLine: { stroke: "rgba(255,255,255,0.1)" },
									tick: {
										fill: "#64748b",
										fontSize: 11
									},
									interval: 1
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tickLine: false,
									axisLine: false,
									tick: {
										fill: "#64748b",
										fontSize: 11
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomTooltip, {}),
									cursor: { fill: "rgba(255, 255, 255, 0.05)" }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "sales",
									name: "Sales ₹",
									stackId: "a",
									fill: "#8b5cf6",
									radius: [
										0,
										0,
										0,
										0
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "office",
									name: "Office ₹",
									stackId: "a",
									fill: "#10b981",
									radius: [
										0,
										0,
										0,
										0
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "service",
									name: "Service ₹",
									stackId: "a",
									fill: "#f59e0b",
									radius: [
										4,
										4,
										0,
										0
									]
								})
							]
						})
					})
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "bg-[#0e1017] border-white/10 rounded-2xl p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-semibold uppercase tracking-wide text-muted-foreground",
						children: "Filter Reminders"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/service",
						className: "text-xs text-primary hover:underline",
						children: "View all"
					})]
				}), stats?.reminders.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2 text-sm",
					children: stats.reminders.slice(0, 5).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 uppercase-data",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium text-white",
							children: s.customer_name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground",
							children: ["Due ", s.next_service_date]
						})] }), s.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: waLink(s.phone, `Hello ${upper(s.customer_name)}, your RO filter change is due on ${s.next_service_date}. Please book a service.`),
							target: "_blank",
							rel: "noreferrer",
							className: "rounded-lg bg-success/20 p-2 text-success hover:bg-success/30",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-4 w-4" })
						})]
					}, s.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No reminders due in next 30 days"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "bg-[#0e1017] border-white/10 rounded-2xl p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground",
					children: "Recent Services"
				}), stats?.recentServices.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2 text-sm",
					children: stats.recentServices.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between rounded-lg bg-white/5 px-3 py-2 uppercase-data",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium text-white",
							children: s.customer_name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: s.service_type
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: s.service_date
						})]
					}, s.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No services yet"
				})]
			})]
		})
	] });
}
function Kpi({ icon: Icon, label, value, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 10
		},
		animate: {
			opacity: 1,
			y: 0
		},
		className: "glass rounded-2xl p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `h-4 w-4 ${accent}` })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 text-2xl font-bold",
			children: value
		})]
	});
}
//#endregion
export { Dashboard as component };
