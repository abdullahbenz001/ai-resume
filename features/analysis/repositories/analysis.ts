import "server-only";
import { getDb } from "@/lib/db";
import { AppError } from "@/lib/app-error";
import type { AnalysisResult } from "@/lib/schema";
export async function saveAnalysis(
  userId: string,
  input: { resumeId?: string; resumeText: string; jobDescription: string },
  result: AnalysisResult,
) {
  return getDb().$transaction(async (tx) => {
    let resumeId = input.resumeId;
    if (resumeId) {
      const owned = await tx.resume.findFirst({
        where: { id: resumeId, userId },
        select: { id: true },
      });
      if (!owned) throw new AppError("Resume not found.", 404);
    } else {
      const resume = await tx.resume.create({
        data: {
          userId,
          title: "Resume " + new Date().toISOString().slice(0, 10),
          content: input.resumeText,
        },
      });
      resumeId = resume.id;
    }
    return tx.analysis.create({
      data: { resumeId, jobDescription: input.jobDescription, ...result },
    });
  });
}
export async function listAnalyses(userId: string) {
  return getDb().analysis.findMany({
    where: { resume: { userId } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 50,
    include: { resume: { select: { title: true } } },
  });
}
