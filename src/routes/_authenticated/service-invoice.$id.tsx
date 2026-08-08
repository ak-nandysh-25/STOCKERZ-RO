import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui-kit";
import { fmtMoney, upper, waLink, fmtDate } from "@/lib/app-utils";
import { Printer, Download, MessageCircle, ArrowLeft } from "lucide-react";
import jsPDF from "jspdf";

export const Route = createFileRoute("/_authenticated/service-invoice/$id")({
  head: () => ({ meta: [{ title: "Service Invoice — STOCKERZ RO" }] }),
  component: ServiceInvoicePage,
});

function ServiceInvoicePage() {
  const { id } = Route.useParams();
  const nav = useNavigate();

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

  if (!data) return <div className="text-sm text-muted-foreground">Loading…</div>;
  const { svc, shop } = data;
  const items = (svc.service_items ?? []) as any[];
  const total = items.reduce((s, it) => s + Number(it.price), 0);
  const invoiceNo = svc.id.slice(0, 8).toUpperCase();

  function savePdf() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const M = 40;
    let y = M;
    doc.setFontSize(18); doc.text(upper(shop?.name ?? "SHOP"), M, y); y += 24;
    doc.setFontSize(10);
    if (shop?.address) { doc.text(upper(shop.address), M, y); y += 14; }
    if (shop?.contact) { doc.text(`PH: ${shop.contact}`, M, y); y += 14; }
    if (shop?.gst) { doc.text(`GST: ${upper(shop.gst)}`, M, y); y += 14; }
    y += 10;
    doc.setFontSize(14); doc.text(`SERVICE INVOICE #${invoiceNo}`, M, y); y += 20;
    doc.setFontSize(10);
    doc.text(`DATE: ${fmtDate(svc.service_date)}`, M, y); y += 14;
    doc.text(`CUSTOMER: ${upper(svc.customer_name)}`, M, y); y += 14;
    if (svc.phone) { doc.text(`PHONE: ${svc.phone}`, M, y); y += 14; }
    if (svc.address) { doc.text(`ADDRESS: ${upper(svc.address)}`, M, y); y += 14; }
    doc.text(`SERVICE: ${upper(svc.service_type)}`, M, y); y += 14;
    if (svc.next_service_date) { doc.text(`NEXT SERVICE: ${fmtDate(svc.next_service_date)}`, M, y); y += 14; }
    y += 10;
    doc.line(M, y, 555, y); y += 16;
    doc.text("ITEM", M, y); doc.text("PRICE", 490, y); y += 10;
    doc.line(M, y, 555, y); y += 16;
    for (const it of items) {
      doc.text(upper(it.product_name), M, y);
      doc.text(fmtMoney(it.price), 490, y);
      y += 16;
    }
    doc.line(M, y, 555, y); y += 20;
    doc.setFontSize(12); doc.text(`GRAND TOTAL: ${fmtMoney(total)}`, 340, y);
    doc.save(`service-${invoiceNo}.pdf`);
  }

  const waMessage = `SERVICE #${invoiceNo}\n${upper(shop?.name ?? "")}\n${upper(svc.service_type)} - ${fmtMoney(total)}\nDATE: ${fmtDate(svc.service_date)}${svc.next_service_date ? `\nNEXT: ${fmtDate(svc.next_service_date)}` : ""}\nTHANK YOU!`;

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={() => nav({ to: "/service" })}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <div className="flex-1" />
        <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
        <Button variant="outline" onClick={savePdf}><Download className="h-4 w-4" /> Save PDF</Button>
        {svc.phone && (
          <a href={waLink(svc.phone, waMessage)} target="_blank" rel="noreferrer">
            <Button><MessageCircle className="h-4 w-4" /> Share on WhatsApp</Button>
          </a>
        )}
      </div>

      <div className="invoice-print mx-auto max-w-2xl rounded-2xl bg-white p-6 text-black uppercase-data md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-300 pb-4">
          <div className="min-w-0">
            {shop?.logo_url && <img src={shop.logo_url} alt="" className="mb-2 h-16" />}
            <h1 className="text-xl font-bold md:text-2xl">{upper(shop?.name)}</h1>
            {shop?.address && <p className="text-xs text-gray-700">{upper(shop.address)}</p>}
            {shop?.contact && <p className="text-xs text-gray-700">PH: {shop.contact}</p>}
            {shop?.gst && <p className="text-xs text-gray-700">GST: {upper(shop.gst)}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold md:text-xl">SERVICE INVOICE</h2>
            <p className="text-xs">#{invoiceNo}</p>
            <p className="text-xs">DATE: {fmtDate(svc.service_date)}</p>
            {svc.next_service_date && <p className="text-xs">NEXT: {fmtDate(svc.next_service_date)}</p>}
          </div>
        </div>

        <div className="mt-6 text-xs">
          <p className="font-semibold text-gray-500">BILL TO</p>
          <p className="mt-1 text-sm font-bold">{upper(svc.customer_name)}</p>
          {svc.phone && <p>PHONE: {svc.phone}</p>}
          {svc.address && <p>{upper(svc.address)}</p>}
          <p className="mt-2">SERVICE: {upper(svc.service_type)}</p>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-gray-400 text-left text-xs">
              <th className="py-2">ITEM</th><th className="py-2 text-right">PRICE</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td className="py-3 text-gray-500" colSpan={2}>NO ITEMS</td></tr>
            ) : items.map((it: any) => (
              <tr key={it.id} className="border-b border-gray-200">
                <td className="py-3">{upper(it.product_name)}</td>
                <td className="py-3 text-right">{fmtMoney(it.price)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="py-3 text-right font-bold">GRAND TOTAL</td>
              <td className="py-3 text-right text-lg font-bold">{fmtMoney(total)}</td>
            </tr>
          </tfoot>
        </table>

        <p className="mt-8 text-center text-xs text-gray-600">THANK YOU FOR YOUR BUSINESS!</p>
      </div>
    </div>
  );
}
