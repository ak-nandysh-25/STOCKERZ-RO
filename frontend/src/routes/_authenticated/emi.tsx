import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Button, Card, Empty, Field, Input, PageHeader, Table, Td, Th } from "@/components/ui-kit";
import { fmtMoney } from "@/lib/app-utils";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/emi")({
  head: () => ({ meta: [{ title: "EMI Plans — STOCKERZ RO" }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["emi"],
    queryFn: async () => await apiClient.emi.list(),
  });

  const [f, setF] = useState({
    customer_name: "",
    phone: "",
    model: "",
    total_amount: 0,
    down_payment: 0,
    tenure_months: 12,
    start_date: new Date().toISOString().slice(0, 10),
  });

  const add = useMutation({
    mutationFn: async () => {
      await apiClient.emi.create({
        customerName: f.customer_name.toUpperCase(),
        phone: f.phone || null,
        model: f.model.toUpperCase(),
        totalAmount: f.total_amount,
        downPayment: f.down_payment,
        tenureMonths: f.tenure_months,
        startDate: f.start_date,
      });
    },
    onSuccess: () => {
      toast.success("EMI plan added");
      setF({ ...f, customer_name: "", phone: "", model: "", total_amount: 0, down_payment: 0 });
      qc.invalidateQueries({ queryKey: ["emi"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.emi.delete(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emi"] }),
  });

  return (
    <div>
      <PageHeader title="EMI Plans" description="Track installment plans" />
      <Card className="mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            add.mutate();
          }}
          className="grid grid-cols-1 gap-3 md:grid-cols-3"
        >
          <Field label="Customer name">
            <Input
              required
              value={f.customer_name}
              onChange={(e) => setF({ ...f, customer_name: e.target.value })}
              className="uppercase-data"
            />
          </Field>
          <Field label="Phone">
            <Input
              maxLength={10}
              value={f.phone}
              onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              placeholder="10-digit mobile number"
              className="font-mono tracking-wider"
            />
          </Field>
          <Field label="Machine / Model">
            <Input
              required
              value={f.model}
              onChange={(e) => setF({ ...f, model: e.target.value })}
              className="uppercase-data"
            />
          </Field>
          <Field label="Total amount">
            <Input
              type="number"
              step="0.01"
              min={0}
              value={f.total_amount}
              onChange={(e) => setF({ ...f, total_amount: Number(e.target.value) })}
            />
          </Field>
          <Field label="Down payment">
            <Input
              type="number"
              step="0.01"
              min={0}
              value={f.down_payment}
              onChange={(e) => setF({ ...f, down_payment: Number(e.target.value) })}
            />
          </Field>
          <Field label="Tenure (months)">
            <Input
              type="number"
              min={1}
              value={f.tenure_months}
              onChange={(e) => setF({ ...f, tenure_months: Number(e.target.value) })}
            />
          </Field>
          <Field label="Start date">
            <Input type="date" value={f.start_date} onChange={(e) => setF({ ...f, start_date: e.target.value })} />
          </Field>
          <div className="md:col-span-3 flex justify-end">
            <Button disabled={add.isPending}>Add EMI plan</Button>
          </div>
        </form>
      </Card>

      {rows.length === 0 ? (
        <Card>
          <Empty text="No EMI plans yet" />
        </Card>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Customer</Th>
              <Th>Model</Th>
              <Th>Total</Th>
              <Th>Down</Th>
              <Th>Tenure</Th>
              <Th>Monthly</Th>
              <Th>Start</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e: any) => {
              const customerName = e.customerName || e.customer_name;
              const totalAmount = e.totalAmount || e.total_amount;
              const downPayment = e.downPayment || e.down_payment;
              const tenureMonths = e.tenureMonths || e.tenure_months;
              const startDate = e.startDate || e.start_date;
              const monthly = (Number(totalAmount) - Number(downPayment)) / Number(tenureMonths);

              return (
                <tr key={e.id} className="hover:bg-white/5">
                  <Td className="font-medium">{customerName}</Td>
                  <Td>{e.model}</Td>
                  <Td>{fmtMoney(totalAmount)}</Td>
                  <Td>{fmtMoney(downPayment)}</Td>
                  <Td>{tenureMonths} MO</Td>
                  <Td className="text-primary">{fmtMoney(monthly)}</Td>
                  <Td>{typeof startDate === "string" ? startDate.slice(0, 10) : new Date(startDate).toISOString().slice(0, 10)}</Td>
                  <Td className="text-right">
                    <button onClick={() => del.mutate(e.id)} className="rounded p-1.5 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
