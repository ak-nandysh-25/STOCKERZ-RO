import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useShop() {
  return useQuery({
    queryKey: ["shop"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shops").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function fmtMoney(n: number | string | null | undefined) {
  const v = Number(n ?? 0);
  return "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function upper(s: string | null | undefined) {
  return (s ?? "").toString().toUpperCase();
}

export function waLink(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
