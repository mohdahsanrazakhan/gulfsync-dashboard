"use client";

import { useEffect } from "react";
import { useDashboardContext } from "@/components/providers/DashboardContext";

export function usePageTitle(title: string) {
  const { setPageTitle } = useDashboardContext();
  useEffect(() => {
    setPageTitle(title);
  }, [title, setPageTitle]);
}
