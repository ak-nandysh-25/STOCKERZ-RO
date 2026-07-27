import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button, Card, Field, Input, PageHeader, Textarea } from "@/components/ui-kit";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Shop Profile — STOCKERZ RO" }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const { data: shop } = useQuery({
    queryKey: ["shop"],
    queryFn: async () => (await supabase.from("shops").select("*").maybeSingle()).data,
  });
  const [f, setF] = useState({ name: "", contact: "", email: "", gst: "", address: "", logo_url: "" });
  useEffect(() => {
    if (shop) setF({
      name: shop.name ?? "", contact: shop.contact ?? "", email: shop.email ?? "",
      gst: shop.gst ?? "", address: shop.address ?? "", logo_url: shop.logo_url ?? "",
    });
  }, [shop]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("shops").update({
        name: f.name.toUpperCase(), contact: f.contact, email: f.email,
        gst: f.gst.toUpperCase(), address: f.address.toUpperCase(), logo_url: f.logo_url || null,
      }).eq("id", shop!.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["shop"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  async function uploadLogo(file: File) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("shop-logos").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { data } = await supabase.storage.from("shop-logos").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
    if (data?.signedUrl) { setF(prev => ({ ...prev, logo_url: data.signedUrl })); toast.success("Logo uploaded"); }
  }

  return (
    <div>
      <PageHeader title="Shop Profile" description="Business details used on invoices" />
      <Card>
        <form onSubmit={e => { e.preventDefault(); save.mutate(); }} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2 flex items-center gap-4">
            {f.logo_url && <img src={f.logo_url} alt="Shop logo" className="h-16 w-16 rounded-lg border border-glass-border object-cover" />}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg glass px-3 py-2 text-sm hover:bg-white/10">
              <Upload className="h-4 w-4" /> Upload logo
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
            </label>
          </div>
          <Field label="Business name"><Input required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="uppercase-data" /></Field>
          <Field label="Contact number"><Input value={f.contact} onChange={e => setF({ ...f, contact: e.target.value })} /></Field>
          <Field label="Email"><Input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
          <Field label="GST number (optional)"><Input value={f.gst} onChange={e => setF({ ...f, gst: e.target.value })} className="uppercase-data" /></Field>
          <div className="md:col-span-2">
            <Field label="Address"><Textarea rows={3} value={f.address} onChange={e => setF({ ...f, address: e.target.value })} className="uppercase-data" /></Field>
          </div>
          <div className="md:col-span-2 flex justify-end"><Button disabled={save.isPending}>Save profile</Button></div>
        </form>
      </Card>
    </div>
  );
}
