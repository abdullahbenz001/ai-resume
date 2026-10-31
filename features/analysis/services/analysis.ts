import "server-only";
import { requireAppUser } from "@/features/auth/services/user";
import { resumeRepository } from "@/features/resume/repositories/resume";
import { analysisInputSchema } from "@/features/resume/schemas/resume";
import { AppError } from "@/lib/app-error";
import { analyzeResume } from "@/lib/analyze-resume";
import { listAnalyses, saveAnalysis } from "../repositories/analysis";
export async function runAnalysis(input: unknown) {
  const user = await requireAppUser();
  const data = analysisInputSchema.parse(input);
  if (data.resumeId) {
    const resume = await resumeRepository.find(user.id, data.resumeId);
    if (!resume) throw new AppError("Resume not found.", 404);
    // Never trust client text when the analysis references a saved document.
    data.resumeText = resume.content;
  }
  const { result } = await analyzeResume(data);
  await saveAnalysis(user.id, data, result);
  return result;
}
export async function getHistory() {
  const user = await requireAppUser();
  return listAnalyses(user.id);
}
