// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes } from "react";
const mock = vi.hoisted(() => ({ save: vi.fn(), fetch: vi.fn() }));
vi.mock("@/features/resume/actions/resume", () => ({ createResumeAction: mock.save }));
vi.mock("next/link", () => ({ default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} /> }));
import { OptimizerWorkspace } from "@/features/optimizer/components/optimizer-workspace";
const resume = { id: "clxxxxxxxxxxxxxxxxxxxxxxx", title: "Developer", content: "Original developer experience building reliable web applications for local businesses." };
const text = "Improved developer resume with clearer descriptions of existing web development experience.";
const result = { optimizedText: text, changes: ["Clearer language"], cautions: [] };
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("fetch", mock.fetch);
  mock.fetch.mockResolvedValue({ ok: true, json: async () => result });
  mock.save.mockResolvedValue({ ok: true });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it("requires review and explicit save, preserves the original, and blocks repeated saves", async () => {
  const user = userEvent.setup();
  render(<OptimizerWorkspace resume={resume} />);
  await user.type(screen.getByLabelText("Target job description"), "Frontend developer building React applications and reliable TypeScript interfaces.");
  await user.click(screen.getByRole("button", { name: "Optimize resume" }));
  expect(await screen.findByText(resume.content)).toBeTruthy();
  expect(mock.save).not.toHaveBeenCalled();
  const save = screen.getByRole("button", { name: "Save as new resume" }) as HTMLButtonElement;
  expect(save.disabled).toBe(true);
  await user.click(screen.getByRole("checkbox"));
  await user.click(save);
  await waitFor(() => expect(mock.save).toHaveBeenCalledWith({ title: "Developer — Optimized", content: text }));
  expect(await screen.findByText("Saved as a new resume.")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Save as new resume" })).toBeNull();
});
it("retains the draft after failure and requires regeneration for a changed job", async () => {
  const user = userEvent.setup();
  render(<OptimizerWorkspace resume={resume} />);
  const job = screen.getByLabelText("Target job description");
  await user.type(job, "Frontend developer building React applications and reliable TypeScript interfaces.");
  await user.click(screen.getByRole("button", { name: "Optimize resume" }));
  const draft = await screen.findByLabelText("Suggested resume — editable");
  mock.fetch.mockRejectedValueOnce(new Error("Connection lost"));
  await user.click(screen.getByRole("button", { name: "Generate a new draft" }));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect((draft as HTMLTextAreaElement).value).toBe(text);
  await user.type(job, " Extra requirement.");
  expect((screen.getByRole("checkbox") as HTMLInputElement).disabled).toBe(true);
  expect(mock.save).not.toHaveBeenCalled();
});

it("requires a fresh reviewed draft after changing focus and sends the selected mode", async () => {
  const user = userEvent.setup();
  render(<OptimizerWorkspace resume={resume} />);
  await user.type(screen.getByLabelText("Target job description"), "Frontend developer building React applications and reliable TypeScript interfaces.");
  await user.click(screen.getByRole("button", { name: "Optimize resume" }));
  await screen.findByLabelText("Suggested resume — editable");
  await user.click(screen.getByRole("checkbox"));
  await user.selectOptions(screen.getByLabelText("Optimization focus"), "summary");
  expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
  expect((screen.getByRole("button", { name: "Save as new resume" }) as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getByText(/Draft focus: Full resume/)).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Generate a new draft" }));
  await screen.findByText(/Draft focus: Professional summary/);
  const request = mock.fetch.mock.calls.at(-1)![1];
  expect(JSON.parse(request.body)).toMatchObject({ resumeId: resume.id, mode: "summary" });
  expect((screen.getByRole("button", { name: "Save as new resume" }) as HTMLButtonElement).disabled).toBe(true);
  expect(mock.save).not.toHaveBeenCalled();
});
