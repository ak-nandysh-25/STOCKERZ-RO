import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui-kit";
import { fmtMoney, upper, waLink } from "@/lib/app-utils";
import { Printer, Download, MessageCircle, ArrowLeft } from "lucide-react";
import jsPDF from "jspdf";
import { useRef } from "react";

export const Route = createFileRoute("/_authenticated/invoice/$id")({
  head: () => ({ meta: [{ title: "Invoice — STOCKERZ RO" }] }),
  component: InvoicePage,
});

function InvoicePage() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const [sale, shop] = await Promise.all([
        supabase.from("sales").select("*").eq("id", id).single(),
        supabase.from("shops").select("*").maybeSingle(),
      ]);
      if (sale.error) throw sale.error;
      return { sale: sale.data, shop: shop.data };
    },
  });

  if (!data) return <div className="text-sm text-muted-foreground">Loading…</div>;
  const { sale, shop } = data;
  const total = Number(sale.price) * Number(sale.qty);
  const invoiceNo = sale.id.slice(0, 8).toUpperCase();

  function savePdf() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const M = 40;
    let y = M;
    doc.setFontSize(18); doc.text(upper(shop?.name ?? "SHOP"), M, y); y += 24;
    doc.setFontSize(10);
    if (shop?.address) { doc.text(upper(shop.address), M, y); y += 14; }
    if (shop?.contact) { doc.text(`PH: ${shop.contact}`, M, y); y += 14; }
    if (shop?.email) { doc.text(`EMAIL: ${upper(shop.email)}`, M, y); y += 14; }
    if (shop?.gst) { doc.text(`GST: ${upper(shop.gst)}`, M, y); y += 14; }
    y += 10;
    doc.setFontSize(14); doc.text(`INVOICE #${invoiceNo}`, M, y); y += 20;
    doc.setFontSize(10);
    doc.text(`DATE: ${sale.sale_date}`, M, y); y += 14;
    if (sale.customer_name) { doc.text(`CUSTOMER: ${upper(sale.customer_name)}`, M, y); y += 14; }
    if (sale.phone) { doc.text(`PHONE: ${sale.phone}`, M, y); y += 14; }
    if (sale.address) { doc.text(`ADDRESS: ${upper(sale.address)}`, M, y); y += 14; }
    y += 10;
    doc.line(M, y, 555, y); y += 16;
    doc.text("ITEM", M, y); doc.text("QTY", 340, y); doc.text("PRICE", 400, y); doc.text("TOTAL", 490, y); y += 10;
    doc.line(M, y, 555, y); y += 16;
    doc.text(upper(sale.product_name), M, y);
    doc.text(String(sale.qty), 340, y);
    doc.text(fmtMoney(sale.price), 400, y);
    doc.text(fmtMoney(total), 490, y); y += 18;
    doc.line(M, y, 555, y); y += 20;
    doc.setFontSize(12); doc.text(`GRAND TOTAL: ${fmtMoney(total)}`, 340, y);
    doc.save(`invoice-${invoiceNo}.pdf`);
  }

  const waMessage = `INVOICE #${invoiceNo}\n${upper(shop?.name ?? "")}\n${upper(sale.product_name)} x${sale.qty} - ${fmtMoney(total)}\nDATE: ${sale.sale_date}\nTHANK YOU!`;

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={() => nav({ to: "/sales" })}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <div className="flex-1" />
        <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
        <Button variant="outline" onClick={savePdf}><Download className="h-4 w-4" /> Save PDF</Button>
        {sale.phone && (
          <a href={waLink(sale.phone, waMessage)} target="_blank" rel="noreferrer">
            <Button><MessageCircle className="h-4 w-4" /> Share on WhatsApp</Button>
          </a>
        )}
      </div>

      <div ref={ref} className="invoice-print mx-auto max-w-2xl rounded-2xl bg-white p-8 text-black uppercase-data">
        <div className="flex items-start justify-between border-b border-gray-300 pb-4">
          <div>
            {shop?.logo_url && <img src={shop.logo_url} alt="" className="mb-2 h-16" />}
            <h1 className="text-2xl font-bold">{upper(shop?.name)}</h1>
            {shop?.address && <p className="text-xs text-gray-700">{upper(shop.address)}</p>}
            {shop?.contact && <p className="text-xs text-gray-700">PH: {shop.contact}</p>}
            {shop?.email && <p className="text-xs text-gray-700">{upper(shop.email)}</p>}
            {shop?.gst && <p className="text-xs text-gray-700">GST: {upper(shop.gst)}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">INVOICE</h2>
            <p className="text-xs">#{invoiceNo}</p>
            <p className="text-xs">DATE: {sale.sale_date}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-semibold text-gray-500">BILL TO</p>
            <p className="mt-1 text-sm font-bold">{upper(sale.customer_name) || "WALK-IN CUSTOMER"}</p>
            {sale.phone && <p>PHONE: {sale.phone}</p>}
            {sale.address && <p>{upper(sale.address)}</p>}
          </div>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-gray-400 text-left text-xs">
              <th className="py-2">ITEM</th><th className="py-2">QTY</th><th className="py-2">PRICE</th><th className="py-2 text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-3">{upper(sale.product_name)}{sale.product_type ? ` (${upper(sale.product_type)})` : ""}</td>
              <td className="py-3">{sale.qty}</td>
              <td className="py-3">{fmtMoney(sale.price)}</td>
              <td className="py-3 text-right">{fmtMoney(total)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="py-3 text-right font-bold">GRAND TOTAL</td>
              <td className="py-3 text-right text-lg font-bold">{fmtMoney(total)}</td>
            </tr>
          </tfoot>
        </table>

        <p className="mt-8 text-center text-xs text-gray-600">THANK YOU FOR YOUR BUSINESS!</p>
      </div>
    </div>
  );
}
