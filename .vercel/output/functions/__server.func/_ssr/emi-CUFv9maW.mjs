import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BDeaICjQ.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as Trash2 } from "../_libs/lucide-react.mjs";
import { c as Card, d as Input, g as Td, h as Table, i as fmtMoney, l as Empty, p as PageHeader, s as Button, u as Field, v as Th } from "./router-BGA5OOaq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/emi-CUFv9maW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const qc = useQueryClient();
	const { data: rows = [] } = useQuery({
		queryKey: ["emi"],
		queryFn: async () => (await supabase.from("emi_plans").select("*").order("start_date", { ascending: false })).data ?? []
	});
	const [f, setF] = (0, import_react.useState)({
		customer_name: "",
		phone: "",
		model: "",
		total_amount: 0,
		down_payment: 0,
		tenure_months: 12,
		start_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
	});
	const add = useMutation({
		mutationFn: async () => {
			const shop = await supabase.from("shops").select("id").maybeSingle();
			const { error } = await supabase.from("emi_plans").insert({
				shop_id: shop.data.id,
				customer_name: f.customer_name.toUpperCase(),
				phone: f.phone || null,
				model: f.model.toUpperCase(),
				total_amount: f.total_amount,
				down_payment: f.down_payment,
				tenure_months: f.tenure_months,
				start_date: f.start_date
			});
			if (error) throw error;
		},
		onSuccess: () => {
			toast.success("EMI plan added");
			setF({
				...f,
				customer_name: "",
				phone: "",
				model: "",
				total_amount: 0,
				down_payment: 0
			});
			qc.invalidateQueries({ queryKey: ["emi"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const del = useMutation({
		mutationFn: async (id) => {
			await supabase.from("emi_plans").delete().eq("id", id);
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["emi"] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "EMI Plans",
			description: "Track installment plans"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mb-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					add.mutate();
				},
				className: "grid grid-cols-1 gap-3 md:grid-cols-3",
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
							value: f.phone,
							onChange: (e) => setF({
								...f,
								phone: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Machine / Model",
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Total amount",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							step: "0.01",
							min: 0,
							value: f.total_amount,
							onChange: (e) => setF({
								...f,
								total_amount: Number(e.target.value)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Down payment",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							step: "0.01",
							min: 0,
							value: f.down_payment,
							onChange: (e) => setF({
								...f,
								down_payment: Number(e.target.value)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Tenure (months)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: 1,
							value: f.tenure_months,
							onChange: (e) => setF({
								...f,
								tenure_months: Number(e.target.value)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Start date",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: f.start_date,
							onChange: (e) => setF({
								...f,
								start_date: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "md:col-span-3 flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: add.isPending,
							children: "Add EMI plan"
						})
					})
				]
			})
		}),
		rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No EMI plans yet" }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Customer" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Model" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Total" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Down" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Tenure" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Monthly" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Start" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {})
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((e) => {
			const monthly = (Number(e.total_amount) - Number(e.down_payment)) / Number(e.tenure_months);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "hover:bg-white/5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						className: "font-medium",
						children: e.customer_name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: e.model }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: fmtMoney(e.total_amount) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: fmtMoney(e.down_payment) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Td, { children: [e.tenure_months, " MO"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						className: "text-primary",
						children: fmtMoney(monthly)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: e.start_date }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => del.mutate(e.id),
							className: "rounded p-1.5 text-destructive hover:bg-destructive/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
						})
					})
				]
			}, e.id);
		}) })] })
	] });
}
//#endregion
export { Page as component };
