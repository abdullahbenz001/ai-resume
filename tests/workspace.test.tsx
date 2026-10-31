// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes } from "react";
const actions = vi.hoisted(() => ({
  create: vi.fn(),
  rename: vi.fn(),
  delete: vi.fn(),
}));
vi.mock("@/features/resume/actions/resume", () => ({
  createResumeAction: actions.create,
  renameResumeAction: actions.rename,
  deleteResumeAction: actions.delete,
}));
vi.mock("next/link", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
import { ResumeWorkspace } from "@/features/resume/components/resume-workspace";
afterEach(cleanup);
const resume = {
  id: "clxxxxxxxxxxxxxxxxxxxxxxx",
  title: "Frontend Developer",
  preview: "TypeScript developer",
  fileName: null,
  updatedAt: "2026-10-31T12:00:00.000Z",
  analysisCount: 3,
};
it("shows an empty state and submits valid resume data", async () => {
  actions.create.mockResolvedValue({ ok: true });
  const user = userEvent.setup();
  render(<ResumeWorkspace resumes={[]} />);
  expect(screen.getByText("Your next opportunity starts here")).toBeTruthy();
  await user.click(
    screen.getByRole("button", { name: "Create resume", exact: true }),
  );
  await user.type(screen.getByLabelText("Resume title"), "Frontend CV");
  await user.type(
    screen.getByLabelText("Resume text"),
    "Experienced TypeScript developer creating reliable interfaces and web applications.",
  );
  await user.click(
    screen.getByRole("button", { name: "Save resume", exact: true }),
  );
  await waitFor(() =>
    expect(actions.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Frontend CV" }),
    ),
  );
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(screen.getByText("Resume saved.")).toBeTruthy();
});
it("retains input and shows a server failure without closing", async () => {
  actions.rename.mockResolvedValue({
    ok: false,
    error: "Could not save your change.",
  });
  const user = userEvent.setup();
  render(<ResumeWorkspace resumes={[resume]} />);
  await user.click(
    screen.getByRole("button", { name: "Actions for Frontend Developer" }),
  );
  await user.click(
    await screen.findByRole("menuitem", { name: "Rename", exact: true }),
  );
  const input = screen.getByLabelText("Resume title");
  await user.clear(input);
  await user.type(input, "New name");
  await user.click(
    screen.getByRole("button", { name: "Save resume", exact: true }),
  );
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect((input as HTMLInputElement).value).toBe("New name");
  expect(screen.getByRole("dialog")).toBeTruthy();
});
it("requires explicit delete confirmation and allows cancellation", async () => {
  const user = userEvent.setup();
  render(<ResumeWorkspace resumes={[resume]} />);
  await user.click(
    screen.getByRole("button", { name: "Actions for Frontend Developer" }),
  );
  await user.click(
    await screen.findByRole("menuitem", { name: "Delete", exact: true }),
  );
  expect(screen.getByText(/and its 3 saved analyses/)).toBeTruthy();
  expect(actions.delete).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Cancel", exact: true }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(actions.delete).not.toHaveBeenCalled();
});
it("blocks repeat submissions while a mutation is pending", async () => {
  let finish!: (value: { ok: true }) => void;
  actions.create.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const user = userEvent.setup();
  render(<ResumeWorkspace resumes={[]} />);
  await user.click(
    screen.getByRole("button", { name: "Create resume", exact: true }),
  );
  await user.type(screen.getByLabelText("Resume title"), "CV");
  await user.type(
    screen.getByLabelText("Resume text"),
    "Experienced developer building dependable TypeScript web applications for teams.",
  );
  await user.click(
    screen.getByRole("button", { name: "Save resume", exact: true }),
  );
  await waitFor(() =>
    expect(
      (screen.getByRole("button", { name: "Saving…" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true),
  );
  await user.click(screen.getByRole("button", { name: "Saving…" }));
  expect(actions.create).toHaveBeenCalledTimes(1);
  finish({ ok: true });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});
