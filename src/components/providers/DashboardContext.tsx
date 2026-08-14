"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Period = "7d" | "30d" | "90d" | "12m" | "custom";
export type Currency = "SAR" | "AED";

interface DashboardContextValue {
  period: Period;
  setPeriod: (p: Period) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  pageTitle: string;
  setPageTitle: (t: string) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<Period>("30d");
  const [currency, setCurrency] = useState<Currency>("SAR");
  const [pageTitle, setPageTitle] = useState("pageTitles.overview");

  return (
    <DashboardContext.Provider value={{ period, setPeriod, currency, setCurrency, pageTitle, setPageTitle }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboardContext must be used within DashboardProvider");
  return ctx;
}
