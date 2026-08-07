import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BDeaICjQ.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { O as LoaderCircle, l as Trash2, o as Upload } from "../_libs/lucide-react.mjs";
import { _ as Textarea, c as Card, d as Input, p as PageHeader, s as Button, u as Field } from "./router-BGA5OOaq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-Drpmqzec.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const qc = useQueryClient();
	const { data: shop } = useQuery({
		queryKey: ["shop"],
		queryFn: async () => (await supabase.from("shops").select("*").maybeSingle()).data
	});
	const [f, setF] = (0, import_react.useState)({
		name: "",
		contact: "",
		email: "",
		gst: "",
		address: "",
		logo_url: ""
	});
	const [uploading, setUploading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (shop) setF({
			name: shop.name ?? "",
			contact: shop.contact ?? "",
			email: shop.email ?? "",
			gst: shop.gst ?? "",
			address: shop.address ?? "",
			logo_url: shop.logo_url ?? ""
		});
	}, [shop]);
	const save = useMutation({
		mutationFn: async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error("User not authenticated");
			const payload = {
				owner_id: user.id,
				name: f.name.toUpperCase(),
				contact: f.contact,
				email: f.email,
				gst: f.gst.toUpperCase(),
				address: f.address.toUpperCase(),
				logo_url: f.logo_url || null,
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			};
			if (shop?.id) {
				const { error } = await supabase.from("shops").update(payload).eq("id", shop.id);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("shops").upsert(payload, { onConflict: "owner_id" });
				if (error) throw error;
			}
		},
		onSuccess: () => {
			toast.success("Shop profile updated");
			qc.invalidateQueries({ queryKey: ["shop"] });
		},
		onError: (e) => toast.error(e.message)
	});
	async function uploadLogo(file) {
		if (file.size > 5242880) {
			toast.error("File size must be under 5MB");
			return;
		}
		setUploading(true);
		const convertToBase64 = (isFallback = true) => {
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result === "string") {
					setF((prev) => ({
						...prev,
						logo_url: reader.result
					}));
					toast.success("Logo uploaded successfully");
				}
				setUploading(false);
			};
			reader.onerror = () => {
				toast.error("Failed to read image file");
				setUploading(false);
			};
			reader.readAsDataURL(file);
		};
		try {
			const { data: { user } } = await supabase.auth.getUser();
			const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
			const path = `${user?.id ?? "shop"}/${Date.now()}-${sanitizedName}`;
			let { error } = await supabase.storage.from("shop-logos").upload(path, file, { upsert: true });
			if (error && (error.message.includes("Bucket not found") || error.statusCode === "404")) try {
				await supabase.storage.createBucket("shop-logos", { public: true });
				error = (await supabase.storage.from("shop-logos").upload(path, file, { upsert: true })).error;
			} catch {}
			if (error) {
				console.warn("Supabase storage notice:", error.message);
				convertToBase64(true);
				return;
			}
			const { data } = supabase.storage.from("shop-logos").getPublicUrl(path);
			if (data?.publicUrl) {
				setF((prev) => ({
					...prev,
					logo_url: data.publicUrl
				}));
				toast.success("Logo uploaded successfully");
			} else convertToBase64(true);
		} catch (err) {
			console.warn("Storage exception, using base64 fallback:", err);
			convertToBase64(true);
		} finally {
			setUploading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Shop Profile",
		description: "Business details displayed on customer printed invoices"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (e) => {
			e.preventDefault();
			save.mutate();
		},
		className: "grid grid-cols-1 gap-4 md:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md:col-span-2 flex flex-wrap items-center gap-4 border-b border-glass-border pb-4",
				children: [f.logo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative group",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: f.logo_url,
						alt: "Shop logo preview",
						className: "h-20 w-20 rounded-xl border border-glass-border object-cover bg-black/20 shadow-inner"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setF((prev) => ({
							...prev,
							logo_url: ""
						})),
						className: "absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-md transition hover:scale-110",
						title: "Remove logo",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid h-20 w-20 place-items-center rounded-xl border border-dashed border-white/20 bg-white/5 text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-6 w-6" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex cursor-pointer items-center gap-2 rounded-xl glass px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-white/10 active:scale-95",
						children: [
							uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: uploading ? "Uploading..." : "Upload Showroom Logo" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: "image/*",
								disabled: uploading,
								className: "hidden",
								onChange: (e) => e.target.files?.[0] && uploadLogo(e.target.files[0])
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted-foreground",
						children: "PNG, JPG, WebP, or SVG (Max 5MB). Displays at the top of printed GST invoices."
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Business name",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					required: true,
					value: f.name,
					onChange: (e) => setF({
						...f,
						name: e.target.value
					}),
					className: "uppercase-data",
					placeholder: "e.g. AQUA PURE RO SALES & SERVICE"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Contact number",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: f.contact,
					onChange: (e) => setF({
						...f,
						contact: e.target.value
					}),
					placeholder: "+91 98765 43210"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Email",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "email",
					value: f.email,
					onChange: (e) => setF({
						...f,
						email: e.target.value
					}),
					placeholder: "shop@domain.com"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "GST number (optional)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: f.gst,
					onChange: (e) => setF({
						...f,
						gst: e.target.value
					}),
					className: "uppercase-data",
					placeholder: "33AAAAA0000A1Z5"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "md:col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Showroom Address",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						rows: 3,
						value: f.address,
						onChange: (e) => setF({
							...f,
							address: e.target.value
						}),
						className: "uppercase-data",
						placeholder: "Full address for invoice header"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "md:col-span-2 flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: save.isPending || uploading,
					children: save.isPending ? "Saving Profile..." : "Save Shop Profile"
				})
			})
		]
	}) })] });
}
//#endregion
export { Page as component };
