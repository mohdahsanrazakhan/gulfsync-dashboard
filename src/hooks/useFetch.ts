"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ApiResponse } from "@/types";

interface UseFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Small shared data-fetching hook wrapping our consistent
 * { success, data | error } API response envelope.
 */
export function useFetch<T>(url: string | null): UseFetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseFetchState<T>>({ data: null, isLoading: !!url, error: null });
  const [tick, setTick] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!url) return;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    // Intentional: mark loading before kicking off the request so consumers
    // see a spinner immediately when `url`/`tick` changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((s) => ({ ...s, isLoading: true, error: null }));

    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        const body = (await res.json()) as ApiResponse<T>;
        if (!body.success) throw new Error(body.error);
        setState({ data: body.data, isLoading: false, error: null });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({ data: null, isLoading: false, error: err instanceof Error ? err.message : "Request failed" });
      });

    return () => controller.abort();
  }, [url, tick]);

  return { ...state, refetch };
}
