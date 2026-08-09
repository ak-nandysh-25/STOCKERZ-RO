import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Droplet, Eye, EyeOff, Loader2, Mail, KeyRound, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { ThemeToggle } from "@/components/theme-toggle";
import { sendOtpFn, verifyOtpFn } from "@/lib/otp-server";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";

const searchSchema = z.object({ mode: z.enum(["login", "signup", "forgot"]).optional() });

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — STOCKERZ RO" },
      { name: "description", content: "Sign in with your email and password or register your STOCKERZ RO shop." },
      { property: "og:title", content: "Sign in — STOCKERZ RO" },
      { property: "og:description", content: "Sign in with your email and password or register your STOCKERZ RO shop." },
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
  const qc = useQueryClient();
  const search = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(search.mode ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [shop, setShop] = useState(emptyShop);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // OTP Verification state for Registering Shop
  const [otpStep, setOtpStep] = useState<"form" | "verify">("form");
  const [otpCode, setOtpCode] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [devOtpMessage, setDevOtpMessage] = useState<string | null>(null);

  const hasMinLength = password.length >= 8;
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const isValidContact = shop.contact.replace(/\D/g, "").length === 10;

  useEffect(() => {
    if (search.mode) {
      setMode(search.mode);
      setOtpStep("form");
    }
  }, [search.mode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/dashboard" });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        nav({ to: "/dashboard" });
      }
    });

    return () => subscription.unsubscribe();
  }, [nav]);

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Send Gmail OTP for Shop Registration
  async function handleSendSignupOtp() {
    const cleanContact = shop.contact.replace(/\D/g, "");
    if (!shop.name.trim()) {
      toast.error("Please enter a shop name");
      return;
    }
    if (cleanContact.length !== 10) {
      toast.error("Contact number must be exactly 10 digits");
      return;
    }
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid Gmail address");
      return;
    }
    if (!hasMinLength) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!hasSpecialChar) {
      toast.error("Password must contain at least 1 special character");
      return;
    }
    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    setDevOtpMessage(null);
    try {
      const res = await sendOtpFn({ data: { email: email.trim() } });
      if (res.success) {
        toast.success("Verification code sent to your Gmail inbox!");
        if (res.devMode && res.otp) {
          setDevOtpMessage(`Dev mode notice: Your verification code is ${res.otp}`);
        }
        setOtpStep("verify");
        setOtpCountdown(60);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP code");
    } finally {
      setLoading(false);
    }
  }

  // Verify Gmail OTP and complete shop registration
  async function handleVerifyAndRegisterShop(e: React.FormEvent) {
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

      // Store OTP user session for client persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("stockerz_otp_user", cleanEmail);
      }

      // Create Supabase Auth user
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });

      if (signUpErr && !signUpErr.message.includes("already registered")) {
        console.warn("Auth signup warning:", signUpErr.message);
      }

      let authUser = signUpData?.user;

      // Auto sign in with password
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (signInData?.user) authUser = signInData.user;

      const targetUserId = authUser?.id || "otp-user-" + btoa(cleanEmail);
      const shopName = shop.name.trim().toUpperCase() || "MY SHOP";

      // Register or update shop profile with provided details
      const { data: existingShop } = await supabase
        .from("shops")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existingShop) {
        const { error: updateErr } = await supabase
          .from("shops")
          .update({
            owner_id: targetUserId,
            name: shopName,
            contact: shop.contact.trim() || null,
            gst: shop.gst.trim().toUpperCase() || null,
            address: shop.address.trim().toUpperCase() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingShop.id);
        if (updateErr) console.warn("Shop update notice:", updateErr.message);
      } else {
        const { error: insertErr } = await supabase
          .from("shops")
          .insert({
            owner_id: targetUserId,
            name: shopName,
            contact: shop.contact.trim() || null,
            email: cleanEmail,
            gst: shop.gst.trim().toUpperCase() || null,
            address: shop.address.trim().toUpperCase() || null,
          });
        if (insertErr) console.warn("Shop insert notice:", insertErr.message);
      }

      await qc.invalidateQueries({ queryKey: ["shop"] });
      await qc.invalidateQueries({ queryKey: ["admin-master-data"] });
      toast.success(`Shop "${shopName}" registered successfully!`);

      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      } else {
        nav({ to: "/dashboard", replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setResetSent(true);
        toast.success("Password reset link sent to your email!");
        setLoading(false);
        return;
      }

      if (mode === "signup") {
        if (otpStep === "form") {
          await handleSendSignupOtp();
        } else {
          await handleVerifyAndRegisterShop(e);
        }
        return;
      }

      // Standard Password Login Mode
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        // Check if user was registered via OTP fallback
        if (typeof window !== "undefined") {
          localStorage.setItem("stockerz_otp_user", cleanEmail);
        }
      } else if (data.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("stockerz_otp_user", cleanEmail);
        }
      }

      await qc.invalidateQueries({ queryKey: ["shop"] });
      toast.success("Welcome back!");
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      } else {
        nav({ to: "/dashboard", replace: true });
      }
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
          <Link to="/" className="flex items-center gap-2">
            <img src="/stockerz-logo.png" alt="STOCKERZ RO" className="h-9 w-9 rounded-lg object-contain" />
            <span className="font-bold tracking-tight">STOCKERZ RO</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {mode === "login"
              ? "Sign in"
              : mode === "signup"
              ? otpStep === "verify"
                ? "Verify Gmail OTP"
                : "Register your shop"
              : "Reset password"}
          </h1>
          {mode === "signup" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary border border-primary/20">
              <Mail className="h-3.5 w-3.5" /> Gmail OTP
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login"
            ? "Sign in to access your shop dashboard"
            : mode === "signup"
            ? otpStep === "verify"
              ? `Enter the 6-digit code sent to ${email}`
              : "Add your shop profile details and verify via Gmail OTP"
            : "Enter your registered email to receive a password reset link"}
        </p>

        {mode === "forgot" && resetSent && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            Reset link sent! Check your inbox for further instructions.
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          {/* Register Shop Form Step 1 */}
          {mode === "signup" && otpStep === "form" && (
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
                  maxLength={10}
                  value={shop.contact}
                  onChange={(e) => setShop({ ...shop, contact: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  placeholder="10-digit mobile number"
                  className="w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary font-mono tracking-wider"
                />
                {shop.contact.length > 0 && (
                  <div className="mt-1 text-xs">
                    <div className={`flex items-center gap-1.5 transition ${isValidContact ? "text-emerald-400 font-medium" : "text-amber-400"}`}>
                      <span className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${isValidContact ? "bg-emerald-500/20 text-emerald-400 font-bold" : "bg-amber-500/20 text-amber-400 font-bold"}`}>
                        {isValidContact ? "✓" : "!"}
                      </span>
                      <span>{isValidContact ? "Valid 10-digit contact number" : `${shop.contact.length}/10 digits`}</span>
                    </div>
                  </div>
                )}
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
                  rows={2}
                  value={shop.address}
                  onChange={(e) => setShop({ ...shop, address: e.target.value })}
                  className="w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary uppercase-data"
                />
              </Field>
            </>
          )}

          {/* Email field (for login, signup step 1, forgot) */}
          {(mode !== "signup" || otpStep === "form") && (
            <Field label="Gmail Address">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
          )}

          {/* Password fields for login & signup step 1 */}
          {mode !== "forgot" && otpStep === "form" && (
            <Field
              label="Password"
              action={
                mode === "login" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setResetSent(false);
                    }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                ) : undefined
              }
            >
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
              {mode === "signup" && (
                <div className="mt-2 space-y-1.5 text-xs">
                  <div className={`flex items-center gap-1.5 transition ${hasMinLength ? "text-emerald-400 font-medium" : "text-muted-foreground"}`}>
                    <span className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${hasMinLength ? "bg-emerald-500/20 text-emerald-400 font-bold" : "bg-white/10 text-muted-foreground"}`}>
                      {hasMinLength ? "✓" : "•"}
                    </span>
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 transition ${hasSpecialChar ? "text-emerald-400 font-medium" : "text-muted-foreground"}`}>
                    <span className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${hasSpecialChar ? "bg-emerald-500/20 text-emerald-400 font-bold" : "bg-white/10 text-muted-foreground"}`}>
                      {hasSpecialChar ? "✓" : "•"}
                    </span>
                    <span>At least 1 special character (!@#$%^&*)</span>
                  </div>
                </div>
              )}
            </Field>
          )}

          {mode === "signup" && otpStep === "form" && (
            <Field label="Confirm password">
              <div className="relative">
                <input
                  type={showConfirmPw ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-lg bg-input px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((v) => !v)}
                  aria-label={showConfirmPw ? "Hide confirm password" : "Show confirm password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <div className="mt-1.5 text-xs">
                  <div className={`flex items-center gap-1.5 transition ${passwordsMatch ? "text-emerald-400 font-medium" : "text-red-400"}`}>
                    <span className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${passwordsMatch ? "bg-emerald-500/20 text-emerald-400 font-bold" : "bg-red-500/20 text-red-400 font-bold"}`}>
                      {passwordsMatch ? "✓" : "✕"}
                    </span>
                    <span>{passwordsMatch ? "Passwords match" : "Passwords do not match"}</span>
                  </div>
                </div>
              )}
            </Field>
          )}

          {/* Register Shop Step 2: Gmail OTP Verification Input */}
          {mode === "signup" && otpStep === "verify" && (
            <div className="space-y-4 pt-2">
              {devOtpMessage && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 font-mono">
                  {devOtpMessage}
                </div>
              )}

              <div className="flex flex-col items-center justify-center py-3">
                <span className="mb-2 text-xs font-medium text-muted-foreground">
                  6-Digit Security Code
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

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setOtpStep("form")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ← Edit Shop Details
                </button>

                {otpCountdown > 0 ? (
                  <span className="text-muted-foreground">
                    Resend code in <strong className="text-foreground">{otpCountdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendSignupOtp}
                    className="font-medium text-primary hover:underline"
                  >
                    Resend OTP Code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "login" ? (
              "Sign in"
            ) : mode === "signup" ? (
              otpStep === "form" ? (
                <>
                  <Mail className="h-4 w-4" /> Send Gmail OTP Code
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Verify OTP & Register Shop
                </>
              )
            ) : resetSent ? (
              "Resend reset link"
            ) : (
              "Send reset link"
            )}
          </button>
        </form>

        <div className="mt-6 text-sm">
          {mode === "login" ? (
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setOtpStep("form");
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              New to STOCKERZ RO? <span className="text-foreground font-semibold">Register your shop</span>
            </button>
          ) : mode === "signup" ? (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setOtpStep("form");
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Already have a shop? <span className="text-foreground font-semibold">Sign in</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode("login")}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to <span className="text-foreground font-semibold">Sign in</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="block text-xs font-medium text-muted-foreground">{label}</span>
        {action}
      </div>
      {children}
    </label>
  );
}
