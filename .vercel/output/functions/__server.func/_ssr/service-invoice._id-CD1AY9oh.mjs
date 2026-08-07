import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BDeaICjQ.mjs";
import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { P as Download, T as MessageCircle, Y as ArrowLeft, y as Printer } from "../_libs/lucide-react.mjs";
import { a as upper, i as fmtMoney, n as Route, o as waLink, s as Button } from "./router-BGA5OOaq.mjs";
import { t as require_jspdf_node_min } from "../_libs/jspdf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/service-invoice._id-CD1AY9oh.js
var import_jsx_runtime = require_jsx_runtime();
var import_jspdf_node_min = /* @__PURE__ */ __toESM(require_jspdf_node_min());
function ServiceInvoicePage() {
	const { id } = Route.useParams();
	const nav = useNavigate();
	const { data } = useQuery({
		queryKey: ["service-invoice", id],
		queryFn: async () => {
			const [svc, shop] = await Promise.all([supabase.from("services").select("*, service_items(*)").eq("id", id).single(), supabase.from("shops").select("*").maybeSingle()]);
			if (svc.error) throw svc.error;
			return {
				svc: svc.data,
				shop: shop.data
			};
		}
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Loading…"
	});
	const { svc, shop } = data;
	const items = svc.service_items ?? [];
	const total = items.reduce((s, it) => s + Number(it.price), 0);
	const invoiceNo = svc.id.slice(0, 8).toUpperCase();
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
		if (shop?.gst) {
			doc.text(`GST: ${upper(shop.gst)}`, M, y);
			y += 14;
		}
		y += 10;
		doc.setFontSize(14);
		doc.text(`SERVICE INVOICE #${invoiceNo}`, M, y);
		y += 20;
		doc.setFontSize(10);
		doc.text(`DATE: ${svc.service_date}`, M, y);
		y += 14;
		doc.text(`CUSTOMER: ${upper(svc.customer_name)}`, M, y);
		y += 14;
		if (svc.phone) {
			doc.text(`PHONE: ${svc.phone}`, M, y);
			y += 14;
		}
		if (svc.address) {
			doc.text(`ADDRESS: ${upper(svc.address)}`, M, y);
			y += 14;
		}
		doc.text(`SERVICE: ${upper(svc.service_type)}`, M, y);
		y += 14;
		if (svc.next_service_date) {
			doc.text(`NEXT SERVICE: ${svc.next_service_date}`, M, y);
			y += 14;
		}
		y += 10;
		doc.line(M, y, 555, y);
		y += 16;
		doc.text("ITEM", M, y);
		doc.text("PRICE", 490, y);
		y += 10;
		doc.line(M, y, 555, y);
		y += 16;
		for (const it of items) {
			doc.text(upper(it.product_name), M, y);
			doc.text(fmtMoney(it.price), 490, y);
			y += 16;
		}
		doc.line(M, y, 555, y);
		y += 20;
		doc.setFontSize(12);
		doc.text(`GRAND TOTAL: ${fmtMoney(total)}`, 340, y);
		doc.save(`service-${invoiceNo}.pdf`);
	}
	const waMessage = `SERVICE #${invoiceNo}\n${upper(shop?.name ?? "")}\n${upper(svc.service_type)} - ${fmtMoney(total)}\nDATE: ${svc.service_date}${svc.next_service_date ? `\nNEXT: ${svc.next_service_date}` : ""}\nTHANK YOU!`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "no-print mb-4 flex flex-wrap items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				onClick: () => nav({ to: "/service" }),
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
			svc.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: waLink(svc.phone, waMessage),
				target: "_blank",
				rel: "noreferrer",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-4 w-4" }), " Share on WhatsApp"] })
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "invoice-print mx-auto max-w-2xl rounded-2xl bg-white p-6 text-black uppercase-data md:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3 border-b border-gray-300 pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						shop?.logo_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: shop.logo_url,
							alt: "",
							className: "mb-2 h-16"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-xl font-bold md:text-2xl",
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
						shop?.gst && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-gray-700",
							children: ["GST: ", upper(shop.gst)]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-bold md:text-xl",
							children: "SERVICE INVOICE"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs",
							children: ["#", invoiceNo]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs",
							children: ["DATE: ", svc.service_date]
						}),
						svc.next_service_date && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs",
							children: ["NEXT: ", svc.next_service_date]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold text-gray-500",
						children: "BILL TO"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm font-bold",
						children: upper(svc.customer_name)
					}),
					svc.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["PHONE: ", svc.phone] }),
					svc.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: upper(svc.address) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2",
						children: ["SERVICE: ", upper(svc.service_type)]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "mt-6 w-full text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-gray-400 text-left text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2",
							children: "ITEM"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 text-right",
							children: "PRICE"
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-3 text-gray-500",
						colSpan: 2,
						children: "NO ITEMS"
					}) }) : items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-gray-200",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-3",
							children: upper(it.product_name)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-3 text-right",
							children: fmtMoney(it.price)
						})]
					}, it.id)) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
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
export { ServiceInvoicePage as component };
