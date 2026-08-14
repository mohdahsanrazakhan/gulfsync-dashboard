"use client";

import { Suspense, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, LoaderCircle, Languages, Mail, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { APP_NAME, APP_TAGLINE, DEMO_USER_EMAIL } from "@/lib/constants";
import { useLocale } from "@/components/providers/LocaleContext";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const { locale, setLocale, t } = useLocale();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn("credentials", { email, password, redirect: false });

      if (result?.error) {
        if (result.error === "RateLimited" || result.error.toLowerCase().includes("rate")) {
          setError(t("login.rateLimited"));
        } else {
          setError(t("login.invalidCredentials"));
        }
        setPassword("");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError(t("login.genericError"));
      setPassword("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10 lg:px-8">
      <Button
        variant="outline"
        size="sm"
        className="absolute top-4 end-4 z-10 gap-1.5"
        onClick={() => setLocale(locale === "en" ? "ar" : "en")}
      >
        <Languages className="h-3.5 w-3.5" />
        {locale === "en" ? "العربية" : "English"}
      </Button>

      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border bg-card shadow-sm lg:grid-cols-2">
        {/* Left: form */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-6 flex items-center gap-2">
              <Image src="/brand/logo.png" alt={APP_NAME} width={384} height={384} className="h-9 w-auto" priority />
              <span className="text-sm font-medium text-muted-foreground">{APP_NAME}</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("login.signIn")}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {t("login.welcomeBack")}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
              <div className="relative">
                <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("login.emailPlaceholder")}
                  aria-label={t("login.email")}
                  className="ps-10"
                />
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  maxLength={200}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.passwordPlaceholder")}
                  aria-label={t("login.password")}
                  className="ps-10 pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && (
                <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <LoaderCircle className="me-2 h-4 w-4 animate-spin" />}
                {t("login.signIn")}
              </Button>

              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
                  <Checkbox checked={rememberMe} onCheckedChange={setRememberMe} />
                  {t("login.rememberMe")}
                </label>
                <Link href="#" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  {t("login.forgotPassword")}
                </Link>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {t("login.noAccount")}{" "}
                <Link href="#" className="font-medium text-foreground underline-offset-4 hover:underline">
                  {t("login.register")}
                </Link>
              </p>

              <p className="text-center text-xs text-muted-foreground">
                {t("login.demoHint")}: {DEMO_USER_EMAIL}
              </p>
            </form>
          </div>
        </div>

        {/* Right: promo panel */}
        <div className="relative hidden overflow-hidden bg-muted/40 p-8 lg:flex lg:flex-col lg:justify-between">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              {APP_TAGLINE}
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
              {t("login.promoTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("login.promoSubtitle")}</p>
          </div>

          <div
            aria-hidden
            className="relative mt-8 flex h-64 items-center justify-center rounded-xl"
            style={{
              background:
                "conic-gradient(from 200deg, #6366F1, #22D3EE, #FBBF24, #F472B6, #6366F1)",
            }}
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-background/90 shadow-lg backdrop-blur">
              <Image src="/brand/logo.png" alt={APP_NAME} width={384} height={384} className="h-12 w-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
