import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Droplet, Eye, EyeOff, Loader2, Mail, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { ThemeToggle } from "@/components/theme-toggle";
import { sendOtpFn, verifyOtpFn } from "@/lib/otp-server";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";

const searchSchema = z.object({ mode: z.enum(["login", "signup", "forgot", "otp"]).optional() });

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — STOCKERZ RO" },
      { name: "description", content: "Sign in with your email and password or Gmail OTP code." },
      { property: "og:title", content: "Sign in — STOCKERZ RO" },
      { property: "og:description", content: "Sign in with your email and password or Gmail OTP code." },
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
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "otp">(search.mode ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [shop, setShop] = useState(emptyShop);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // OTP state
  const [otpStep, setOtpStep] = useState<"email" | "verify">("email");
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

  async function handleSendOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setDevOtpMessage(null);
    try {
      const res = await sendOtpFn({ data: { email } });
      if (res.success) {
        toast.success(res.message);
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

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otpCode.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP code");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtpFn({ data: { email, otp: otpCode } });
      if (res.success) {
        const cleanEmail = email.trim().toLowerCase();

        // Store OTP user session in localStorage so protected route recognizes it immediately
        if (typeof window !== "undefined") {
          localStorage.setItem("stockerz_otp_user", cleanEmail);
        }

        const otpAuthPassword = `OTP_Auth_${cleanEmail.replace(/[^a-z0-9]/gi, "")}_#2026`;

        // 1. Establish real Supabase session for this verified email
        let { data: signInData } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: otpAuthPassword,
        });

        if (!signInData?.user) {
          // If user does not exist in Supabase Auth yet, create user account
          const { data: signUpData } = await supabase.auth.signUp({
            email: cleanEmail,
            password: otpAuthPassword,
          });

          if (signUpData?.user) {
            const { data: retrySignIn } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: otpAuthPassword,
            });
            signInData = retrySignIn;
          }
        }

        const activeUser = signInData?.user || (await supabase.auth.getUser()).data?.user;
        const targetUserId = activeUser?.id || "otp-user-" + btoa(cleanEmail);

        // 2. Preserve created shop profile for the user
        const { data: existingShop } = await supabase
          .from("shops")
          .select("id, owner_id, name, contact, gst, address")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (!existingShop) {
          // Check by owner_id before creating new shop
          const { data: shopByOwner } = await supabase
            .from("shops")
            .select("id")
            .eq("owner_id", targetUserId)
            .maybeSingle();

          if (!shopByOwner) {
            await supabase.from("shops").insert({
              name: "MY SHOP",
              email: cleanEmail,
              owner_id: targetUserId,
            });
          }
        } else if (existingShop.owner_id !== targetUserId) {
          // Keep all created shop details intact, only link owner_id
          await supabase
            .from("shops")
            .update({ owner_id: targetUserId })
            .eq("id", existingShop.id);
        }

        await qc.invalidateQueries({ queryKey: ["shop"] });
        toast.success("Welcome! Gmail OTP verified successfully.");

        // Direct window redirect to force dashboard reload with active session
        if (typeof window !== "undefined") {
          window.location.href = "/dashboard";
        } else {
          nav({ to: "/dashboard", replace: true });
        }
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "otp") {
      if (otpStep === "email") {
        await handleSendOtp();
      } else {
        await handleVerifyOtp(e);
      }
      return;
    }

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
        const cleanContact = shop.contact.replace(/\D/g, "");
        if (cleanContact.length !== 10) {
          toast.error("Contact number must be exactly 10 digits");
          setLoading(false);
          return;
        }
        if (!hasMinLength) {
          toast.error("Password must be at least 8 characters");
          setLoading(false);
          return;
        }
        if (!hasSpecialChar) {
          toast.error("Password must contain at least 1 special character");
          setLoading(false);
          return;
        }
        if (!passwordsMatch) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }
        const cleanEmail = email.trim();
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (signUpErr) throw signUpErr;

        let authUser = signUpData.user;

        // Auto sign in if session was not automatically established
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (signInErr) throw signInErr;
          authUser = signInData.user;
        }

        if (authUser) {
          // Upsert shop record with filled details
          const { error: upsertErr } = await supabase
            .from("shops")
            .upsert(
              {
                owner_id: authUser.id,
                name: shop.name.trim().toUpperCase() || "MY SHOP",
                contact: shop.contact.trim() || null,
                email: cleanEmail,
                gst: shop.gst.trim().toUpperCase() || null,
                address: shop.address.trim().toUpperCase() || null,
              },
              { onConflict: "owner_id" }
            );

          if (upsertErr) console.warn("Shop upsert notice:", upsertErr.message);
        }

        await qc.invalidateQueries({ queryKey: ["shop"] });
        toast.success(`Shop "${shop.name.trim().toUpperCase() || "MY SHOP"}" created successfully!`);
        nav({ to: "/dashboard", replace: true });
        return;
      } else {
        const cleanEmail = email.trim();
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
            // Check if shop exists with matching email
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

        toast.success("Welcome back");
        nav({ to: "/dashboard" });
      }
      nav({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
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

        {/* Authentication Mode Tabs */}
        {mode !== "forgot" && (
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setOtpStep("email");
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition ${
                mode === "login" || mode === "signup"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Password Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("otp");
                setOtpStep("email");
                setOtpCode("");
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition ${
                mode === "otp"
                  ? "bg-background text-primary font-semibold shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="h-3.5 w-3.5" /> Gmail OTP
            </button>
          </div>
        )}

        <h1 className="text-2xl font-bold">
          {mode === "login"
            ? "Sign in"
            : mode === "signup"
            ? "Create your shop"
            : mode === "otp"
            ? "Gmail OTP Sign In"
            : "Reset password"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login"
            ? "Sign in to access your shop dashboard"
            : mode === "signup"
            ? "Add your shop profile details to get started"
            : mode === "otp"
            ? otpStep === "email"
              ? "Enter your Gmail address to receive a 6-digit verification code"
              : `Enter the code sent to ${email}`
            : "Enter your registered email to receive a password reset link"}
        </p>

        {mode === "forgot" && resetSent && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            Reset link sent! Check your inbox for further instructions.
          </div>
        )}

        {/* Gmail OTP Mode Form */}
        {mode === "otp" ? (
          <form onSubmit={submit} className="mt-6 space-y-5">
            {otpStep === "email" ? (
              <>
                <Field label="Gmail Address">
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
                  disabled={loading || !email}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="h-4 w-4" /> Send Verification Code
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                {devOtpMessage && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 font-mono">
                    {devOtpMessage}
                  </div>
                )}

                <div className="flex flex-col items-center justify-center py-2">
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

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" /> Verify & Sign In
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setOtpStep("email")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ← Change Email
                  </button>

                  {otpCountdown > 0 ? (
                    <span className="text-muted-foreground">
                      Resend code in <strong className="text-foreground">{otpCountdown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="font-medium text-primary hover:underline"
                    >
                      Resend OTP Code
                    </button>
                  )}
                </div>
              </>
            )}
          </form>
        ) : (
          /* Standard Password Auth Form */
          <form onSubmit={submit} className="mt-6 space-y-4">
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

            {mode !== "forgot" && (
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

            {mode === "signup" && (
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
                {mode === "signup" && confirmPassword.length > 0 && (
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

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login"
                ? "Sign in"
                : mode === "signup"
                ? "Register"
                : resetSent
                ? "Resend reset link"
                : "Send reset link"}
            </button>
          </form>
        )}


        <div className="mt-6 text-sm">
          {mode === "login" ? (
            <button onClick={() => setMode("signup")} className="text-muted-foreground hover:text-foreground">
              New to STOCKERZ RO? <span className="text-foreground font-semibold">Register</span>
            </button>
          ) : mode === "signup" ? (
            <button onClick={() => setMode("login")} className="text-muted-foreground hover:text-foreground">
              Already have a shop? <span className="text-foreground font-semibold">Sign in</span>
            </button>
          ) : (
            <button
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

