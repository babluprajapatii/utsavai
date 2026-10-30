"use client";

import { useState, FormEvent } from "react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { signInUser, signInWithGoogle } from "@/lib/auth";

interface FieldErrors {
  email?: string;
  password?: string;
}

export function LoginView() {
  const navigate = useAppStore((s) => s.navigate);
  const login = useAppStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formNotice, setFormNotice] = useState<{
    variant: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!email) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Enter a valid email address.";
    }
    if (!password) {
      e.password = "Password is required.";
    } else if (password.length < 6) {
      e.password = "Password must be at least 6 characters.";
    }
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
      const res = await signInUser(email, password);
      if (!res.success) {
        setFormNotice({ variant: "error", message: res.error || "Failed to sign in. Please verify your credentials." });
        setSubmitting(false);
        return;
      }

      const user = res.user;
      if (!user || !user.id) {
        setFormNotice({ variant: "error", message: "Authentication failed: No user session established." });
        setSubmitting(false);
        return;
      }

      const fullName =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        email.split("@")[0] ||
        "User";
      login(email, fullName, user.id);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred during login.";
      setFormNotice({ variant: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogleLogin = async () => {
    setFormNotice(null);
    setSubmitting(true);
    try {
      const res = await signInWithGoogle();
      if (res.error) {
        setFormNotice({ variant: "error", message: res.error });
        setSubmitting(false);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Google sign in failed.";
      setFormNotice({ variant: "error", message: msg });
      setSubmitting(false);
    }
  };

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
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Login to continue planning your celebration.
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
                    className={cn("pl-9", errors.email && "border-destructive focus-visible:ring-destructive")}
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => setFormNotice({ variant: "info", message: "Password reset functionality is not currently available. Please contact support if you need assistance." })}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                    }}
                    className={cn("pl-9 pr-9", errors.password && "border-destructive focus-visible:ring-destructive")}
                    style={errors.password ? { borderColor: "oklch(0.55 0.18 25)" } : undefined}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
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
                {errors.password && (
                  <p id="password-error" className="text-xs text-destructive" style={{ color: "oklch(0.55 0.18 25)" }}>
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(!!v)}
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Keep me logged in
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onGoogleLogin}
              disabled={submitting}
            >
              <GoogleIcon className="h-4 w-4 mr-2" />
              Continue with Google
            </Button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              New to UtsavAI?{" "}
              <button
                type="button"
                onClick={() => navigate({ kind: "public", view: "register" })}
                className="font-medium text-primary hover:underline"
              >
                Create an account
              </button>
            </p>
          </Card>

        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
