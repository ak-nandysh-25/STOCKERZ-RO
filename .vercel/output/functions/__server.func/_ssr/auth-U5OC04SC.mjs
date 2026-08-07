import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BDeaICjQ.mjs";
import { a as require_jsx_runtime, i as useQueryClient, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link, v as useNavigate, y as useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { M as EyeOff, O as LoaderCircle, Y as ArrowLeft, j as Eye } from "../_libs/lucide-react.mjs";
import { t as ThemeToggle } from "./theme-toggle-Du9IrxTh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-U5OC04SC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var emptyShop = {
	name: "",
	contact: "",
	gst: "",
	address: ""
};
function AuthPage() {
	const nav = useNavigate();
	const qc = useQueryClient();
	const search = useSearch({ strict: false });
	const initialMode = search?.mode === "signup" || search?.mode === "forgot" ? search.mode : "login";
	const [mode, setMode] = (0, import_react.useState)(initialMode);
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [showPw, setShowPw] = (0, import_react.useState)(false);
	const [shop, setShop] = (0, import_react.useState)(emptyShop);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [resetSent, setResetSent] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (search?.mode) setMode(search.mode);
	}, [search?.mode]);
	(0, import_react.useEffect)(() => {
		supabase.auth.getSession().then(({ data }) => {
			if (data.session) nav({ to: "/dashboard" });
		});
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			if (session) nav({ to: "/dashboard" });
		});
		return () => subscription.unsubscribe();
	}, [nav]);
	async function submit(e) {
		e.preventDefault();
		setLoading(true);
		try {
			if (mode === "forgot") {
				const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
				if (error) throw error;
				setResetSent(true);
				toast.success("Password reset link sent to your email!");
				setLoading(false);
				return;
			}
			if (mode === "signup") {
				const cleanEmail = email.trim();
				const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
					email: cleanEmail,
					password,
					options: { emailRedirectTo: `${window.location.origin}/dashboard` }
				});
				if (signUpErr) throw signUpErr;
				let authUser = signUpData.user;
				const { data: sessionData } = await supabase.auth.getSession();
				if (!sessionData.session) {
					const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
						email: cleanEmail,
						password
					});
					if (signInErr) throw signInErr;
					authUser = signInData.user;
				}
				if (authUser) {
					const { error: upsertErr } = await supabase.from("shops").upsert({
						owner_id: authUser.id,
						name: shop.name.trim().toUpperCase() || "MY SHOP",
						contact: shop.contact.trim() || null,
						email: cleanEmail,
						gst: shop.gst.trim().toUpperCase() || null,
						address: shop.address.trim().toUpperCase() || null
					}, { onConflict: "owner_id" });
					if (upsertErr) console.warn("Shop upsert notice:", upsertErr.message);
				}
				await qc.invalidateQueries({ queryKey: ["shop"] });
				toast.success(`Shop "${shop.name.trim().toUpperCase() || "MY SHOP"}" created successfully!`);
				nav({
					to: "/dashboard",
					replace: true
				});
				return;
			} else {
				const cleanEmail = email.trim();
				const { data, error } = await supabase.auth.signInWithPassword({
					email: cleanEmail,
					password
				});
				if (error) throw error;
				if (data.user) {
					const { data: userShop } = await supabase.from("shops").select("id").eq("owner_id", data.user.id).maybeSingle();
					if (!userShop) {
						await supabase.auth.signOut();
						throw new Error("No registered shop account found for this email. Sign in is only allowed for existing created accounts.");
					}
				}
				toast.success("Welcome back");
				nav({ to: "/dashboard" });
			}
			nav({ to: "/dashboard" });
		} catch (err) {
			toast.error(err.message ?? "Something went wrong");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "aurora-bg grid min-h-screen place-items-center px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/stockerz-logo.png",
							alt: "STOCKERZ RO",
							className: "h-9 w-9 rounded-lg object-contain"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold tracking-tight",
							children: "STOCKERZ RO"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold",
					children: mode === "login" ? "Sign in" : mode === "signup" ? "Create your shop" : "Reset password"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: mode === "login" ? "Sign in to access your shop dashboard" : mode === "signup" ? "Add your shop profile details to get started" : "Enter your registered email to receive a password reset link"
				}),
				mode === "forgot" && resetSent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300",
					children: "Reset link sent! Check your inbox for further instructions."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					className: "mt-6 space-y-4",
					children: [
						mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Shop name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									required: true,
									value: shop.name,
									onChange: (e) => setShop({
										...shop,
										name: e.target.value
									}),
									placeholder: "AQUA PURE RO",
									className: "w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary uppercase-data"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Contact number",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "tel",
									required: true,
									value: shop.contact,
									onChange: (e) => setShop({
										...shop,
										contact: e.target.value
									}),
									className: "w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "GST number (optional)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: shop.gst,
									onChange: (e) => setShop({
										...shop,
										gst: e.target.value
									}),
									className: "w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary uppercase-data"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Shop address",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 3,
									value: shop.address,
									onChange: (e) => setShop({
										...shop,
										address: e.target.value
									}),
									className: "w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary uppercase-data"
								})
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Email",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "email",
								required: true,
								value: email,
								onChange: (e) => setEmail(e.target.value),
								className: "w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
							})
						}),
						mode !== "forgot" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Password",
							action: mode === "login" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setMode("forgot");
									setResetSent(false);
								},
								className: "text-xs font-medium text-primary hover:underline",
								children: "Forgot password?"
							}) : void 0,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: showPw ? "text" : "password",
									required: true,
									minLength: 6,
									value: password,
									onChange: (e) => setPassword(e.target.value),
									className: "w-full rounded-lg bg-input px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setShowPw((v) => !v),
									"aria-label": showPw ? "Hide password" : "Show password",
									className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
									children: showPw ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							disabled: loading,
							className: "flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-60",
							children: [loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), mode === "login" ? "Sign in" : mode === "signup" ? "Create shop" : resetSent ? "Resend reset link" : "Send reset link"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 text-sm",
					children: mode === "login" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setMode("signup"),
							className: "text-muted-foreground hover:text-foreground",
							children: ["Need an account? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground font-semibold",
								children: "Create shop"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setMode("forgot");
								setResetSent(false);
							},
							className: "text-xs text-muted-foreground hover:text-primary transition",
							children: "Forgot password?"
						})]
					}) : mode === "signup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setMode("login"),
						className: "text-muted-foreground hover:text-foreground",
						children: ["Already have a shop? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground font-semibold",
							children: "Sign in"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setMode("login"),
						className: "inline-flex items-center gap-1 text-muted-foreground hover:text-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }),
							" Back to ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground font-semibold",
								children: "Sign in"
							})
						]
					})
				})
			]
		})
	});
}
function Field({ label, action, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1.5 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-xs font-medium text-muted-foreground",
				children: label
			}), action]
		}), children]
	});
}
//#endregion
export { AuthPage as component };
