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

export function numberToWords(num: number | string | null | undefined): string {
  const n = Math.floor(Number(num ?? 0));
  if (isNaN(n) || n <= 0) return "Rupees Zero Only";
  
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
    "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty ", "Thirty ", "Forty ", "Fifty ", "Sixty ", "Seventy ", "Eighty ", "Ninety "];

  function inWords(val: number): string {
    if (val < 20) return a[val];
    if (val < 100) return b[Math.floor(val / 10)] + a[val % 10];
    if (val < 1000) return a[Math.floor(val / 100)] + "Hundred " + inWords(val % 100);
    if (val < 100000) return inWords(Math.floor(val / 1000)) + "Thousand " + inWords(val % 1000);
    if (val < 10000000) return inWords(Math.floor(val / 100000)) + "Lakh " + inWords(val % 100000);
    return inWords(Math.floor(val / 10000000)) + "Crore " + inWords(val % 10000000);
  }

  const result = inWords(n).trim();
  return `Rupees ${result} Only`;
}

export function getAppRedirectUrl(path: string = ""): string {
  const prodUrl = "https://stockerzro.vercel.app";
  let origin = prodUrl;
  if (typeof window !== "undefined" && window.location?.origin) {
    const loc = window.location.origin;
    if (!loc.includes("localhost") && !loc.includes("127.0.0.1")) {
      origin = loc;
    }
  }
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `${origin}${cleanPath}`;
}

