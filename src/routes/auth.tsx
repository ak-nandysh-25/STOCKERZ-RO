import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Droplet, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({ mode: z.enum(["login", "signup", "forgot"]).optional() });

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — STOCKERZ RO" },
      { name: "description", content: "Log in or create your STOCKERZ RO shop account." },
    ],
  }),
  validateSearch: searchSchema,
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(search.mode ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/dashboard" });
    });
  }, [nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        nav({ to: "/dashboard" });
      } else if (mode === "signup") {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        if (shopName && data.user) {
          // Update the auto-created shop name
          await supabase.from("shops").update({ name: shopName.toUpperCase() }).eq("owner_id", data.user.id);
        }
        toast.success("Account created");
        nav({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset email sent");
        setMode("login");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="aurora-bg grid min-h-screen place-items-center px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8 shadow-2xl">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/20 text-primary">
            <Droplet className="h-5 w-5" />
          </div>
          <span className="font-bold tracking-tight">STOCKERZ RO</span>
        </Link>
        <h1 className="text-2xl font-bold">
          {mode === "login" ? "Sign in" : mode === "signup" ? "Create your shop" : "Reset password"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login" && "Access your shop dashboard"}
          {mode === "signup" && "One account per shop, fully isolated"}
          {mode === "forgot" && "We'll email you a reset link"}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <Field label="Shop name">
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="AQUA PURE RO"
                className="w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary uppercase-data"
              />
            </Field>
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
          {mode !== "forgot" && (
            <Field label="Password">
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-input px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Sign in" : mode === "signup" ? "Create shop" : "Send reset link"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-sm">
          {mode === "login" && (
            <>
              <button onClick={() => setMode("forgot")} className="text-primary hover:underline text-left">
                Forgot password?
              </button>
              <button onClick={() => setMode("signup")} className="text-muted-foreground hover:text-foreground text-left">
                Need an account? <span className="text-foreground">Create shop</span>
              </button>
            </>
          )}
          {mode === "signup" && (
            <button onClick={() => setMode("login")} className="text-muted-foreground hover:text-foreground text-left">
              Already have a shop? <span className="text-foreground">Sign in</span>
            </button>
          )}
          {mode === "forgot" && (
            <button onClick={() => setMode("login")} className="text-muted-foreground hover:text-foreground text-left">
              Back to sign in
            </button>
          )}
        </div>
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
