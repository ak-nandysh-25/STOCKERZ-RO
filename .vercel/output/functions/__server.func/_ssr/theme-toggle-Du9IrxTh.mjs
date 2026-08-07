import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { u as Sun, w as Moon } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/theme-toggle-Du9IrxTh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function getInitialTheme() {
	if (typeof window === "undefined") return "dark";
	const saved = localStorage.getItem("stockerz-theme");
	if (saved === "light" || saved === "dark") return saved;
	return "dark";
}
function applyTheme(theme) {
	if (typeof window === "undefined") return;
	const root = document.documentElement;
	root.classList.remove("light", "dark");
	root.classList.add(theme);
}
function ThemeToggle({ className = "" }) {
	const [theme, setThemeState] = (0, import_react.useState)("dark");
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const initial = getInitialTheme();
		setThemeState(initial);
		applyTheme(initial);
		setMounted(true);
	}, []);
	function toggleTheme() {
		const next = theme === "dark" ? "light" : "dark";
		setThemeState(next);
		localStorage.setItem("stockerz-theme", next);
		applyTheme(next);
	}
	if (!mounted) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": "Toggle theme",
		className: `grid h-9 w-9 place-items-center rounded-xl glass text-muted-foreground transition ${className}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "h-4 w-4" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: toggleTheme,
		title: `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
		"aria-label": `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
		className: `relative grid h-9 w-9 place-items-center rounded-xl glass text-foreground transition hover:bg-white/10 active:scale-95 ${className}`,
		children: theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "h-4 w-4 text-sky-400 transition-all duration-300" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "h-4 w-4 text-amber-500 transition-all duration-300" })
	});
}
//#endregion
export { ThemeToggle as t };
