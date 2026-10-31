import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({
  user: vi.fn(),
  list: vi.fn(),
  find: vi.fn(),
  create: vi.fn(),
  rename: vi.fn(),
  delete: vi.fn(),
  toggleFavorite: vi.fn(),
}));
vi.mock("@/features/auth/services/user", () => ({ requireAppUser: mock.user }));
vi.mock("@/features/resume/repositories/resume", () => ({
  resumeRepository: mock,
}));
import {
  createResume,
  deleteResume,
  renameResume,
  toggleResumeFavorite,
  getResume,
} from "@/features/resume/services/resume";
const id = "clxxxxxxxxxxxxxxxxxxxxxxx";
beforeEach(() => {
  mock.user.mockResolvedValue({ id: "owner-a" });
  mock.rename.mockResolvedValue({ count: 0 });
  mock.delete.mockResolvedValue({ count: 0 });
  mock.find.mockResolvedValue({ id, isFavorite: false });
  mock.toggleFavorite.mockResolvedValue({ count: 1 });
});
describe("resume ownership", () => {
  it("derives ownership from authentication on create", async () => {
    await createResume({
      title: "CV",
      content: "x".repeat(100),
      userId: "victim",
    });
    expect(mock.create).toHaveBeenCalledWith("owner-a", {
      title: "CV",
      content: "x".repeat(100),
    });
  });
  it("cannot rename a resume outside the current user", async () => {
    await expect(renameResume({ id, title: "Changed" })).rejects.toMatchObject({
      status: 404,
    });
    expect(mock.rename).toHaveBeenCalledWith("owner-a", id, "Changed");
  });
  it("cannot delete a resume outside the current user", async () => {
    await expect(deleteResume(id)).rejects.toMatchObject({ status: 404 });
    expect(mock.delete).toHaveBeenCalledWith("owner-a", id);
  });
  it("toggles favorites only after an ownership-scoped lookup", async () => {
    await toggleResumeFavorite(id);
    expect(mock.find).toHaveBeenCalledWith("owner-a", id);
    expect(mock.toggleFavorite).toHaveBeenCalledWith("owner-a", id, true);
  });
  it("scopes lookup and rejects invalid IDs without querying", async () => {
    await getResume(id);
    expect(mock.find).toHaveBeenCalledWith("owner-a", id);
    mock.find.mockClear();
    expect(await getResume("invalid")).toBeNull();
    expect(mock.find).not.toHaveBeenCalled();
  });
  it("does not write when authentication fails", async () => {
    mock.user.mockRejectedValue(new Error("Unauthenticated"));
    await expect(
      createResume({ title: "CV", content: "x".repeat(100) }),
    ).rejects.toThrow();
    expect(mock.create).not.toHaveBeenCalled();
  });
});
