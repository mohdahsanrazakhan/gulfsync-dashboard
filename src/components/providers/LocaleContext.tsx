"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { translations, type Locale } from "@/lib/i18n/translations";

const STORAGE_KEY = "gulfsync:locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: "ltr" | "rtl";
  /** Dot-path lookup into the translation dictionary, e.g. t("nav.orders"). */
  t: (path: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function resolvePath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Restore the persisted preference on mount (client-only — avoids SSR/CSR
  // hydration mismatches since localStorage isn't available on the server).
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Intentional: restoring a persisted client-only preference on mount
    // (localStorage isn't available during SSR, so this can't be derived
    // during render).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "en" || stored === "ar") setLocaleState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.classList.toggle("font-arabic", locale === "ar");
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (path: string) => {
      const value = resolvePath(translations[locale], path);
      if (typeof value === "string") return value;
      // Fall back to English, then to the raw key, so a missing Arabic
      // string never renders blank.
      const fallback = resolvePath(translations.en, path);
      if (typeof fallback === "string") return fallback;
      return path;
    },
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, dir: locale === "ar" ? "rtl" : "ltr", t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
