import "server-only";
import { requireAppUser } from "@/features/auth/services/user";
import { resumeRepository } from "@/features/resume/repositories/resume";
import { resumeContentSchema } from "@/features/resume/schemas/resume";
import { consumeApiQuota } from "@/lib/rate-limit";
import { AppError } from "@/lib/app-error";
import { optimizeInputSchema } from "../schemas/optimizer";
import { generateOptimization } from "./provider";

export async function optimizeResume(input: unknown) {
  const user = await requireAppUser();
  const { resumeId, jobDescription } = optimizeInputSchema.parse(input);
  const resume = await resumeRepository.find(user.id, resumeId);
  if (!resume) throw new AppError("Resume not found.", 404);
  const content = resumeContentSchema.parse(resume.content);
  await consumeApiQuota(user.id, "optimizer");
  return generateOptimization(content, jobDescription);
}
