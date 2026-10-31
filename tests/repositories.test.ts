import { expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({
  resume: {
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
  analysis: { findMany: vi.fn() },
}));
vi.mock("@/lib/db", () => ({ getDb: () => db }));
import { resumeRepository } from "@/features/resume/repositories/resume";
import { listAnalyses } from "@/features/analysis/repositories/analysis";
it("includes owner in the mutation query itself", async () => {
  await resumeRepository.rename("owner", "target", "Name");
  await resumeRepository.delete("owner", "target");
  expect(db.resume.updateMany).toHaveBeenCalledWith({
    where: { id: "target", userId: "owner" },
    data: { title: "Name" },
  });
  expect(db.resume.deleteMany).toHaveBeenCalledWith({
    where: { id: "target", userId: "owner" },
  });
});
it("scopes history through resume ownership", async () => {
  await listAnalyses("owner");
  expect(db.analysis.findMany).toHaveBeenCalledWith(
    expect.objectContaining({ where: { resume: { userId: "owner" } } }),
  );
});
