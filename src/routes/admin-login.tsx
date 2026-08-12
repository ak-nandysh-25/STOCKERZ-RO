import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { getAppRedirectUrl } from "@/lib/app-utils";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Admin sign in — STOCKERZ RO" },
      { name: "description", content: "Administrator access to view every shop registered on STOCKERZ RO." },
      { property: "og:title", content: "Admin sign in — STOCKERZ RO" },
      { property: "og:description", content: "Administrator access to view every shop registered on STOCKERZ RO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLogin,
});



function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAdmin = async (userId: string) => {
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
      if (isAdmin) nav({ to: "/admin" });
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) checkAdmin(data.session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) checkAdmin(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Proactively auto-provision system admin account if using system admin email
      if (cleanEmail === "konandysh26@gmail.com" || cleanEmail === "aknandysh26@gmail.com") {
        try {
          await (supabase.rpc as any)("admin_ensure_account", {
            _email: cleanEmail,
            _password: password,
          });
        } catch (rpcErr) {
          console.warn("admin_ensure_account RPC fallback warning:", rpcErr);
        }
      }

      // 2. Attempt standard sign in
      let { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      // 3. Fallback: If sign-in failed, attempt RPC provision again or signup
      if (error) {
        try {
          const { data: rpcSuccess } = await (supabase.rpc as any)("admin_ensure_account", {
            _email: cleanEmail,
            _password: password,
          });

          if (rpcSuccess) {
            const retryRes = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password,
            });
            if (retryRes.data?.user) {
              data = retryRes.data;
              error = null;
            }
          }
        } catch (_) {}
      }

      if (error) {
        // Fallback: Attempt sign up
        const signUpRes = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: getAppRedirectUrl("/admin") },
        });

        if (signUpRes.data?.user && signUpRes.data.session) {
          data = signUpRes.data;
          error = null;
        } else if (signUpRes.data?.user) {
          const retryRes = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (retryRes.data?.user) {
            data = retryRes.data;
            error = null;
          } else if (retryRes.error) {
            error = retryRes.error;
          }
        }
      }

      if (error || !data?.user) {
        throw error || new Error("Invalid email or password.");
      }

      // Check Admin Role
      let isAdmin = false;
      try {
        const { data: roleRes } = await supabase.rpc("has_role", {
          _user_id: data.user.id,
          _role: "admin",
        });
        isAdmin = !!roleRes;
      } catch (_) {}

      if (!isAdmin && (cleanEmail === "konandysh26@gmail.com" || cleanEmail === "aknandysh26@gmail.com")) {
        isAdmin = true;
      }

      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error("This account does not have admin privileges.");
      }

      toast.success("Welcome, System Administrator!");
      nav({ to: "/admin" });
    } catch (err: any) {
      console.error("Admin sign-in error:", err);
      const msg = getCleanErrorMessage(err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const fillAdminCredentials = () => {
    setEmail("konandysh26@gmail.com");
    setPassword("konandysh2026@#");
    toast.info("Admin credentials pre-filled!");
  };

  return (
    <div className="aurora-bg grid min-h-screen place-items-center px-4 py-10">
      <div className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8 border border-glass-border">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/20 text-primary border border-primary/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-bold tracking-tight text-foreground">STOCKERZ RO — ADMIN</span>
          </div>
          <ThemeToggle />
        </div>

        <h1 className="text-2xl font-black text-foreground tracking-tight">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Restricted system command center for shop oversight.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="konandysh26@gmail.com"
              className="w-full rounded-xl bg-input px-3.5 py-2.5 text-sm text-foreground outline-none border border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</span>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-input px-3.5 py-2.5 pr-10 text-sm text-foreground outline-none border border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110 disabled:opacity-60 cursor-pointer"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in as Admin
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            Auto-fill Admin Logins
          </button>
          <Link to="/auth" search={{ mode: "login" }} className="text-xs text-muted-foreground hover:text-foreground">
            Shop Login →
          </Link>
        </div>
      </div>
    </div>
  );
}

function getCleanErrorMessage(err: unknown): string {
  if (!err) return "Sign in failed. Please check credentials.";
  let raw: string | undefined;
  if (typeof err === "string") {
    raw = err;
  } else if (err instanceof Error && err.message) {
    raw = err.message;
  } else if (typeof err === "object" && err !== null) {
    const e = err as Record<string, any>;
    if (typeof e.message === "string" && e.message) {
      raw = e.message;
    } else if (typeof e.error_description === "string" && e.error_description) {
      raw = e.error_description;
    } else if (typeof e.error === "string" && e.error) {
      raw = e.error;
    } else if (e.error && typeof e.error === "object" && typeof e.error.message === "string") {
      raw = e.error.message;
    }
  }

  if (raw && typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.toLowerCase().includes("invalid login credentials")) {
      return "Invalid email or password. Please check your admin credentials.";
    }
    if (trimmed && trimmed !== "{}" && trimmed !== "[]" && trimmed !== "[object Object]" && trimmed !== "null") {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed?.message && typeof parsed.message === "string" && parsed.message.trim() !== "{}") {
          return parsed.message;
        }
      } catch {}
      return trimmed;
    }
  }

  return "Invalid email or password. Please run the Supabase admin creation SQL script in SQL Editor.";
}

