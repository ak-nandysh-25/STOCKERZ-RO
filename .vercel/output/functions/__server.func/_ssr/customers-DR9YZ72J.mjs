import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BDeaICjQ.mjs";
import { a as require_jsx_runtime, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as FileText, T as MessageCircle, V as ChevronLeft, a as User, h as ShoppingCart, r as Wrench, v as Search, x as Phone } from "../_libs/lucide-react.mjs";
import { a as upper, c as Card, d as Input, i as fmtMoney, l as Empty, o as waLink, p as PageHeader } from "./router-BGA5OOaq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/customers-DR9YZ72J.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CustomersPage() {
	const [q, setQ] = (0, import_react.useState)("");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const { data } = useQuery({
		queryKey: ["customers-all"],
		queryFn: async () => {
			const [sales, services] = await Promise.all([supabase.from("sales").select("*").order("sale_date", { ascending: false }), supabase.from("services").select("*, service_items(*)").order("service_date", { ascending: false })]);
			return {
				sales: sales.data ?? [],
				services: services.data ?? []
			};
		}
	});
	const customers = (0, import_react.useMemo)(() => {
		if (!data) return [];
		const map = /* @__PURE__ */ new Map();
		const key = (n, p) => p?.replace(/\D/g, "") || (n ?? "").trim().toLowerCase() || "__unknown";
		for (const s of data.sales) {
			if (!s.customer_name && !s.phone) continue;
			const k = key(s.customer_name, s.phone);
			const cur = map.get(k) ?? {
				key: k,
				name: s.customer_name ?? "—",
				phone: s.phone,
				address: s.address,
				lastDate: s.sale_date,
				salesCount: 0,
				servicesCount: 0,
				totalSpent: 0
			};
			cur.name = cur.name === "—" ? s.customer_name ?? "—" : cur.name;
			cur.phone = cur.phone ?? s.phone;
			cur.address = cur.address ?? s.address;
			cur.salesCount += 1;
			cur.totalSpent += Number(s.price) * Number(s.qty);
			if (s.sale_date > cur.lastDate) cur.lastDate = s.sale_date;
			map.set(k, cur);
		}
		for (const s of data.services) {
			const k = key(s.customer_name, s.phone);
			const cur = map.get(k) ?? {
				key: k,
				name: s.customer_name,
				phone: s.phone,
				address: s.address,
				lastDate: s.service_date,
				salesCount: 0,
				servicesCount: 0,
				totalSpent: 0
			};
			cur.phone = cur.phone ?? s.phone;
			cur.address = cur.address ?? s.address;
			cur.servicesCount += 1;
			cur.totalSpent += (s.service_items ?? []).reduce((a, it) => a + Number(it.price), 0);
			if (s.service_date > cur.lastDate) cur.lastDate = s.service_date;
			map.set(k, cur);
		}
		return Array.from(map.values()).sort((a, b) => b.lastDate.localeCompare(a.lastDate));
	}, [data]);
	const filtered = (0, import_react.useMemo)(() => {
		const term = q.trim().toLowerCase();
		if (!term) return customers;
		return customers.filter((c) => c.name.toLowerCase().includes(term) || (c.phone ?? "").toLowerCase().includes(term) || (c.address ?? "").toLowerCase().includes(term));
	}, [q, customers]);
	const active = selected ? customers.find((c) => c.key === selected) : null;
	if (active && data) {
		const sales = data.sales.filter((s) => {
			return (s.phone?.replace(/\D/g, "") || (s.customer_name ?? "").trim().toLowerCase() || "__unknown") === active.key;
		});
		const services = data.services.filter((s) => {
			return (s.phone?.replace(/\D/g, "") || (s.customer_name ?? "").trim().toLowerCase() || "__unknown") === active.key;
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => setSelected(null),
				className: "mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" }), " Back to customers"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "truncate text-xl font-bold uppercase-data md:text-2xl",
							children: active.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 space-y-0.5 text-sm text-muted-foreground uppercase-data",
							children: [active.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3 w-3" }),
									" ",
									active.phone
								]
							}), active.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: active.address })]
						})]
					}), active.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: waLink(active.phone, `Hello ${upper(active.name)},`),
						target: "_blank",
						rel: "noreferrer",
						className: "inline-flex items-center gap-1 rounded-lg bg-success/20 px-3 py-2 text-sm text-success hover:bg-success/30",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-4 w-4" }), " WhatsApp"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid grid-cols-3 gap-2 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Sales",
							value: String(active.salesCount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Services",
							value: String(active.servicesCount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Total",
							value: fmtMoney(active.totalSpent)
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
				children: "Sales history"
			}),
			sales.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No sales" })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 space-y-2",
				children: sales.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "!p-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1 uppercase-data",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "truncate font-medium",
								children: s.product_name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground",
								children: [
									s.sale_date,
									" • QTY ",
									s.qty,
									" • ",
									s.source
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold",
								children: fmtMoney(Number(s.price) * Number(s.qty))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/invoice/$id",
								params: { id: s.id },
								className: "mt-1 inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-1 text-xs text-primary hover:bg-primary/25",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3 w-3" }), " Invoice"]
							})]
						})]
					})
				}, s.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
				children: "Service history"
			}),
			services.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No services" }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: services.map((s) => {
					const total = (s.service_items ?? []).reduce((a, it) => a + Number(it.price), 0);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "!p-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1 uppercase-data",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate font-medium",
									children: s.service_type
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: [
										s.service_date,
										" • ",
										s.service_items?.length ?? 0,
										" ITEMS ",
										s.next_service_date ? `• NEXT ${s.next_service_date}` : ""
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold",
									children: fmtMoney(total)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/service-invoice/$id",
									params: { id: s.id },
									className: "mt-1 inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-1 text-xs text-primary hover:bg-primary/25",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3 w-3" }), " Invoice"]
								})]
							})]
						})
					}, s.id);
				})
			})
		] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Customers",
			description: "Search customer records across sales and services"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Search by name, phone or place…",
				className: "pl-9"
			})]
		}),
		filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: q ? "No matches" : "No customers yet" }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2 sm:grid-cols-2",
			children: filtered.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setSelected(c.key),
				className: "glass rounded-2xl p-4 text-left transition hover:bg-white/10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 uppercase-data",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate font-semibold",
									children: c.name
								})]
							}),
							c.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex items-center gap-1 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3 w-3" }),
									" ",
									c.phone
								]
							}),
							c.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-0.5 truncate text-xs text-muted-foreground uppercase-data",
								children: c.address
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-bold",
							children: fmtMoney(c.totalSpent)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex items-center justify-end gap-2 text-[10px] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-3 w-3" }), c.salesCount]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-3 w-3" }), c.servicesCount]
							})]
						})]
					})]
				})
			}, c.key))
		})
	] });
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-white/5 p-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-0.5 text-sm font-bold",
			children: value
		})]
	});
}
//#endregion
export { CustomersPage as component };
