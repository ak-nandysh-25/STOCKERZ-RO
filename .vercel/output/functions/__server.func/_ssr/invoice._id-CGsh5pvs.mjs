import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BDeaICjQ.mjs";
import { a as require_jsx_runtime, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { P as Download, T as MessageCircle, Y as ArrowLeft, y as Printer } from "../_libs/lucide-react.mjs";
import { a as upper, i as fmtMoney, o as waLink, r as Route$1, s as Button } from "./router-BGA5OOaq.mjs";
import { t as require_jspdf_node_min } from "../_libs/jspdf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/invoice._id-CGsh5pvs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_jspdf_node_min = /* @__PURE__ */ __toESM(require_jspdf_node_min());
function InvoicePage() {
	const { id } = Route$1.useParams();
	const nav = useNavigate();
	const ref = (0, import_react.useRef)(null);
	const { data } = useQuery({
		queryKey: ["invoice", id],
		queryFn: async () => {
			const [sale, shop] = await Promise.all([supabase.from("sales").select("*").eq("id", id).single(), supabase.from("shops").select("*").maybeSingle()]);
			if (sale.error) throw sale.error;
			return {
				sale: sale.data,
				shop: shop.data
			};
		}
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Loading…"
	});
	const { sale, shop } = data;
	const total = Number(sale.price) * Number(sale.qty);
	const invoiceNo = sale.id.slice(0, 8).toUpperCase();
	function savePdf() {
		const doc = new import_jspdf_node_min.default({
			unit: "pt",
			format: "a4"
		});
		const M = 40;
		let y = M;
		doc.setFontSize(18);
		doc.text(upper(shop?.name ?? "SHOP"), M, y);
		y += 24;
		doc.setFontSize(10);
		if (shop?.address) {
			doc.text(upper(shop.address), M, y);
			y += 14;
		}
		if (shop?.contact) {
			doc.text(`PH: ${shop.contact}`, M, y);
			y += 14;
		}
		if (shop?.email) {
			doc.text(`EMAIL: ${upper(shop.email)}`, M, y);
			y += 14;
		}
		if (shop?.gst) {
			doc.text(`GST: ${upper(shop.gst)}`, M, y);
			y += 14;
		}
		y += 10;
		doc.setFontSize(14);
		doc.text(`INVOICE #${invoiceNo}`, M, y);
		y += 20;
		doc.setFontSize(10);
		doc.text(`DATE: ${sale.sale_date}`, M, y);
		y += 14;
		if (sale.customer_name) {
			doc.text(`CUSTOMER: ${upper(sale.customer_name)}`, M, y);
			y += 14;
		}
		if (sale.phone) {
			doc.text(`PHONE: ${sale.phone}`, M, y);
			y += 14;
		}
		if (sale.address) {
			doc.text(`ADDRESS: ${upper(sale.address)}`, M, y);
			y += 14;
		}
		y += 10;
		doc.line(M, y, 555, y);
		y += 16;
		doc.text("ITEM", M, y);
		doc.text("QTY", 340, y);
		doc.text("PRICE", 400, y);
		doc.text("TOTAL", 490, y);
		y += 10;
		doc.line(M, y, 555, y);
		y += 16;
		doc.text(upper(sale.product_name), M, y);
		doc.text(String(sale.qty), 340, y);
		doc.text(fmtMoney(sale.price), 400, y);
		doc.text(fmtMoney(total), 490, y);
		y += 18;
		doc.line(M, y, 555, y);
		y += 20;
		doc.setFontSize(12);
		doc.text(`GRAND TOTAL: ${fmtMoney(total)}`, 340, y);
		doc.save(`invoice-${invoiceNo}.pdf`);
	}
	const waMessage = `INVOICE #${invoiceNo}\n${upper(shop?.name ?? "")}\n${upper(sale.product_name)} x${sale.qty} - ${fmtMoney(total)}\nDATE: ${sale.sale_date}\nTHANK YOU!`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "no-print mb-4 flex flex-wrap items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				onClick: () => nav({ to: "/sales" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Back"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				onClick: () => window.print(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-4 w-4" }), " Print"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				onClick: savePdf,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), " Save PDF"]
			}),
			sale.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: waLink(sale.phone, waMessage),
				target: "_blank",
				rel: "noreferrer",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-4 w-4" }), " Share on WhatsApp"] })
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: "invoice-print mx-auto max-w-2xl rounded-2xl bg-white p-8 text-black uppercase-data",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between border-b border-gray-300 pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					shop?.logo_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: shop.logo_url,
						alt: "",
						className: "mb-2 h-16"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold",
						children: upper(shop?.name)
					}),
					shop?.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-gray-700",
						children: upper(shop.address)
					}),
					shop?.contact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-gray-700",
						children: ["PH: ", shop.contact]
					}),
					shop?.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-gray-700",
						children: upper(shop.email)
					}),
					shop?.gst && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-gray-700",
						children: ["GST: ", upper(shop.gst)]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl font-bold",
							children: "INVOICE"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs",
							children: ["#", invoiceNo]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs",
							children: ["DATE: ", sale.sale_date]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid grid-cols-2 gap-4 text-xs",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold text-gray-500",
						children: "BILL TO"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm font-bold",
						children: upper(sale.customer_name) || "WALK-IN CUSTOMER"
					}),
					sale.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["PHONE: ", sale.phone] }),
					sale.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: upper(sale.address) })
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "mt-6 w-full text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-gray-400 text-left text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2",
								children: "ITEM"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2",
								children: "QTY"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2",
								children: "PRICE"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 text-right",
								children: "TOTAL"
							})
						]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-gray-200",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "py-3",
								children: [upper(sale.product_name), sale.product_type ? ` (${upper(sale.product_type)})` : ""]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3",
								children: sale.qty
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3",
								children: fmtMoney(sale.price)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3 text-right",
								children: fmtMoney(total)
							})
						]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 3,
						className: "py-3 text-right font-bold",
						children: "GRAND TOTAL"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-3 text-right text-lg font-bold",
						children: fmtMoney(total)
					})] }) })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-center text-xs text-gray-600",
				children: "THANK YOU FOR YOUR BUSINESS!"
			})
		]
	})] });
}
//#endregion
export { InvoicePage as component };
