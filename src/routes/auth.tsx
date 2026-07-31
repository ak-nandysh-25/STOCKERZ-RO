import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Droplet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({ mode: z.enum(["login", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — STOCKERZ RO" },
      { name: "description", content: "Sign in with a one-time code or register your STOCKERZ RO shop." },
      { property: "og:title", content: "Sign in — STOCKERZ RO" },
      { property: "og:description", content: "Sign in with a one-time code or register your STOCKERZ RO shop." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: searchSchema,
  component: AuthPage,
});

const emptyShop = { name: "", contact: "", gst: "", address: "" };

function AuthPage() {
  const nav = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"login" | "signup">(search.mode ?? "login");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [shop, setShop] = useState(emptyShop);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/dashboard" });
    });
  }, [nav]);

  function switchMode(m: "login" | "signup") {
    setMode(m);
    setStep("details");
    setCode("");
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: mode === "signup",
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      toast.success("We emailed you a 6-digit code");
      setStep("otp");
    } catch (err: any) {
      toast.error(err.message ?? "Could not send the code");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "email" });
      if (error) throw error;
      if (mode === "signup" && data.user) {
        await supabase
          .from("shops")
          .update({
            name: shop.name.toUpperCase() || "MY SHOP",
            contact: shop.contact || null,
            email,
            gst: shop.gst.toUpperCase() || null,
            address: shop.address.toUpperCase() || null,
          })
          .eq("owner_id", data.user.id);
      }
      toast.success(mode === "signup" ? "Shop created" : "Welcome back");
      nav({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message ?? "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="aurora-bg grid min-h-screen place-items-center px-4 py-10">
      <div className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/20 text-primary">
            <Droplet className="h-5 w-5" />
          </div>
          <span className="font-bold tracking-tight">STOCKERZ RO</span>
        </Link>

        <h1 className="text-2xl font-bold">
          {step === "otp" ? "Enter your code" : mode === "login" ? "Sign in" : "Create your shop"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === "otp"
            ? `We sent a 6-digit code to ${email}`
            : mode === "login"
              ? "We'll email you a one-time code"
              : "Add your shop profile details to get started"}
        </p>

        {step === "details" ? (
          <form onSubmit={sendCode} className="mt-6 space-y-4">
            {mode === "signup" && (
              <>
                <Field label="Shop name">
                  <input
                    type="text"
                    required
                    value={shop.name}
                    onChange={(e) => setShop({ ...shop, name: e.target.value })}
                    placeholder="AQUA PURE RO"
                    className="w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary uppercase-data"
                  />
                </Field>
                <Field label="Contact number">
                  <input
                    type="tel"
                    required
                    value={shop.contact}
                    onChange={(e) => setShop({ ...shop, contact: e.target.value })}
                    className="w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </Field>
                <Field label="GST number (optional)">
                  <input
                    type="text"
                    value={shop.gst}
                    onChange={(e) => setShop({ ...shop, gst: e.target.value })}
                    className="w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary uppercase-data"
                  />
                </Field>
                <Field label="Shop address">
                  <textarea
                    rows={3}
                    value={shop.address}
                    onChange={(e) => setShop({ ...shop, address: e.target.value })}
                    className="w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary uppercase-data"
                  />
                </Field>
              </>
            )}
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="mt-6 space-y-4">
            <Field label="One-time code">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={8}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full rounded-lg bg-input px-3 py-3 text-center text-lg font-semibold tracking-[0.4em] outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify & continue
            </button>
            <div className="flex justify-between text-sm">
              <button type="button" onClick={() => setStep("details")} className="text-muted-foreground hover:text-foreground">
                Change email
              </button>
              <button type="button" onClick={(e) => sendCode(e)} className="text-primary hover:underline">
                Resend code
              </button>
            </div>
          </form>
        )}

        {step === "details" && (
          <div className="mt-6 text-sm">
            {mode === "login" ? (
              <button onClick={() => switchMode("signup")} className="text-muted-foreground hover:text-foreground">
                Need an account? <span className="text-foreground">Create shop</span>
              </button>
            ) : (
              <button onClick={() => switchMode("login")} className="text-muted-foreground hover:text-foreground">
                Already have a shop? <span className="text-foreground">Sign in</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
