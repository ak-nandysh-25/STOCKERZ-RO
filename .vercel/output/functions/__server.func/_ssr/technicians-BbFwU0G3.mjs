import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BDeaICjQ.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as Trash2 } from "../_libs/lucide-react.mjs";
import { c as Card, d as Input, g as Td, h as Table, l as Empty, p as PageHeader, s as Button, u as Field, v as Th } from "./router-BGA5OOaq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/technicians-BbFwU0G3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const qc = useQueryClient();
	const { data: rows = [] } = useQuery({
		queryKey: ["technicians"],
		queryFn: async () => (await supabase.from("technicians").select("*").order("name")).data ?? []
	});
	const [f, setF] = (0, import_react.useState)({
		name: "",
		phone: "",
		specialization: ""
	});
	const add = useMutation({
		mutationFn: async () => {
			const shop = await supabase.from("shops").select("id").maybeSingle();
			const { error } = await supabase.from("technicians").insert({
				shop_id: shop.data.id,
				name: f.name.toUpperCase(),
				phone: f.phone || null,
				specialization: f.specialization.toUpperCase() || null
			});
			if (error) throw error;
		},
		onSuccess: () => {
			setF({
				name: "",
				phone: "",
				specialization: ""
			});
			qc.invalidateQueries({ queryKey: ["technicians"] });
			toast.success("Added");
		}
	});
	const del = useMutation({
		mutationFn: async (id) => {
			await supabase.from("technicians").delete().eq("id", id);
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: ["technicians"] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Technicians",
			description: "Manage your service team"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mb-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					add.mutate();
				},
				className: "grid grid-cols-1 gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							required: true,
							value: f.name,
							onChange: (e) => setF({
								...f,
								name: e.target.value
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
						label: "Specialization",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: f.specialization,
							onChange: (e) => setF({
								...f,
								specialization: e.target.value
							}),
							className: "uppercase-data"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							disabled: add.isPending,
							children: "Add technician"
						})
					})
				]
			})
		}),
		rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "No technicians added" }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Name" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Phone" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Specialization" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {})
		] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
			className: "hover:bg-white/5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
					className: "font-medium",
					children: t.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: t.phone ?? "—" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, { children: t.specialization ?? "—" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Td, {
					className: "text-right",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => del.mutate(t.id),
						className: "rounded p-1.5 text-destructive hover:bg-destructive/10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
					})
				})
			]
		}, t.id)) })] })
	] });
}
//#endregion
export { Page as component };
