import { beforeEach, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ user: vi.fn(), find: vi.fn(), quota: vi.fn(), generate: vi.fn() }));
vi.mock("@/features/auth/services/user", () => ({ requireAppUser: mock.user }));
vi.mock("@/features/resume/repositories/resume", () => ({ resumeRepository: { find: mock.find } }));
vi.mock("@/lib/rate-limit", () => ({ consumeApiQuota: mock.quota }));
vi.mock("@/features/optimizer/services/provider", () => ({ generateOptimization: mock.generate }));
import { optimizeResume } from "@/features/optimizer/services/optimizer";
import { AppError } from "@/lib/app-error";
const id = "clxxxxxxxxxxxxxxxxxxxxxxx";
const source = "Real experience building TypeScript applications for small businesses.";
const input = { resumeId: id, jobDescription: "A frontend developer role using React and TypeScript to build web applications." };
beforeEach(() => {
  vi.resetAllMocks();
  mock.user.mockResolvedValue({ id: "owner-a" });
  mock.find.mockResolvedValue({ id, content: source });
  mock.quota.mockResolvedValue(undefined);
  mock.generate.mockResolvedValue({ optimizedText: source, changes: ["Clearer wording"], cautions: [] });
});
it("uses the authenticated owner and stored content, ignoring forged text and user IDs", async () => {
  await optimizeResume({ ...input, resumeText: "Forged experience", userId: "victim" });
  expect(mock.find).toHaveBeenCalledWith("owner-a", id);
  expect(mock.quota).toHaveBeenCalledWith("owner-a", "optimizer");
  expect(mock.generate).toHaveBeenCalledWith(source, input.jobDescription, "full");
});
it("rejects another user's or deleted resume before quota and provider access", async () => {
  mock.find.mockResolvedValue(null);
  await expect(optimizeResume(input)).rejects.toMatchObject({ status: 404 });
  expect(mock.quota).not.toHaveBeenCalled();
  expect(mock.generate).not.toHaveBeenCalled();
});
it("rejects invalid input before querying", async () => {
  await expect(optimizeResume({ ...input, resumeId: "../../victim" })).rejects.toThrow();
  expect(mock.find).not.toHaveBeenCalled();
});
it("blocks provider work when the hourly budget is exhausted", async () => {
  mock.quota.mockRejectedValue(new AppError("Limit reached", 429));
  await expect(optimizeResume(input)).rejects.toMatchObject({ status: 429 });
  expect(mock.generate).not.toHaveBeenCalled();
});
it("blocks access when authentication fails", async () => {
  mock.user.mockRejectedValue(new AppError("Sign in", 401));
  await expect(optimizeResume(input)).rejects.toMatchObject({ status: 401 });
  expect(mock.find).not.toHaveBeenCalled();
});

it.each(["summary", "experience"])("passes the validated %s focus with owned source content", async mode => {
  await optimizeResume({ ...input, mode });
  expect(mock.generate).toHaveBeenCalledWith(source, input.jobDescription, mode);
});
it("rejects unknown focus values before repository, quota or provider access", async () => {
  await expect(optimizeResume({ ...input, mode: "invent-experience" })).rejects.toThrow();
  expect(mock.find).not.toHaveBeenCalled();
  expect(mock.quota).not.toHaveBeenCalled();
  expect(mock.generate).not.toHaveBeenCalled();
});
