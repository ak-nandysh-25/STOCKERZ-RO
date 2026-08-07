import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BDeaICjQ.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { M as EyeOff, O as LoaderCircle, j as Eye } from "../_libs/lucide-react.mjs";
import { t as ThemeToggle } from "./theme-toggle-Du9IrxTh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-login-7sR3MZ-e.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminLogin() {
	const nav = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [showPw, setShowPw] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const checkAdmin = async (userId) => {
			const { data: isAdmin } = await supabase.rpc("has_role", {
				_user_id: userId,
				_role: "admin"
			});
			if (isAdmin) nav({ to: "/admin" });
		};
		supabase.auth.getSession().then(({ data }) => {
			if (data.session?.user) checkAdmin(data.session.user.id);
		});
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			if (session?.user) checkAdmin(session.user.id);
		});
		return () => subscription.unsubscribe();
	}, [nav]);
	async function submit(e) {
		e.preventDefault();
		setLoading(true);
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: email.trim(),
				password
			});
			if (error) throw error;
			const { data: isAdmin, error: roleErr } = await supabase.rpc("has_role", {
				_user_id: data.user.id,
				_role: "admin"
			});
			if (roleErr) throw roleErr;
			if (!isAdmin) {
				await supabase.auth.signOut();
				throw new Error("This account does not have admin access");
			}
			toast.success("Welcome, admin");
			nav({ to: "/admin" });
		} catch (err) {
			toast.error(err.message ?? "Sign in failed");
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
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/stockerz-logo.png",
							alt: "STOCKERZ RO",
							className: "h-9 w-9 rounded-lg object-contain"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold tracking-tight",
							children: "STOCKERZ RO — ADMIN"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold",
					children: "Admin sign in"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Restricted access. Admin accounts only."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					className: "mt-6 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mb-1.5 block text-xs font-medium text-muted-foreground",
								children: "Email"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "email",
								required: true,
								value: email,
								onChange: (e) => setEmail(e.target.value),
								className: "w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mb-1.5 block text-xs font-medium text-muted-foreground",
								children: "Password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							disabled: loading,
							className: "flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-60",
							children: [loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), "Sign in as admin"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex items-center justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/auth",
						search: { mode: "login" },
						className: "text-muted-foreground hover:text-foreground",
						children: ["Not an admin? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-foreground",
							children: "Shop sign in"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						search: { mode: "forgot" },
						className: "text-xs text-muted-foreground hover:text-primary transition",
						children: "Forgot password?"
					})]
				})
			]
		})
	});
}
//#endregion
export { AdminLogin as component };
