import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle2, Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { sendOtpFn, verifyOtpFn } from "@/lib/otp-server";
import { provisionAdminServerFn, logAuthActivityServerFn } from "@/lib/admin-provision-server";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "System Admin Sign In — STOCKERZ RO" },
      { name: "description", content: "System Administrator OTP access to view all registered shops on STOCKERZ RO." },
      { property: "og:title", content: "System Admin Sign In — STOCKERZ RO" },
      { property: "og:description", content: "System Administrator OTP access to view all registered shops on STOCKERZ RO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  const [step, setStep] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState("aknandysh26@gmail.com");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [devOtpMessage, setDevOtpMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check existing admin session
    if (typeof window !== "undefined") {
      const activeAdmin = localStorage.getItem("stockerz_admin_user");
      if (activeAdmin) {
        nav({ to: "/admin" });
        return;
      }
    }

    const checkAdmin = async (userId: string) => {
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
      if (isAdmin) nav({ to: "/admin" });
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) checkAdmin(data.session.user.id);
    });
  }, [nav]);

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Step 1: Send OTP to authorized Admin email address (no password required)
  async function handleSendAdminOtp(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Please enter a valid admin email address");
      return;
    }

    const AUTHORIZED_ADMIN = "aknandysh26@gmail.com";
    if (cleanEmail !== AUTHORIZED_ADMIN) {
      toast.error(`Access restricted. "${cleanEmail}" is not authorized for system admin access.`);
      return;
    }

    setLoading(true);
    setDevOtpMessage(null);
    try {
      const res = await sendOtpFn({ data: { email: cleanEmail } });
      if (res.success) {
        toast.success(res.message);
        setStep("verify");
        setOtpCountdown(60);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send admin verification code");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Confirm OTP code, auto-provision server admin role, and enter dashboard
  async function handleVerifyAdminOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otpCode.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await verifyOtpFn({ data: { email: cleanEmail, otp: otpCode } });

      if (!res.success) {
        toast.error(res.message);
        setLoading(false);
        return;
      }

      // Provision Admin Account on Server using Service Role Key
      try {
        await provisionAdminServerFn({
          data: { email: cleanEmail, password: "adminpassword123" },
        });
      } catch (provErr) {
        console.warn("Server admin provision notice:", provErr);
      }

      // Log admin login activity in auth_logs
      try {
        await logAuthActivityServerFn({
          data: {
            email: cleanEmail,
            eventType: "admin_login",
            shopName: "SYSTEM ADMIN",
            status: "success",
          },
        });
      } catch (logErr) {
        console.warn("Admin log notice:", logErr);
      }

      // Store OTP admin session in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("stockerz_admin_user", cleanEmail);
      }

      toast.success("Welcome, System Administrator!");

      if (typeof window !== "undefined") {
        window.location.href = "/admin";
      } else {
        nav({ to: "/admin", replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || "Admin verification failed.");
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

        <h1 className="text-2xl font-bold">
          {step === "email" ? "Admin Sign In" : "Admin OTP Verification"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === "email"
            ? "Enter your authorized admin email to receive a 6-digit OTP code."
            : `Enter the 6-digit verification code sent to ${email}`}
        </p>

        {/* STEP 1: ADMIN EMAIL INPUT (NO PASSWORD REQUIRED) */}
        {step === "email" ? (
          <form onSubmit={handleSendAdminOtp} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Authorized Admin Email</span>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="aknandysh26@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-input px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Send Admin OTP Code →</>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: 6-DIGIT OTP VERIFICATION CODE INPUT */
          <form onSubmit={handleVerifyAdminOtp} className="mt-6 space-y-5">
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-3.5 text-xs space-y-1">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <ShieldCheck className="h-4 w-4" />
                System Admin Verification
              </div>
              <div className="text-muted-foreground pt-0.5">
                Target Email: <span className="font-semibold text-foreground">{email}</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <span className="mb-2 text-xs font-medium text-muted-foreground">
                Enter 6-Digit Admin Verification Code
              </span>
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={(val) => setOtpCode(val)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Confirm & Enter Admin Control Center
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Edit Admin Email
              </button>

              {otpCountdown > 0 ? (
                <span className="text-muted-foreground">
                  Resend in <strong className="text-foreground">{otpCountdown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleSendAdminOtp(e)}
                  className="font-medium text-primary hover:underline cursor-pointer"
                >
                  Resend OTP Code
                </button>
              )}
            </div>
          </form>
        )}

        <div className="mt-6 flex items-center justify-between text-sm border-t border-white/10 pt-4">
          <Link to="/auth" search={{ mode: "login" }} className="text-muted-foreground hover:text-foreground">
            Not an admin? <span className="text-foreground font-medium">Showroom Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
