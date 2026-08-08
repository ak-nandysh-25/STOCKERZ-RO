import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui-kit";
import { fmtMoney, upper, waLink, fmtDate, numberToWords } from "@/lib/app-utils";
import { Printer, Download, MessageCircle, ArrowLeft, CheckCircle2, ShieldCheck, Wrench, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/service-invoice/$id")({
  head: () => ({ meta: [{ title: "Service Tax Invoice — STOCKERZ RO" }] }),
  component: ServiceInvoicePage,
});

function ServiceInvoicePage() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [thermalMode, setThermalMode] = useState(false);

  const { data } = useQuery({
    queryKey: ["service-invoice", id],
    queryFn: async () => {
      const [svc, shop] = await Promise.all([
        supabase.from("services").select("*, service_items(*)").eq("id", id).single(),
        supabase.from("shops").select("*").maybeSingle(),
      ]);
      if (svc.error) throw svc.error;
      return { svc: svc.data, shop: shop.data };
    },
  });

  if (!data) return <div className="p-8 text-center text-sm text-muted-foreground">Loading Service Invoice…</div>;
  const { svc, shop } = data;
  const items = (svc.service_items ?? []) as any[];
  const total = items.reduce((s, it) => s + Number(it.price), 0);
  const invoiceNo = `SVC-${svc.id.slice(0, 8).toUpperCase()}`;
  const formattedServiceDate = fmtDate(svc.service_date);
  const formattedNextDate = fmtDate(svc.next_service_date);

  function savePdf() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const M = 40;
    let y = M;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(upper(shop?.name ?? "STOCKERZ RO SERVICE CENTER"), M, y);
    y += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    if (shop?.address) { doc.text(upper(shop.address), M, y); y += 12; }
    if (shop?.contact) { doc.text(`PH: ${shop.contact}`, M, y); y += 12; }
    if (shop?.gst) { doc.text(`GSTIN: ${upper(shop.gst)}`, M, y); y += 12; }

    y += 10;
    doc.setLineWidth(1);
    doc.line(M, y, 555, y);
    y += 20;

    // Title & Info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("SERVICE TAX INVOICE", M, y);
    doc.setFontSize(10);
    doc.text(`NO: ${invoiceNo}`, 380, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.text(`DATE: ${formattedServiceDate}`, 380, y);
    if (svc.next_service_date) {
      doc.setFont("helvetica", "bold");
      doc.text(`NEXT SERVICE DUE: ${formattedNextDate}`, 380, y + 14);
    }
    y += 20;

    // Customer
    doc.setFont("helvetica", "bold");
    doc.text("CUSTOMER DETAILS:", M, y); y += 14;
    doc.setFont("helvetica", "normal");
    doc.text(upper(svc.customer_name), M, y); y += 12;
    if (svc.phone) { doc.text(`PH: ${svc.phone}`, M, y); y += 12; }
    if (svc.address) { doc.text(`ADDRESS: ${upper(svc.address)}`, M, y); y += 12; }
    doc.text(`SERVICE TYPE: ${upper(svc.service_type)}`, M, y); y += 12;

    y += 15;
    doc.line(M, y, 555, y);
    y += 15;

    // Table
    doc.setFont("helvetica", "bold");
    doc.text("#", M, y);
    doc.text("REPLACEMENT ITEM / SERVICE DESCRIPTION", M + 20, y);
    doc.text("PRICE (₹)", 490, y);
    y += 10;
    doc.line(M, y, 555, y);
    y += 15;

    doc.setFont("helvetica", "normal");
    if (items.length === 0) {
      doc.text("GENERAL RO SERVICE & INSPECTION", M + 20, y);
      doc.text(fmtMoney(total), 490, y);
      y += 18;
    } else {
      items.forEach((it, idx) => {
        doc.text(String(idx + 1), M, y);
        doc.text(upper(it.product_name), M + 20, y);
        doc.text(fmtMoney(it.price), 490, y);
        y += 18;
      });
    }

    doc.line(M, y, 555, y);
    y += 20;

    // Total & Words
    doc.setFont("helvetica", "bold");
    doc.text("AMOUNT IN WORDS:", M, y);
    doc.text(`GRAND TOTAL: ${fmtMoney(total)}`, 380, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.text(numberToWords(total), M, y);

    y += 30;
    doc.line(M, y, 555, y);
    y += 15;

    doc.setFontSize(8);
    doc.text("SERVICE TERMS:", M, y); y += 12;
    doc.text("1. Replaced spare parts carry 30 days operational warranty.", M, y); y += 10;
    doc.text("2. 90-day automatic filter replacement reminder is enabled.", M, y); y += 20;

    doc.text(`FOR ${upper(shop?.name ?? "STOCKERZ RO")}`, 380, y); y += 25;
    doc.text("AUTHORISED SIGNATORY", 380, y);

    doc.save(`${invoiceNo}.pdf`);
  }

  const waMessage = `SERVICE TAX INVOICE #${invoiceNo}\n${upper(shop?.name ?? "")}\n${upper(svc.service_type)} - ${fmtMoney(total)}\nSERVICE DATE: ${formattedServiceDate}${svc.next_service_date ? `\nNEXT FILTER DUE: ${formattedNextDate}` : ""}\nTHANK YOU FOR TRUSTING US!`;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Top Bar Action Buttons */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl glass p-4 border border-white/10">
        <Button variant="outline" onClick={() => nav({ to: "/service" })} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Service Log
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant={thermalMode ? "secondary" : "outline"} onClick={() => setThermalMode(!thermalMode)}>
            {thermalMode ? "Switch to A4 Tax Invoice" : "Switch to 3\" Thermal Bill"}
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" /> Print Invoice
          </Button>
          <Button variant="outline" onClick={savePdf} className="gap-2">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          {svc.phone && (
            <a href={waLink(svc.phone, waMessage)} target="_blank" rel="noreferrer">
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
            <div className="flex justify-between"><span>SVC NO:</span><span className="font-bold">{invoiceNo}</span></div>
            <div className="flex justify-between"><span>DATE:</span><span>{formattedServiceDate}</span></div>
            {svc.next_service_date && (
              <div className="flex justify-between font-bold text-amber-800">
                <span>NEXT DUE:</span><span>{formattedNextDate}</span>
              </div>
            )}
          </div>

          <div className="border-b border-dashed border-gray-400 pb-2 text-[10px]">
            <span className="font-bold">CUST:</span> {upper(svc.customer_name)}
            {svc.phone && <div>PH: {svc.phone}</div>}
            {svc.address && <div>ADDR: {upper(svc.address)}</div>}
            <div className="mt-1 font-semibold">JOB: {upper(svc.service_type)}</div>
          </div>

          <div className="my-2 text-[10px]">
            <div className="flex justify-between font-bold border-b border-gray-300 pb-1 mb-1">
              <span>REPLACED ITEM</span>
              <span>PRICE</span>
            </div>
            {items.length === 0 ? (
              <div className="flex justify-between"><span>SERVICE CHARGES</span><span>{fmtMoney(total)}</span></div>
            ) : items.map((it: any) => (
              <div key={it.id} className="flex justify-between">
                <span>{upper(it.product_name)}</span>
                <span>{fmtMoney(it.price)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-400 pt-2 text-[11px] font-bold flex justify-between">
            <span>TOTAL AMOUNT:</span>
            <span>{fmtMoney(total)}</span>
          </div>

          <div className="mt-3 text-center text-[9px] border-t border-dashed border-gray-300 pt-2 text-gray-600">
            THANK YOU FOR TRUSTING OUR SERVICE!
            <br />
            AUTOMATIC 90-DAY REMINDER IS ENABLED
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
                  <Wrench className="h-4 w-4" /> AUTHORIZED SERVICE CENTER
                </div>
              )}
              <h1 className="text-2xl font-black tracking-tight text-gray-900">{upper(shop?.name ?? "STOCKERZ RO SERVICE CENTER")}</h1>
              {shop?.address && <p className="text-xs text-gray-600 leading-relaxed">{upper(shop.address)}</p>}
              <div className="flex flex-wrap gap-x-4 text-xs text-gray-600 font-medium pt-1">
                {shop?.contact && <span><strong>PH:</strong> {shop.contact}</span>}
              </div>
              {shop?.gst && (
                <div className="mt-2 inline-block rounded-md bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-800 border border-gray-300">
                  GSTIN: {upper(shop.gst)}
                </div>
              )}
            </div>

            <div className="text-left sm:text-right space-y-1.5 shrink-0 bg-gray-50 p-4 rounded-2xl border border-gray-200 min-w-[200px]">
              <span className="inline-block rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase px-3 py-0.5 mb-1">
                SERVICE TAX INVOICE
              </span>
              <h2 className="text-xl font-bold text-gray-900">{invoiceNo}</h2>
              <p className="text-xs text-gray-600"><strong>SERVICE DATE:</strong> {formattedServiceDate}</p>
              <p className="text-xs text-emerald-700 font-bold flex items-center gap-1 justify-start sm:justify-end">
                <CheckCircle2 className="h-3.5 w-3.5" /> SERVICE COMPLETED
              </p>
            </div>
          </div>

          {/* Customer & Next Service Due Section */}
          <div className="mt-6 grid sm:grid-cols-12 gap-4 text-xs">
            <div className="sm:col-span-7 rounded-2xl bg-gray-50 border border-gray-200 p-4">
              <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">CUSTOMER DETAILS</span>
              <p className="text-base font-black text-gray-900 mt-1">{upper(svc.customer_name)}</p>
              {svc.phone && <p className="text-gray-700 mt-0.5"><strong>PHONE:</strong> {svc.phone}</p>}
              {svc.address && <p className="text-gray-700"><strong>ADDRESS:</strong> {upper(svc.address)}</p>}
              <p className="text-gray-700 mt-1"><strong>SERVICE TYPE:</strong> {upper(svc.service_type)}</p>
            </div>

            <div className="sm:col-span-5 rounded-2xl bg-amber-50 border border-amber-300 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px] uppercase tracking-wider">
                  <Calendar className="h-4 w-4 text-amber-700" /> Next Filter Replacement
                </div>
                <p className="text-xs text-amber-800 mt-1">Recommended 90-day maintenance cycle date:</p>
              </div>
              <div className="text-lg font-black text-amber-950 font-mono mt-2">
                {svc.next_service_date ? formattedNextDate : "SCHEDULED IN 90 DAYS"}
              </div>
            </div>
          </div>

          {/* Itemized Service Table */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-300">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[11px] border-b border-gray-300">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">REPLACEMENT ITEM / SERVICE CALL</th>
                  <th className="py-3 px-4 text-right">PRICE AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.length === 0 ? (
                  <tr>
                    <td className="py-4 px-4 text-center font-bold text-gray-500">01</td>
                    <td className="py-4 px-4 font-bold text-gray-900">{upper(svc.service_type)} (GENERAL INSPECTION & SERVICE)</td>
                    <td className="py-4 px-4 text-right font-black">{fmtMoney(total)}</td>
                  </tr>
                ) : (
                  items.map((it: any, idx: number) => (
                    <tr key={it.id}>
                      <td className="py-4 px-4 text-center font-bold text-gray-500">{String(idx + 1).padStart(2, "0")}</td>
                      <td className="py-4 px-4 font-bold text-gray-900">{upper(it.product_name)}</td>
                      <td className="py-4 px-4 text-right font-black">{fmtMoney(it.price)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals & Summary */}
          <div className="mt-6 grid sm:grid-cols-12 gap-6 items-start">
            <div className="sm:col-span-7 space-y-4">
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-3.5 text-xs">
                <span className="font-bold text-gray-500 text-[10px] uppercase block">AMOUNT IN WORDS</span>
                <p className="font-bold text-gray-900 mt-0.5">{numberToWords(total)}</p>
              </div>

              <div className="text-[10px] text-gray-500 space-y-1">
                <p className="font-bold text-gray-700">SERVICE GUARANTEE & TERMS:</p>
                <p>1. Installed spare parts carry 30 days operational warranty.</p>
                <p>2. Automatic 90-day filter replacement reminder registered in database.</p>
              </div>
            </div>

            <div className="sm:col-span-5 rounded-2xl bg-gray-50 border border-gray-300 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Service Subtotal:</span>
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
                <span className="text-lg text-emerald-700">{fmtMoney(total)}</span>
              </div>
            </div>
          </div>

          {/* Signatory Footer */}
          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-xs gap-4 text-gray-600">
            <p className="text-[10px] text-center sm:text-left">This is a computer-generated service tax invoice. No physical signature required.</p>
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
