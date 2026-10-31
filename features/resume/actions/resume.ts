"use server";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { AppError } from "@/lib/app-error";
import { createResume, renameResume, deleteResume } from "../services/resume";
import type { ActionResult } from "../types";
async function mutate(work: () => Promise<unknown>): Promise<ActionResult> {
  try {
    await work();
    for (const path of ["/resumes", "/history", "/dashboard"])
      revalidatePath(path);
    return { ok: true };
  } catch (error) {
    if (error instanceof ZodError)
      return {
        ok: false,
        error: error.issues[0]?.message || "Check your input.",
      };
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error("[resume] Mutation failed", {
      type: error instanceof Error ? error.name : "unknown",
    });
    return {
      ok: false,
      error: "Could not save your change. Please try again.",
    };
  }
}
export async function createResumeAction(input: unknown) {
  return mutate(() => createResume(input));
}
export async function renameResumeAction(input: unknown) {
  return mutate(() => renameResume(input));
}
export async function deleteResumeAction(id: unknown) {
  return mutate(() => deleteResume(id));
}
