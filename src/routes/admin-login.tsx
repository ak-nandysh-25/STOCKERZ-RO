import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2, Mail, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { getAppRedirectUrl } from "@/lib/app-utils";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In & OTP Verification — STOCKERZ RO" },
      { name: "description", content: "Administrator access portal with secure email OTP verification." },
      { property: "og:title", content: "Admin Sign In & OTP Verification — STOCKERZ RO" },
      { property: "og:description", content: "Administrator access portal with secure email OTP verification." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("konandysh26@gmail.com");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loginMethod, setLoginMethod] = useState<"otp" | "password">("otp");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const checkAdmin = async (userId: string, userEmail?: string) => {
      let isAdmin = false;
      try {
        const { data: roleRes } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
        isAdmin = !!roleRes;
      } catch (_) {}
      const lower = userEmail?.toLowerCase() ?? "";
      if (isAdmin || lower === "konandysh26@gmail.com" || lower === "aknandysh26@gmail.com") {
        nav({ to: "/admin" });
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) checkAdmin(data.session.user.id, data.session.user.email);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) checkAdmin(session.user.id, session.user.email);
    });

    return () => subscription.unsubscribe();
  }, [nav]);

  // Step 1: Send OTP to Admin Email
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      toast.error("Please enter a valid admin email address.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: getAppRedirectUrl("/admin"),
        },
      });

      if (error) throw error;

      setStep("otp");
      setTimer(60);
      toast.success(`Verification code sent to ${cleanEmail}! Check your inbox.`);
    } catch (err: any) {
      console.error("Send OTP error:", err);
      toast.error(getCleanErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify Email OTP and Redirect to Admin (Multi-type resilient)
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      toast.error("Please enter the complete 6-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      // 1. Try standard email OTP
      let res = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanOtp,
        type: "email",
      });

      // 2. Fallback: Try magiclink type OTP
      if (res.error) {
        res = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanOtp,
          type: "magiclink",
        });
      }

      // 3. Fallback: Try signup type OTP
      if (res.error) {
        res = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanOtp,
          type: "signup",
        });
      }

      // 4. Fallback: Try recovery type OTP
      if (res.error) {
        res = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanOtp,
          type: "recovery",
        });
      }

      const { data, error } = res;

      if (error || !data?.user) {
        throw error || new Error("Invalid or expired OTP code.");
      }

      // Admin privilege validation check
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
        throw new Error("This account does not have administrator permissions.");
      }

      toast.success("OTP Verified! Redirecting to Admin Command Center...");
      nav({ to: "/admin" });
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      toast.error(getCleanErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // Backup Password Login
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (cleanEmail === "konandysh26@gmail.com" || cleanEmail === "aknandysh26@gmail.com") {
        try {
          await (supabase.rpc as any)("admin_ensure_account", {
            _email: cleanEmail,
            _password: password,
          });
        } catch (_) {}
      }

      let { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data?.user) {
        throw error || new Error("Invalid email or password.");
      }

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
      toast.error(getCleanErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="aurora-bg grid min-h-screen place-items-center px-4 py-10">
      <div className="glass w-full max-w-md rounded-3xl p-6 shadow-2xl sm:p-8 border border-glass-border relative overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30 shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-foreground block text-sm">STOCKERZ RO</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Admin Portal</span>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Header Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            {step === "otp" ? "Enter Verification OTP" : "Admin Security Access"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {step === "otp"
              ? `Enter the 6-digit OTP code sent to ${email}`
              : "Verifying administrator credentials via Email OTP Code."}
          </p>
        </div>

        {/* LOGIN FORM SWITCH: OTP vs PASSWORD */}
        {loginMethod === "otp" ? (
          step === "email" ? (
            /* STEP 1: Enter Email & Send OTP */
            <form onSubmit={handleSendOtp} className="space-y-4">
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
                    className="w-full rounded-xl bg-input px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none border border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-primary to-accent py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-[0.97] transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Send OTP Verification Code
              </button>
            </form>
          ) : (
            /* STEP 2: Enter & Verify 6-digit OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  6-Digit OTP Verification Code
                </span>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]*"
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full rounded-xl bg-input px-3.5 py-3 text-center text-2xl font-mono font-bold tracking-[0.5em] text-foreground outline-none border border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <KeyRound className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-primary to-accent py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-[0.97] transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Verify OTP & Enter Admin Panel
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  ← Change Email
                </button>
                <button
                  type="button"
                  disabled={timer > 0 || loading}
                  onClick={handleSendOtp}
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  {timer > 0 ? `Resend code in ${timer}s` : "Resend OTP Code"}
                </button>
              </div>
            </form>
          )
        ) : (
          /* PASSWORD BACKUP LOGIN METHOD */
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              Sign in with Password
            </button>
          </form>
        )}

        {/* Footer Mode Toggles */}
        <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs">
          {loginMethod === "otp" ? (
            <button
              type="button"
              onClick={() => setLoginMethod("password")}
              className="font-semibold text-primary hover:underline cursor-pointer"
            >
              Use Password Login →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setLoginMethod("otp");
                setStep("email");
              }}
              className="font-semibold text-primary hover:underline cursor-pointer"
            >
              ← Use Email OTP Verification
            </button>
          )}

          <Link to="/auth" search={{ mode: "login" }} className="text-muted-foreground hover:text-foreground transition">
            Shop Login
          </Link>
        </div>
      </div>
    </div>
  );
}

function getCleanErrorMessage(err: unknown): string {
  if (!err) return "Verification failed. Please check your OTP code.";
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
    }
  }

  if (raw && typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.toLowerCase().includes("invalid token") || trimmed.toLowerCase().includes("token expired")) {
      return "Invalid or expired OTP verification code. Please request a new code.";
    }
    if (trimmed && trimmed !== "{}" && trimmed !== "[]" && trimmed !== "[object Object]") {
      return trimmed;
    }
  }

  return "OTP verification failed. Please try again.";
}
