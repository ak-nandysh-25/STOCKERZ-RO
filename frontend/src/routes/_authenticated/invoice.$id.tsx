import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui-kit";
import { fmtMoney, upper, waLink, fmtDate, numberToWords } from "@/lib/app-utils";
import { Printer, Download, MessageCircle, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import jsPDF from "jspdf";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/invoice/$id")({
  head: () => ({ meta: [{ title: "Tax Invoice — STOCKERZ RO" }] }),
  component: InvoicePage,
});

function InvoicePage() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [thermalMode, setThermalMode] = useState(false);

  const { data } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const [sales, shop] = await Promise.all([
        apiClient.sales.list().catch(() => []),
        apiClient.shops.getCurrent().catch(() => null),
      ]);
      const sale = sales.find((s: any) => s.id === id);
      if (!sale) throw new Error("Invoice not found");
      return { sale, shop };
    },
  });

  if (!data) return <div className="p-8 text-center text-sm text-muted-foreground">Loading Tax Invoice…</div>;
  const { sale, shop } = data;
  const total = Number(sale.price) * Number(sale.qty);
  const invoiceNo = `INV-${sale.id.slice(0, 8).toUpperCase()}`;
  const formattedDate = fmtDate(sale.sale_date);

  function savePdf() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const M = 40;
    let y = M;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(upper(shop?.name ?? "STOCKERZ RO SHOWROOM"), M, y);
    y += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    if (shop?.address) { doc.text(upper(shop.address), M, y); y += 12; }
    if (shop?.contact) { doc.text(`PH: ${shop.contact}`, M, y); y += 12; }
    if (shop?.email) { doc.text(`EMAIL: ${upper(shop.email)}`, M, y); y += 12; }
    if (shop?.gst) { doc.text(`GSTIN: ${upper(shop.gst)}`, M, y); y += 12; }
    
    y += 10;
    doc.setLineWidth(1);
    doc.line(M, y, 555, y);
    y += 20;

    // Invoice Title & Info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("TAX INVOICE", M, y);
    doc.setFontSize(10);
    doc.text(`NO: ${invoiceNo}`, 380, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.text(`DATE: ${formattedDate}`, 380, y);
    doc.text(`STATUS: PAID`, 380, y + 14);
    y += 20;

    // Bill To
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", M, y); y += 14;
    doc.setFont("helvetica", "normal");
    doc.text(upper(sale.customer_name) || "WALK-IN CUSTOMER", M, y); y += 12;
    if (sale.phone) { doc.text(`PH: ${sale.phone}`, M, y); y += 12; }
    if (sale.address) { doc.text(`ADDRESS: ${upper(sale.address)}`, M, y); y += 12; }

    y += 15;
    doc.line(M, y, 555, y);
    y += 15;

    // Table Header
    doc.setFont("helvetica", "bold");
    doc.text("#", M, y);
    doc.text("ITEM DESCRIPTION", M + 20, y);
    doc.text("QTY", 340, y);
    doc.text("UNIT PRICE", 400, y);
    doc.text("TOTAL", 490, y);
    y += 10;
    doc.line(M, y, 555, y);
    y += 15;

    // Item Row
    doc.setFont("helvetica", "normal");
    doc.text("1", M, y);
    doc.text(upper(sale.product_name) + (sale.product_type ? ` (${upper(sale.product_type)})` : ""), M + 20, y);
    doc.text(String(sale.qty), 340, y);
    doc.text(fmtMoney(sale.price), 400, y);
    doc.text(fmtMoney(total), 490, y);
    y += 20;

    doc.line(M, y, 555, y);
    y += 20;

    // Total Box & Amount in Words
    doc.setFont("helvetica", "bold");
    doc.text("AMOUNT IN WORDS:", M, y);
    doc.text(`GRAND TOTAL: ${fmtMoney(total)}`, 380, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.text(numberToWords(total), M, y);

    y += 30;
    doc.line(M, y, 555, y);
    y += 15;

    // Terms & Signatory
    doc.setFontSize(8);
    doc.text("TERMS & CONDITIONS:", M, y); y += 12;
    doc.text("1. Goods once sold will not be accepted or exchanged.", M, y); y += 10;
    doc.text("2. Warranty as per manufacturer terms & conditions.", M, y); y += 10;
    doc.text("3. Recommended filter service maintenance: every 90 days.", M, y); y += 20;

    doc.text(`FOR ${upper(shop?.name ?? "STOCKERZ RO")}`, 380, y); y += 25;
    doc.text("AUTHORISED SIGNATORY", 380, y);

    doc.save(`${invoiceNo}.pdf`);
  }

  const waMessage = `TAX INVOICE #${invoiceNo}\n${upper(shop?.name ?? "")}\n${upper(sale.product_name)} x${sale.qty} - ${fmtMoney(total)}\nDATE: ${formattedDate}\nTHANK YOU FOR YOUR BUSINESS!`;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Top Bar Action Buttons */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl glass p-4 border border-white/10">
        <Button variant="outline" onClick={() => nav({ to: "/sales" })} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Sales
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant={thermalMode ? "primary" : "outline"} onClick={() => setThermalMode(!thermalMode)}>
            {thermalMode ? "Switch to A4 Tax Invoice" : "Switch to 3\" Thermal Bill"}
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" /> Print Invoice
          </Button>
          <Button variant="outline" onClick={savePdf} className="gap-2">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          {sale.phone && (
            <a href={waLink(sale.phone, waMessage)} target="_blank" rel="noreferrer">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <MessageCircle className="h-4 w-4" /> Send WhatsApp
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* INVOICE VIEW CONTAINER */}
      {thermalMode ? (
        /* 3-INCH THERMAL RECEIPT VIEW */
        <div className="invoice-print mx-auto w-[80mm] rounded-2xl bg-white p-4 font-mono text-black shadow-2xl text-xs uppercase-data">
          <div className="text-center border-b border-dashed border-gray-400 pb-3">
            <h1 className="font-bold text-sm leading-tight">{upper(shop?.name ?? "STOCKERZ RO")}</h1>
            {shop?.address && <p className="text-[10px] mt-0.5">{upper(shop.address)}</p>}
            {shop?.contact && <p className="text-[10px]">PH: {shop.contact}</p>}
            {shop?.gst && <p className="text-[10px] font-bold">GSTIN: {upper(shop.gst)}</p>}
          </div>

          <div className="my-2 border-b border-dashed border-gray-400 pb-2 text-[10px]">
            <div className="flex justify-between"><span>INV NO:</span><span className="font-bold">{invoiceNo}</span></div>
            <div className="flex justify-between"><span>DATE:</span><span>{formattedDate}</span></div>
            <div className="flex justify-between"><span>PAYMENT:</span><span className="font-bold text-emerald-700">PAID</span></div>
          </div>

          <div className="border-b border-dashed border-gray-400 pb-2 text-[10px]">
            <span className="font-bold">CUST:</span> {upper(sale.customer_name) || "WALK-IN"}
            {sale.phone && <div>PH: {sale.phone}</div>}
            {sale.address && <div>ADDR: {upper(sale.address)}</div>}
          </div>

          <div className="my-2 text-[10px]">
            <div className="flex justify-between font-bold border-b border-gray-300 pb-1 mb-1">
              <span>ITEM</span>
              <span>QTY x PRICE</span>
              <span>TOTAL</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="max-w-[120px] font-semibold">{upper(sale.product_name)}</span>
              <span>{sale.qty} x {sale.price}</span>
              <span className="font-bold">{fmtMoney(total)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 pt-2 text-[11px] font-bold flex justify-between">
            <span>TOTAL AMOUNT:</span>
            <span>{fmtMoney(total)}</span>
          </div>

          <div className="mt-3 text-center text-[9px] border-t border-dashed border-gray-300 pt-2 text-gray-600">
            THANK YOU FOR YOUR BUSINESS!
            <br />
            FILTER SERVICE RECOMMENDED IN 90 DAYS
          </div>
        </div>
      ) : (
        /* STANDARD A4 TAX INVOICE VIEW */
        <div className="invoice-print mx-auto max-w-3xl rounded-3xl bg-white p-8 md:p-10 text-black shadow-2xl uppercase-data border border-gray-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between border-b border-gray-300 pb-6 gap-6">
            <div className="space-y-1 max-w-md">
              {shop?.logo_url ? (
                <img src={shop.logo_url} alt="" className="h-14 object-contain mb-3" />
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold mb-2">
                  <ShieldCheck className="h-4 w-4" /> AUTHORIZED RO SHOWROOM
                </div>
              )}
              <h1 className="text-2xl font-black tracking-tight text-gray-900">{upper(shop?.name ?? "STOCKERZ RO SHOWROOM")}</h1>
              {shop?.address && <p className="text-xs text-gray-600 leading-relaxed">{upper(shop.address)}</p>}
              <div className="flex flex-wrap gap-x-4 text-xs text-gray-600 font-medium pt-1">
                {shop?.contact && <span><strong>PH:</strong> {shop.contact}</span>}
                {shop?.email && <span><strong>EMAIL:</strong> {upper(shop.email)}</span>}
              </div>
              {shop?.gst && (
                <div className="mt-2 inline-block rounded-md bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-800 border border-gray-300">
                  GSTIN: {upper(shop.gst)}
                </div>
              )}
            </div>

            <div className="text-left sm:text-right space-y-1.5 shrink-0 bg-gray-50 p-4 rounded-2xl border border-gray-200 min-w-[200px]">
              <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-3 py-0.5 mb-1">
                TAX INVOICE
              </span>
              <h2 className="text-xl font-bold text-gray-900">{invoiceNo}</h2>
              <p className="text-xs text-gray-600"><strong>DATE:</strong> {formattedDate}</p>
              <p className="text-xs text-emerald-700 font-bold flex items-center gap-1 justify-start sm:justify-end">
                <CheckCircle2 className="h-3.5 w-3.5" /> PAYMENT RECEIVED
              </p>
            </div>
          </div>

          {/* Customer & Bill To Section */}
          <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-200 p-4 text-xs">
            <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">CUSTOMER DETAILS (BILL TO)</span>
            <div className="mt-2 grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-base font-black text-gray-900">{upper(sale.customer_name) || "WALK-IN CUSTOMER"}</p>
                {sale.phone && <p className="text-gray-700 mt-0.5"><strong>PHONE:</strong> {sale.phone}</p>}
              </div>
              <div>
                {sale.address && <p className="text-gray-700"><strong>DESTINATION / ADDRESS:</strong> {upper(sale.address)}</p>}
                {sale.product_type && <p className="text-gray-700 mt-0.5"><strong>CATEGORY:</strong> {upper(sale.product_type)}</p>}
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-300">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[11px] border-b border-gray-300">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">PRODUCT / ITEM DESCRIPTION</th>
                  <th className="py-3 px-4 text-center">QTY</th>
                  <th className="py-3 px-4 text-right">UNIT PRICE</th>
                  <th className="py-3 px-4 text-right">TOTAL AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-4 text-center font-bold text-gray-500">01</td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-sm text-gray-900">{upper(sale.product_name)}</div>
                    {sale.product_type && <div className="text-[11px] text-gray-500 mt-0.5">{upper(sale.product_type)}</div>}
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-sm">{sale.qty}</td>
                  <td className="py-4 px-4 text-right font-medium">{fmtMoney(sale.price)}</td>
                  <td className="py-4 px-4 text-right font-black text-sm">{fmtMoney(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & Tax Summary */}
          <div className="mt-6 grid sm:grid-cols-12 gap-6 items-start">
            <div className="sm:col-span-7 space-y-4">
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-3.5 text-xs">
                <span className="font-bold text-gray-500 text-[10px] uppercase block">AMOUNT IN WORDS</span>
                <p className="font-bold text-gray-900 mt-0.5">{numberToWords(total)}</p>
              </div>

              <div className="text-[10px] text-gray-500 space-y-1">
                <p className="font-bold text-gray-700">TERMS & CONDITIONS:</p>
                <p>1. Goods once sold will not be accepted back or exchanged.</p>
                <p>2. Warranty coverage as per original manufacturer policy.</p>
                <p>3. Automatic filter replacement reminder scheduled in 90 days.</p>
              </div>
            </div>

            <div className="sm:col-span-5 rounded-2xl bg-gray-50 border border-gray-300 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Sub Total:</span>
                <span className="font-medium">{fmtMoney(total)}</span>
              </div>
              {shop?.gst && (
                <>
                  <div className="flex justify-between text-gray-600 text-[11px]">
                    <span>CGST (9%):</span>
                    <span>{fmtMoney(total * 0.09)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-[11px]">
                    <span>SGST (9%):</span>
                    <span>{fmtMoney(total * 0.09)}</span>
                  </div>
                </>
              )}
              <div className="border-t border-gray-300 pt-2 flex justify-between items-center text-base font-black text-gray-900">
                <span>GRAND TOTAL:</span>
                <span className="text-lg text-primary">{fmtMoney(total)}</span>
              </div>
            </div>
          </div>

          {/* Signatory Footer */}
          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-xs gap-4 text-gray-600">
            <p className="text-[10px] text-center sm:text-left">This is a computer-generated tax invoice. No physical signature required.</p>
            <div className="text-center sm:text-right space-y-6">
              <p className="font-bold">FOR {upper(shop?.name ?? "STOCKERZ RO")}</p>
              <p className="border-t border-dashed border-gray-400 pt-1 text-[10px] uppercase">AUTHORISED SIGNATORY</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
