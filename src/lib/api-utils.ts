import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiResponse } from "@/types";

export class ApiRequestError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
    this.name = "ApiRequestError";
  }
}

export function ok<T>(data: T, status = 200) {
  const body: ApiResponse<T> = { success: true, data };
  return NextResponse.json(body, { status });
}

export function fail(error: string, code: number) {
  const body: ApiResponse<never> = { success: false, error, code };
  return NextResponse.json(body, { status: code });
}

/**
 * Centralized API error handler. Never leaks stack traces or internal
 * error details to the client — logs full context server-side instead.
 */
export function handleApiError(err: unknown, context: { route: string; userId?: string }) {
  const timestamp = new Date().toISOString();

  if (err instanceof ApiRequestError) {
    // Expected, safe-to-surface error (auth, validation, not found, etc.)
    if (err.code >= 500) {
      console.error(`[API ERROR] ${timestamp} route=${context.route} user=${context.userId ?? "anon"}`, err);
    }
    return fail(err.message, err.code);
  }

  if (err instanceof ZodError) {
    const message = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return fail(`Invalid input: ${message}`, 400);
  }

  // Unknown/unexpected error — log full detail server-side, return generic message.
  console.error(`[API ERROR] ${timestamp} route=${context.route} user=${context.userId ?? "anon"}`, err);
  return fail("An unexpected error occurred. Please try again later.", 500);
}

export function unauthorized(message = "Authentication required") {
  return new ApiRequestError(message, 401);
}

export function badRequest(message = "Invalid request") {
  return new ApiRequestError(message, 400);
}

export function notFound(message = "Not found") {
  return new ApiRequestError(message, 404);
}

export function forbidden(message = "Forbidden") {
  return new ApiRequestError(message, 403);
}

export function tooManyRequests(message = "Too many requests. Please try again later.") {
  return new ApiRequestError(message, 429);
}
