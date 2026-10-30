"use client";

import { useState, FormEvent } from "react";
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { PublicNav } from "@/components/public/public-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { Logo } from "@/components/shared/logo";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { signUpUser } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  terms?: string;
}

export function RegisterView() {
  const navigate = useAppStore((s) => s.navigate);
  const register = useAppStore((s) => s.register);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formNotice, setFormNotice] = useState<{
    variant: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!name) e.name = "Name is required.";
    else if (name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    if (!email) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 8) e.password = "Password must be at least 8 characters.";
    if (!confirm) e.confirm = "Please confirm your password.";
    else if (confirm !== password) e.confirm = "Passwords do not match.";
    if (!terms) e.terms = "Please accept the terms to continue.";
    return e;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setFormNotice(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    try {
      const res = await signUpUser(email, password, name.trim());
      if (!res.success) {
        setFormNotice({ variant: "error", message: res.error || "Failed to create account. Please try again." });
        setSubmitting(false);
        return;
      }

      const user = res.user;
      if (!user || !user.id) {
        setFormNotice({ variant: "error", message: "Failed to create account. No user was returned." });
        setSubmitting(false);
        return;
      }

      // If email confirmation is required by Supabase, session will be null
      if (!res.session) {
        setFormNotice({
          variant: "success",
          message: "Account created successfully! Please check your email to confirm your account before logging in.",
        });
        setSubmitting(false);
        return;
      }

      register(name.trim(), email, user.id);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred during registration.";
      setFormNotice({ variant: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const passwordChecks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "One number", ok: /\d/.test(password) },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md">
          <div className="text-center space-y-3 mb-8">
            <div className="flex justify-center">
              <Logo stacked size={56} />
            </div>
            <h1 className="text-2xl font-semibold font-display text-foreground pt-1">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Start planning your celebration in minutes.
            </p>
          </div>

          <Card className="p-6 sm:p-8 gap-0">
            {formNotice && (
              <Alert variant={formNotice.variant} className="mb-4">
                {formNotice.variant === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : formNotice.variant === "error" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : formNotice.variant === "warning" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
                <AlertDescription>{formNotice.message}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Priya Sharma"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                    }}
                    className={cn("pl-9", errors.name && "border-destructive")}
                    style={errors.name ? { borderColor: "oklch(0.55 0.18 25)" } : undefined}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                </div>
                {errors.name && (
                  <p id="name-error" className="text-xs text-destructive" style={{ color: "oklch(0.55 0.18 25)" }}>
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                    }}
                    className={cn("pl-9", errors.email && "border-destructive")}
                    style={errors.email ? { borderColor: "oklch(0.55 0.18 25)" } : undefined}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-xs text-destructive" style={{ color: "oklch(0.55 0.18 25)" }}>
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                    }}
                    className={cn("pl-9 pr-9", errors.password && "border-destructive")}
                    style={errors.password ? { borderColor: "oklch(0.55 0.18 25)" } : undefined}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : "password-hint"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p id="password-error" className="text-xs text-destructive" style={{ color: "oklch(0.55 0.18 25)" }}>
                    {errors.password}
                  </p>
                ) : (
                  <ul id="password-hint" className="space-y-1 pt-1">
                    {passwordChecks.map((c) => (
                      <li
                        key={c.label}
                        className={cn(
                          "flex items-center gap-1.5 text-xs",
                          c.ok ? "text-foreground/70" : "text-muted-foreground/60"
                        )}
                      >
                        <CheckCircle2
                          className="h-3 w-3"
                          style={{ color: c.ok ? "oklch(0.55 0.12 150)" : "currentColor" }}
                        />
                        {c.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="confirm"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      if (errors.confirm) setErrors((p) => ({ ...p, confirm: undefined }));
                    }}
                    className={cn("pl-9", errors.confirm && "border-destructive")}
                    style={errors.confirm ? { borderColor: "oklch(0.55 0.18 25)" } : undefined}
                    aria-invalid={!!errors.confirm}
                    aria-describedby={errors.confirm ? "confirm-error" : undefined}
                  />
                </div>
                {errors.confirm && (
                  <p id="confirm-error" className="text-xs text-destructive" style={{ color: "oklch(0.55 0.18 25)" }}>
                    {errors.confirm}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={terms}
                    onCheckedChange={(v) => {
                      setTerms(!!v);
                      if (errors.terms) setErrors((p) => ({ ...p, terms: undefined }));
                    }}
                    className="mt-0.5"
                    aria-invalid={!!errors.terms}
                    aria-describedby={errors.terms ? "terms-error" : undefined}
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => navigate({ kind: "public", view: "terms" })}
                    >
                      Terms and Conditions
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => navigate({ kind: "public", view: "privacy" })}
                    >
                      Privacy Policy
                    </button>.
                  </Label>
                </div>
                {errors.terms && (
                  <p id="terms-error" className="text-xs text-destructive" style={{ color: "oklch(0.55 0.18 25)" }}>
                    {errors.terms}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate({ kind: "public", view: "login" })}
                className="font-medium text-primary hover:underline"
              >
                Login
              </button>
            </p>
          </Card>

        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
