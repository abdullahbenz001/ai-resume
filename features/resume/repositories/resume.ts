import "server-only";
import { getDb } from "@/lib/db";
import type { z } from "zod";
import type { createResumeSchema } from "../schemas/resume";
export const resumeRepository = {
  list: (userId: string) =>
    getDb().resume.findMany({
      where: { userId },
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        title: true,
        content: true,
        fileName: true,
        isFavorite: true,
        updatedAt: true,
        _count: { select: { analyses: true } },
      },
      take: 100,
    }),
  find: (userId: string, id: string) =>
    getDb().resume.findFirst({ where: { id, userId } }),
  create: (userId: string, input: z.infer<typeof createResumeSchema>) =>
    getDb().resume.create({ data: { ...input, userId } }),
  rename: (userId: string, id: string, title: string) =>
    getDb().resume.updateMany({ where: { id, userId }, data: { title } }),
  delete: (userId: string, id: string) =>
    getDb().resume.deleteMany({ where: { id, userId } }),
  toggleFavorite: (userId: string, id: string, isFavorite: boolean) =>
    getDb().resume.updateMany({ where: { id, userId }, data: { isFavorite } }),
};
