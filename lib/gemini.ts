import "server-only";
import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

/**
 * Lazily initializes the Gemini client using GEMINI_API_KEY from .env.local
 * (loaded by Next.js into process.env).
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }

  return client;
}

export function hasGeminiApiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}
