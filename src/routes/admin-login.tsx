import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";

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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      const { data: isAdmin, error: roleErr } = await supabase.rpc("has_role", {
        _user_id: data.user.id,
        _role: "admin",
      });
      if (roleErr) throw roleErr;
      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error("This account does not have admin access");
      }
      toast.success("Welcome, admin");
      nav({ to: "/admin" });
    } catch (err: any) {
      toast.error(err.message ?? "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="aurora-bg grid min-h-screen place-items-center px-4 py-10">
      <div className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/20 text-accent">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-bold tracking-tight">STOCKERZ RO — ADMIN</span>
          </div>
          <ThemeToggle />
        </div>

        <h1 className="text-2xl font-bold">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Restricted access. Admin accounts only.</p>



        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</span>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-input px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in as admin
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link to="/auth" search={{ mode: "login" }} className="text-muted-foreground hover:text-foreground">
            Not an admin? <span className="text-foreground">Shop sign in</span>
          </Link>
          <Link to="/auth" search={{ mode: "forgot" }} className="text-xs text-muted-foreground hover:text-primary transition">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
