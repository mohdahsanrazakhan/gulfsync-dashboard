import "server-only";
import OpenAI from "openai";

/**
 * OpenAI client. This module must only ever be imported from server-side
 * code (API routes, server actions) — the `server-only` import above
 * causes a build error if it's ever pulled into a client bundle.
 */
let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

/**
 * Strip HTML/script content and enforce a max length on any text that will
 * be sent to the AI API. Defends against prompt injection via markup and
 * caps token/cost exposure.
 */
export function sanitizeAiInput(input: string, maxLength = 500): string {
  const withoutTags = input.replace(/<[^>]*>/g, "");
  const withoutScriptArtifacts = withoutTags.replace(/[<>]/g, "");
  return withoutScriptArtifacts.trim().slice(0, maxLength);
}
