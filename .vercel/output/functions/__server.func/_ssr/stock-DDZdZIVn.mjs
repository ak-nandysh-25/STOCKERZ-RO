import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BDeaICjQ.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { S as Pencil, b as Plus, l as Trash2, s as TriangleAlert } from "../_libs/lucide-react.mjs";
import { c as Card, d as Input, f as Modal, g as Td, h as Table, i as fmtMoney, l as Empty, m as Select, p as PageHeader, s as Button, u as Field, v as Th } from "./router-BGA5OOaq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stock-DDZdZIVn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StockPage() {
	const qc = useQueryClient();
	const [modal, setModal] = (0, import_react.useState)(void 0);
	const { data: products = [] } = useQuery({
		queryKey: ["products"],
		queryFn: async () => {
			const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("products").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["products"] });
			toast.success("Deleted");
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Stock",
			description: "Manage products, filters and spares",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => setModal(null),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add product"]
			})
		}),
		products.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No products yet. Add your first item." }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Model" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Category" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Type" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Qty" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Price" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {})
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
			className: "hover:bg-white/5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
					className: "font-medium",
					children: p.model
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: p.category }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: p.product_type ?? "—" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: p.qty <= p.low_stock_threshold ? "inline-flex items-center gap-1 text-warning" : "",
					children: [p.qty <= p.low_stock_threshold && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3 w-3" }), p.qty]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: fmtMoney(p.price) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Td, {
					className: "text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "mr-2 rounded p-1.5 hover:bg-white/10",
						onClick: () => setModal(p),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "rounded p-1.5 text-destructive hover:bg-destructive/10",
						onClick: () => confirm("Delete?") && del.mutate(p.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
					})]
				})
			]
		}, p.id)) })] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductModal, {
			open: modal !== void 0,
			product: modal ?? null,
			onClose: () => setModal(void 0)
		})
	] });
}
function ProductModal({ open, product, onClose }) {
	const qc = useQueryClient();
	const [f, setF] = (0, import_react.useState)({
		model: product?.model ?? "",
		category: product?.category ?? "machine",
		product_type: product?.product_type ?? "",
		qty: product?.qty ?? 0,
		price: product?.price ?? 0,
		low_stock_threshold: product?.low_stock_threshold ?? 5
	});
	const save = useMutation({
		mutationFn: async () => {
			const shop_id = (await supabase.from("shops").select("id").maybeSingle()).data?.id;
			if (!shop_id) throw new Error("No shop");
			const payload = {
				...f,
				model: f.model.toUpperCase(),
				product_type: f.product_type || null,
				shop_id
			};
			if (product) {
				const { error } = await supabase.from("products").update(payload).eq("id", product.id);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("products").insert(payload);
				if (error) throw error;
			}
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["products"] });
			toast.success("Saved");
			onClose();
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		open,
		onClose,
		title: product ? "Edit product" : "Add product",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: (e) => {
				e.preventDefault();
				save.mutate();
			},
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Model name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						required: true,
						value: f.model,
						onChange: (e) => setF({
							...f,
							model: e.target.value
						}),
						className: "uppercase-data"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Category",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: f.category,
							onChange: (e) => setF({
								...f,
								category: e.target.value
							}),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "machine",
									children: "Machine"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "filter",
									children: "Filter"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "spare",
									children: "Spare"
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Product type",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.product_type ?? "",
							onChange: (e) => setF({
								...f,
								product_type: e.target.value
							}),
							placeholder: "e.g. Membrane"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Quantity",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 0,
								value: f.qty,
								onChange: (e) => setF({
									...f,
									qty: Number(e.target.value)
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Price",
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
							label: "Low stock alert",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 0,
								value: f.low_stock_threshold,
								onChange: (e) => setF({
									...f,
									low_stock_threshold: Number(e.target.value)
								})
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2 pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						onClick: onClose,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: save.isPending,
						children: "Save"
					})]
				})
			]
		})
	});
}
//#endregion
export { StockPage as component };
