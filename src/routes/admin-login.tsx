import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KeyRound, Loader2, Mail, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Admin OTP Sign in — STOCKERZ RO" },
      { name: "description", content: "Passwordless OTP access for STOCKERZ RO System Administrator." },
      { property: "og:title", content: "Admin OTP Sign in — STOCKERZ RO" },
      { property: "og:description", content: "Passwordless OTP access for STOCKERZ RO System Administrator." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AdminOtpLogin,
});

function AdminOtpLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAdmin = async (userId: string) => {
      let isAdmin = false;
      try {
        const { data: roleRes } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
        isAdmin = !!roleRes;
      } catch (_) {}

      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData.user?.email?.toLowerCase();
      if (!isAdmin && (userEmail === "konandysh26@gmail.com" || userEmail === "aknandysh26@gmail.com")) {
        isAdmin = true;
      }

      if (isAdmin) {
        nav({ to: "/admin" });
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) checkAdmin(data.session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) checkAdmin(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [nav]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error("Please enter your admin email address.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      setOtpSent(true);
      toast.success(`OTP code sent to ${cleanEmail}! Please check your email inbox.`);
    } catch (err: any) {
      console.error("OTP send error:", err);
      toast.error(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otpToken.trim();

    if (!cleanOtp) {
      toast.error("Please enter the OTP verification code.");
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP with Supabase Auth
      let { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanOtp,
        type: "email",
      });

      if (error) {
        // Retry with type signup/magiclink if email type didn't match
        const retryRes = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanOtp,
          type: "magiclink",
        });
        if (retryRes.data?.session) {
          data = retryRes.data;
          error = null;
        }
      }

      if (error || !data?.user) {
        throw error || new Error("Invalid or expired OTP code.");
      }

      // 2. Verify Admin Rights
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
        throw new Error("This account does not have system administrator privileges.");
      }

      toast.success("OTP Verified! Redirecting to Admin Panel...");
      nav({ to: "/admin" });
    } catch (err: any) {
      console.error("OTP verification error:", err);
      toast.error(err.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="aurora-bg grid min-h-screen place-items-center px-4 py-10">
      <div className="glass w-full max-w-md rounded-3xl p-6 shadow-2xl sm:p-8 border border-glass-border">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/20 text-primary border border-primary/30 shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-bold tracking-tight text-foreground">STOCKERZ RO — ADMIN</span>
          </div>
          <ThemeToggle />
        </div>

        <h1 className="text-2xl font-black text-foreground tracking-tight">Admin OTP Login</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Passwordless security. Enter your admin email to receive a 6-digit OTP code.
        </p>

        {!otpSent ? (
          /* Step 1: Enter Email & Request OTP */
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Admin Email Address
              </span>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="konandysh26@gmail.com"
                  className="w-full rounded-xl bg-input px-3.5 py-3 pr-10 text-sm text-foreground outline-none border border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending OTP...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" /> Send OTP Code
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: Enter OTP Token & Verify */
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-3.5 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <div className="text-xs text-foreground font-medium">
                OTP sent to <span className="font-bold">{email}</span>
              </div>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                6-Digit OTP Code
              </span>
              <input
                type="text"
                required
                maxLength={6}
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center tracking-[0.4em] font-mono text-xl font-bold rounded-xl bg-input px-3.5 py-3 text-foreground outline-none border border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying OTP...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" /> Verify & Access Admin
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Change Email
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-end">
          <Link to="/auth" search={{ mode: "login" }} className="text-xs text-muted-foreground hover:text-foreground">
            Shop Sign in →
          </Link>
        </div>
      </div>
    </div>
  );
}
