import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Mail, ShieldCheck, Store } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { ThemeToggle } from "@/components/theme-toggle";
import { sendOtpFn, verifyOtpFn } from "@/lib/otp-server";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";

const searchSchema = z.object({ mode: z.enum(["login", "signup", "forgot"]).optional() });

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — STOCKERZ RO" },
      { name: "description", content: "Sign in to your shop or register a new shop with email verification." },
      { property: "og:title", content: "Sign in — STOCKERZ RO" },
      { property: "og:description", content: "Sign in to your shop or register a new shop with email verification." },
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

  const [mode, setMode] = useState<"login" | "signup" | "forgot">(
    search.mode === "signup" || search.mode === "forgot" ? search.mode : "login"
  );

  // Registration step state ("details" = shop info & password, "verify" = 6-digit OTP code)
  const [signupStep, setSignupStep] = useState<"details" | "verify">("details");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [shop, setShop] = useState(emptyShop);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // OTP state
  const [otpCode, setOtpCode] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [devOtpMessage, setDevOtpMessage] = useState<string | null>(null);

  const hasMinLength = password.length >= 8;
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const isValidContact = shop.contact.replace(/\D/g, "").length === 10;

  useEffect(() => {
    if (search.mode === "signup" || search.mode === "forgot" || search.mode === "login") {
      setMode(search.mode);
      setSignupStep("details");
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

  // Step 1 of Signup: Validate shop form and send OTP code to email
  async function handleRegisterStart(e: React.FormEvent) {
    e.preventDefault();
    if (!shop.name.trim()) {
      toast.error("Please enter your shop name");
      return;
    }
    const cleanContact = shop.contact.replace(/\D/g, "");
    if (cleanContact.length !== 10) {
      toast.error("Contact number must be exactly 10 digits");
      return;
    }
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
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
      const cleanEmail = email.trim().toLowerCase();

      // Check if a shop is already registered with this email (One email = One shop)
      const { data: existingShop } = await supabase
        .from("shops")
        .select("id, name")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existingShop) {
        toast.error(`A shop named "${existingShop.name}" is already registered with email ${cleanEmail}. Please sign in to access your shop.`);
        setLoading(false);
        return;
      }

      const res = await sendOtpFn({ data: { email: cleanEmail } });
      if (res.success) {
        toast.success(res.message);
        setSignupStep("verify");
        setOtpCountdown(60);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  }

  // Step 2 of Signup: Verify OTP code, create user account & create shop profile
  async function handleVerifyAndRegisterShop(e: React.FormEvent) {
    e.preventDefault();
    if (otpCode.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP verification code");
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

      // Store OTP user session in localStorage for immediate protected route hydration
      if (typeof window !== "undefined") {
        localStorage.setItem("stockerz_otp_user", cleanEmail);
      }

      // 1. Create account or sign in with password
      let authUser: any = null;

      const { data: signUpData } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });

      if (signUpData?.user && signUpData.user.identities && signUpData.user.identities.length > 0) {
        authUser = signUpData.user;
      }

      if (!authUser) {
        // Try signing in with password if user already exists
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (signInData?.user) authUser = signInData.user;
      }

      const activeUser = authUser || (await supabase.auth.getUser()).data?.user;
      const targetUserId = activeUser?.id || "otp-user-" + btoa(cleanEmail);
      const shopTitle = shop.name.trim().toUpperCase() || "MY SHOP";

      // 2. Link & Upsert shop profile with confirmed details
      const { data: existingShop } = await supabase
        .from("shops")
        .select("id, owner_id")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existingShop) {
        await supabase
          .from("shops")
          .update({
            owner_id: targetUserId,
            name: shopTitle,
            contact: shop.contact.trim() || null,
            gst: shop.gst.trim().toUpperCase() || null,
            address: shop.address.trim().toUpperCase() || null,
          })
          .eq("id", existingShop.id);
      } else {
        await supabase.from("shops").upsert(
          {
            owner_id: targetUserId,
            name: shopTitle,
            contact: shop.contact.trim() || null,
            email: cleanEmail,
            gst: shop.gst.trim().toUpperCase() || null,
            address: shop.address.trim().toUpperCase() || null,
          },
          { onConflict: "owner_id" }
        );
      }

      await qc.invalidateQueries({ queryKey: ["shop"] });
      toast.success(`Shop "${shopTitle}" verified & registered successfully!`);

      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      } else {
        nav({ to: "/dashboard", replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Standard Password Sign In
  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) throw error;

      if (data.user) {
        const { data: userShop } = await supabase
          .from("shops")
          .select("id")
          .eq("owner_id", data.user.id)
          .maybeSingle();

        if (!userShop && cleanEmail) {
          const { data: shopByEmail } = await supabase
            .from("shops")
            .select("id")
            .eq("email", cleanEmail)
            .maybeSingle();

          if (shopByEmail) {
            await supabase
              .from("shops")
              .update({ owner_id: data.user.id })
              .eq("id", shopByEmail.id);
          } else {
            await supabase.from("shops").upsert(
              {
                owner_id: data.user.id,
                name: "MY SHOP",
                email: cleanEmail,
              },
              { onConflict: "owner_id" }
            );
          }
        }
      }

      toast.success("Welcome back!");
      nav({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message ?? "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  // Password Reset Link Request
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
      toast.success("Password reset link sent to your email!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send password reset email");
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

        <h1 className="text-2xl font-bold">
          {mode === "login"
            ? "Sign in"
            : mode === "signup"
            ? signupStep === "details"
              ? "Create your shop"
              : "Verify New Shop Confirmation"
            : "Reset password"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login"
            ? "Sign in to access your shop dashboard"
            : mode === "signup"
            ? signupStep === "details"
              ? "Fill out your showroom details to register a new shop"
              : `Enter the 6-digit confirmation code sent to ${email}`
            : "Enter your registered email to receive a password reset link"}
        </p>

        {/* ----------------- MODE 1: SIGN IN (PASSWORD ONLY) ----------------- */}
        {mode === "login" && (
          <form onSubmit={handlePasswordLogin} className="mt-6 space-y-4">
            <Field label="Email">
              <input
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>

            <Field
              label="Password"
              action={
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
              }
            >
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  placeholder="Enter your password"
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
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-60 cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </button>
          </form>
        )}

        {/* ----------------- MODE 2: REGISTER NEW SHOP (WITH OTP VERIFICATION) ----------------- */}
        {mode === "signup" && (
          <>
            {signupStep === "details" ? (
              /* Step 1: Fill Shop Details & Set Password */
              <form onSubmit={handleRegisterStart} className="mt-6 space-y-4">
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
                    placeholder="27AAAAA0000A1Z5"
                    className="w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary uppercase-data"
                  />
                </Field>

                <Field label="Shop address">
                  <textarea
                    rows={2}
                    value={shop.address}
                    onChange={(e) => setShop({ ...shop, address: e.target.value })}
                    placeholder="Showroom street address, city"
                    className="w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary uppercase-data"
                  />
                </Field>

                <Field label="Email address (for OTP verification)">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@yourshop.com"
                    className="w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </Field>

                <Field label="Password">
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
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
                  <div className="mt-2 space-y-1 text-xs">
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
                </Field>

                <Field label="Confirm password">
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      required
                      minLength={8}
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

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Verify & Register Shop →
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Confirm OTP Code to Register Shop */
              <form onSubmit={handleVerifyAndRegisterShop} className="mt-6 space-y-5">
                {/* Shop Confirmation Summary Header */}
                <div className="rounded-xl border border-primary/20 bg-primary/10 p-3.5 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <ShieldCheck className="h-4 w-4" />
                    Confirming New Shop Registration
                  </div>
                  <div className="text-muted-foreground pt-1">
                    <span className="font-semibold text-foreground">{shop.name.toUpperCase() || "MY SHOP"}</span>
                    {" • "}{shop.contact}{" • "}{email}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-2">
                  <span className="mb-2 text-xs font-medium text-muted-foreground">
                    Enter 6-Digit Email Verification Code
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
                      <CheckCircle2 className="h-4 w-4" /> Confirm & Create Shop
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSignupStep("details")}
                    className="text-muted-foreground hover:text-foreground font-medium"
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
                      onClick={(e) => handleRegisterStart(e)}
                      className="font-medium text-primary hover:underline"
                    >
                      Resend OTP Code
                    </button>
                  )}
                </div>
              </form>
            )}
          </>
        )}

        {/* ----------------- MODE 3: FORGOT PASSWORD ----------------- */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
            {resetSent && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                Password reset link sent! Please check your email inbox.
              </div>
            )}

            <Field label="Registered email address">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-input px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-60 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : resetSent ? "Resend reset link" : "Send reset link"}
            </button>
          </form>
        )}

        {/* Bottom Mode Switch Links */}
        <div className="mt-6 text-sm">
          {mode === "login" ? (
            <button
              onClick={() => {
                setMode("signup");
                setSignupStep("details");
              }}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              New to STOCKERZ RO? <span className="text-foreground font-semibold">Register Shop</span>
            </button>
          ) : mode === "signup" ? (
            <button
              onClick={() => {
                setMode("login");
                setSignupStep("details");
              }}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Already have a shop? <span className="text-foreground font-semibold">Sign in</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setMode("login");
                setSignupStep("details");
              }}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
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
