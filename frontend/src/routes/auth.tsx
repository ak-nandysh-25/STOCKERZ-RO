import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ArrowLeft, Droplet, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { ThemeToggle } from "@/components/theme-toggle";

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
  const [otpCode, setOtpCode] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [shop, setShop] = useState(emptyShop);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

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
    apiClient.auth.getSession().then(({ data }) => {
      if (data?.session) nav({ to: "/dashboard" });
    });
  }, [nav]);

  const [signupOtpSent, setSignupOtpSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        if (!resetSent) {
          await apiClient.auth.sendOtp(email);
          setResetSent(true);
          toast.success("Verification OTP code sent to your email!");
          setLoading(false);
          return;
        } else {
          if (!otpCode) {
            toast.error("Please enter the OTP code sent to your email");
            setLoading(false);
            return;
          }
          await apiClient.auth.resetPassword({
            email,
            code: otpCode,
            newPassword: password,
          });
          toast.success("Password reset successfully! Please sign in.");
          setMode("login");
          setResetSent(false);
          setLoading(false);
          return;
        }
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

        // Step 1: Send OTP email first
        if (!signupOtpSent) {
          await apiClient.auth.sendOtp(email.trim());
          setSignupOtpSent(true);
          toast.success(`Verification OTP sent to ${email.trim()}! Please enter the code.`);
          setLoading(false);
          return;
        }

        // Step 2: Verify OTP and Register Shop
        if (!otpCode || otpCode.trim().length < 6) {
          toast.error("Please enter the complete 6-digit OTP verification code.");
          setLoading(false);
          return;
        }

        await apiClient.auth.verifyOtp(email.trim(), otpCode.trim());

        const res = await apiClient.auth.signup({
          email: email.trim(),
          password,
          shop,
        });

        await qc.invalidateQueries({ queryKey: ["shop"] });
        toast.success(`Shop "${res.shop?.name || "MY SHOP"}" verified and registered successfully!`);
        nav({ to: "/dashboard", replace: true });
        return;
      } else {
        await apiClient.auth.login({
          email: email.trim(),
          password,
        });
        toast.success("Welcome back");
        nav({ to: "/dashboard" });
      }
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

        <h1 className="text-2xl font-bold">
          {mode === "login" ? "Sign in" : mode === "signup" ? "Create & verify your shop" : "Reset password"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login"
            ? "Sign in to access your shop dashboard"
            : mode === "signup"
            ? signupOtpSent
              ? `Enter the 6-digit OTP code sent to ${email}`
              : "Add your shop details & verify with email OTP"
            : "Enter your registered email to receive a password reset link"}
        </p>

        {mode === "forgot" && resetSent && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            Reset link sent! Check your inbox for further instructions.
          </div>
        )}

        {mode === "signup" && signupOtpSent && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <span>OTP sent to <strong>{email}</strong></span>
            <button
              type="button"
              onClick={() => setSignupOtpSent(false)}
              className="text-xs font-semibold underline hover:text-white"
            >
              Edit Details
            </button>
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "signup" && !signupOtpSent && (
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

          {mode === "signup" && signupOtpSent && (
            <Field label="6-Digit Verification OTP Code">
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full rounded-lg bg-input px-3 py-2.5 text-sm font-mono tracking-widest text-center outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
          )}

          {(!signupOtpSent || mode !== "signup") && (
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-input px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
          )}

          {mode === "forgot" && resetSent && (
            <>
              <Field label="6-Digit OTP Code">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full rounded-lg bg-input px-3 py-2.5 text-sm font-mono tracking-widest text-center outline-none focus:ring-2 focus:ring-primary"
                />
              </Field>
              <Field label="New Password">
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-lg bg-input px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
            </>
          )}

          {mode !== "forgot" && !signupOtpSent && (
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

          {mode === "signup" && !signupOtpSent && (
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

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login"
              ? "Sign in"
              : mode === "signup"
              ? signupOtpSent
                ? "Verify OTP & Create Shop"
                : "Send Verification OTP Code"
              : resetSent
              ? "Verify OTP & Reset Password"
              : "Send OTP Code"}
          </button>
        </form>

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

