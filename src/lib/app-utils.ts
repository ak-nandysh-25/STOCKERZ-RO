import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useShop() {
  return useQuery({
    queryKey: ["shop"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
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

export function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  try {
    const cleanStr = d.slice(0, 10);
    const parts = cleanStr.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      return `${day}/${month}/${year}`;
    }
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    const day = String(dt.getDate()).padStart(2, "0");
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const year = dt.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return d;
  }
}

export function fmtDateReadable(d: string | null | undefined) {
  if (!d) return "—";
  try {
    const cleanStr = d.slice(0, 10);
    const dt = new Date(`${cleanStr}T00:00:00`);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}
