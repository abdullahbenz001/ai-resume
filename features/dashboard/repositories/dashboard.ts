import "server-only";
import { getDb } from "@/lib/db";
export async function getDashboardData(userId: string) {
  const db = getDb();
  const [resumes, analysis, recent] = await db.$transaction([
    db.resume.count({ where: { userId } }),
    db.analysis.aggregate({
      where: { resume: { userId } },
      _count: true,
      _avg: { score: true },
    }),
    db.analysis.findMany({
      where: { resume: { userId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        score: true,
        createdAt: true,
        resume: { select: { title: true } },
      },
    }),
  ]);
  return {
    resumes,
    analysisCount: analysis._count,
    average: analysis._avg.score,
    recent,
  };
}
