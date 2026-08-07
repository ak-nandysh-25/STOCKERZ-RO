import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BDeaICjQ.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as FileText, T as MessageCircle, b as Plus, l as Trash2 } from "../_libs/lucide-react.mjs";
import { a as upper, c as Card, d as Input, g as Td, h as Table, i as fmtMoney, l as Empty, m as Select, o as waLink, p as PageHeader, s as Button, u as Field, v as Th } from "./router-BGA5OOaq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/service-2oCF4zaV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ServicePage() {
	const qc = useQueryClient();
	const { data: services = [] } = useQuery({
		queryKey: ["services"],
		queryFn: async () => (await supabase.from("services").select("*, service_items(*)").order("service_date", { ascending: false }).limit(50)).data ?? []
	});
	const { data: technicians = [] } = useQuery({
		queryKey: ["technicians"],
		queryFn: async () => (await supabase.from("technicians").select("*")).data ?? []
	});
	const [items, setItems] = (0, import_react.useState)([{
		product_name: "",
		price: 0
	}]);
	const [f, setF] = (0, import_react.useState)({
		customer_name: "",
		phone: "",
		service_type: "Filter Change",
		technician_id: "",
		address: "",
		is_filter_change: true,
		service_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
	});
	const submit = useMutation({
		mutationFn: async () => {
			const shop = await supabase.from("shops").select("id").maybeSingle();
			const { data: created, error } = await supabase.from("services").insert({
				shop_id: shop.data.id,
				customer_name: f.customer_name.toUpperCase(),
				phone: f.phone || null,
				service_type: f.service_type.toUpperCase(),
				technician_id: f.technician_id || null,
				address: f.address.toUpperCase() || null,
				is_filter_change: f.is_filter_change,
				service_date: f.service_date
			}).select().single();
			if (error) throw error;
			const valid = items.filter((i) => i.product_name.trim());
			if (valid.length) {
				const { error: e2 } = await supabase.from("service_items").insert(valid.map((i) => ({
					service_id: created.id,
					shop_id: shop.data.id,
					product_name: i.product_name.toUpperCase(),
					price: i.price
				})));
				if (e2) throw e2;
			}
		},
		onSuccess: () => {
			toast.success("Service recorded");
			setF({
				...f,
				customer_name: "",
				phone: "",
				address: ""
			});
			setItems([{
				product_name: "",
				price: 0
			}]);
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const del = useMutation({
		mutationFn: async (id) => {
			await supabase.from("services").delete().eq("id", id);
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Service",
			description: "Record customer service jobs"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mb-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					submit.mutate();
				},
				className: "grid grid-cols-1 gap-3 md:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Customer name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							required: true,
							value: f.customer_name,
							onChange: (e) => setF({
								...f,
								customer_name: e.target.value
							}),
							className: "uppercase-data"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Phone",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							required: true,
							value: f.phone,
							onChange: (e) => setF({
								...f,
								phone: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Service type",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.service_type,
							onChange: (e) => setF({
								...f,
								service_type: e.target.value
							}),
							className: "uppercase-data"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Technician (optional)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: f.technician_id,
							onChange: (e) => setF({
								...f,
								technician_id: e.target.value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "—"
							}), technicians.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: t.id,
								children: t.name.toUpperCase()
							}, t.id))]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Place / Address",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.address,
							onChange: (e) => setF({
								...f,
								address: e.target.value
							}),
							className: "uppercase-data"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Date",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: f.service_date,
							onChange: (e) => setF({
								...f,
								service_date: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "md:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: f.is_filter_change,
								onChange: (e) => setF({
									...f,
									is_filter_change: e.target.checked
								})
							}), "Filter change (auto-sets next service date +3 months)"]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "md:col-span-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: "Products / Items"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setItems([...items, {
									product_name: "",
									price: 0
								}]),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), " Add item"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: items.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-[1fr_120px_40px] gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "PRODUCT NAME",
										value: it.product_name,
										onChange: (e) => {
											const c = [...items];
											c[i].product_name = e.target.value;
											setItems(c);
										},
										className: "uppercase-data"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										step: "0.01",
										placeholder: "Price",
										value: it.price,
										onChange: (e) => {
											const c = [...items];
											c[i].price = Number(e.target.value);
											setItems(c);
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setItems(items.filter((_, x) => x !== i)),
										className: "rounded p-2 text-destructive hover:bg-destructive/10",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
									})
								]
							}, i))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "md:col-span-2 flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: submit.isPending,
							children: "Record service"
						})
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground",
			children: "Recent services"
		}),
		services.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No services yet" }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Date" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Customer" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Type" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Items" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Total" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Next" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {})
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: services.map((s) => {
			const total = (s.service_items ?? []).reduce((sum, it) => sum + Number(it.price), 0);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "hover:bg-white/5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: s.service_date }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						className: "font-medium",
						children: s.customer_name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: s.service_type }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: s.service_items?.length ?? 0 }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: fmtMoney(total) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						className: s.next_service_date ? "text-warning" : "",
						children: s.next_service_date ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Td, {
						className: "text-right",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/service-invoice/$id",
								params: { id: s.id },
								className: "mr-2 inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-1 text-xs text-primary hover:bg-primary/25",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3 w-3" }), " Invoice"]
							}),
							s.phone && s.next_service_date && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: waLink(s.phone, `Hello ${upper(s.customer_name)}, your RO filter change is due on ${s.next_service_date}.`),
								target: "_blank",
								rel: "noreferrer",
								className: "mr-2 inline-flex rounded bg-success/15 p-1.5 text-success",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-3.5 w-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => confirm("Delete?") && del.mutate(s.id),
								className: "rounded p-1.5 text-destructive hover:bg-destructive/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
							})
						]
					})
				]
			}, s.id);
		}) })] })
	] });
}
//#endregion
export { ServicePage as component };
