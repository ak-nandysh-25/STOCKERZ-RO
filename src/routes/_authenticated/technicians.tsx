import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button, Card, Empty, Field, Input, PageHeader, Table, Td, Th } from "@/components/ui-kit";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/technicians")({
  head: () => ({ meta: [{ title: "Technicians — STOCKERZ RO" }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => (await supabase.from("technicians").select("*").order("name")).data ?? [],
  });
  const [f, setF] = useState({ name: "", phone: "", specialization: "" });
  const add = useMutation({
    mutationFn: async () => {
      const shop = await supabase.from("shops").select("id").maybeSingle();
      const { error } = await supabase.from("technicians").insert({
        shop_id: shop.data!.id, name: f.name.toUpperCase(), phone: f.phone || null, specialization: f.specialization.toUpperCase() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { setF({ name: "", phone: "", specialization: "" }); qc.invalidateQueries({ queryKey: ["technicians"] }); toast.success("Added"); },
  });
  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from("technicians").delete().eq("id", id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["technicians"] }),
  });

  return (
    <div>
      <PageHeader title="Technicians" description="Manage your service team" />
      <Card className="mb-6">
        <form onSubmit={e => { e.preventDefault(); add.mutate(); }} className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Field label="Name"><Input required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="uppercase-data" /></Field>
          <Field label="Phone"><Input maxLength={10} value={f.phone} onChange={e => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10-digit mobile number" className="font-mono tracking-wider" /></Field>
          <Field label="Specialization"><Input value={f.specialization} onChange={e => setF({ ...f, specialization: e.target.value })} className="uppercase-data" /></Field>
          <div className="flex items-end"><Button className="w-full" disabled={add.isPending}>Add technician</Button></div>
        </form>
      </Card>

      {rows.length === 0 ? <Card><Empty text="No technicians added" /></Card> : (
        <Table>
          <thead><tr><Th>Name</Th><Th>Phone</Th><Th>Specialization</Th><Th></Th></tr></thead>
          <tbody>
            {rows.map((t: any) => (
              <tr key={t.id} className="hover:bg-white/5">
                <Td className="font-medium">{t.name}</Td><Td>{t.phone ?? "—"}</Td><Td>{t.specialization ?? "—"}</Td>
                <Td className="text-right"><button onClick={() => del.mutate(t.id)} className="rounded p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
