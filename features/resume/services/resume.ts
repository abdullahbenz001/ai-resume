import "server-only";
import { requireAppUser } from "@/features/auth/services/user";
import { AppError } from "@/lib/app-error";
import { resumeRepository } from "../repositories/resume";
import {
  createResumeSchema,
  renameResumeSchema,
  resumeIdSchema,
} from "../schemas/resume";
import type { ResumeSummary } from "../types";
export async function listResumes(): Promise<ResumeSummary[]> {
  const user = await requireAppUser();
  return (await resumeRepository.list(user.id)).map(
    ({ content, _count, updatedAt, title, ...row }) => ({
      ...row,
      title: title || "Untitled resume",
      preview: content.slice(0, 180),
      updatedAt: updatedAt.toISOString(),
      analysisCount: _count.analyses,
    }),
  );
}
export async function getResume(id: string) {
  const user = await requireAppUser();
  const parsed = resumeIdSchema.safeParse(id);
  if (!parsed.success) return null;
  return resumeRepository.find(user.id, parsed.data);
}
export async function createResume(input: unknown) {
  const user = await requireAppUser();
  return resumeRepository.create(user.id, createResumeSchema.parse(input));
}
export async function renameResume(input: unknown) {
  const user = await requireAppUser();
  const { id, title } = renameResumeSchema.parse(input);
  if (!(await resumeRepository.rename(user.id, id, title)).count)
    throw new AppError("Resume not found.", 404);
}
export async function deleteResume(input: unknown) {
  const user = await requireAppUser();
  const id = resumeIdSchema.parse(input);
  if (!(await resumeRepository.delete(user.id, id)).count)
    throw new AppError("Resume not found.", 404);
}
