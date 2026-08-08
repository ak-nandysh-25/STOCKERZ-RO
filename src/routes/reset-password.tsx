import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — STOCKERZ RO" }] }),
  component: ResetPage,
});

function ResetPage() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase will set session from the recovery link automatically.
    const sub = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.data.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      setLoading(false);
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      toast.error("Password must contain at least 1 special character");
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    nav({ to: "/dashboard" });
  }

  return (
    <div className="aurora-bg grid min-h-screen place-items-center px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8">
        <h1 className="text-2xl font-bold">Set new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter a new password for your account.</p>
        {!ready && <p className="mt-6 text-sm text-warning">Waiting for recovery session…</p>}
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-lg bg-input px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button disabled={loading || !ready} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Update password
          </button>
        </form>
      </div>
    </div>
  );
}
