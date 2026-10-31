"use client";
import { useRef, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { Menu } from "@base-ui/react/menu";
import {
  FileText,
  MoreHorizontal,
  Search,
  Star,
  Plus,
  Pencil,
  Trash2,
  ArrowUpRight,
  X,
  Loader2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ResumeUploader } from "@/components/resume-uploader";
import {
  createResumeAction,
  renameResumeAction,
  deleteResumeAction,
  toggleResumeFavoriteAction,
} from "../actions/resume";
import type { ResumeSummary } from "../types";
type Editor =
  { kind: "create" } | { kind: "rename" | "delete"; resume: ResumeSummary };
const fieldClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
export function ResumeWorkspace({ resumes }: { resumes: ResumeSummary[] }) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [sort, setSort] = useState<"updated" | "name" | "oldest">("updated");
  const [pendingFavorite, setPendingFavorite] = useState<string | null>(null);
  const [favoriteOverrides, setFavoriteOverrides] = useState<
    Record<string, boolean>
  >({});
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleResumes = resumes.map((resume) => ({
    ...resume,
    isFavorite: favoriteOverrides[resume.id] ?? resume.isFavorite,
  }));
  const sortedResumes = visibleResumes
    .filter((resume) => filter === "all" || resume.isFavorite)
    .filter(
      (resume) =>
        !normalizedQuery ||
        `${resume.title} ${resume.fileName ?? ""} ${resume.preview}`
          .toLocaleLowerCase()
          .includes(normalizedQuery),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.title.localeCompare(b.title)
        : sort === "oldest"
          ? a.updatedAt.localeCompare(b.updatedAt)
          : b.updatedAt.localeCompare(a.updatedAt),
    );
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-400">
            Your career workspace
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">My Resumes</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Keep your experience organized. Find the right fit for your next
            role.
          </p>
        </div>
        <Button
          id="create-resume"
          size="lg"
          onClick={() => setEditor({ kind: "create" })}
        >
          <Plus /> Create resume
        </Button>
      </div>
      <p
        role="status"
        className="mb-4 text-sm text-teal-700 dark:text-teal-400"
      >
        {notice}
      </p>
      {resumes.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed bg-card p-8 text-center">
          <FileText className="mb-5 size-10 text-teal-700" aria-hidden />
          <h2 className="text-xl font-semibold">
            Your next opportunity starts here
          </h2>
          <p className="mb-6 mt-2 max-w-md text-sm text-muted-foreground">
            Upload a PDF or paste your resume. Save it once, then compare it
            with different job descriptions.
          </p>
          <Button onClick={() => setEditor({ kind: "create" })}>
            <Plus /> Add your first resume
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
            <label className="relative block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search resumes…"
                aria-label="Search resumes"
                className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <select
              aria-label="Filter resumes"
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as "all" | "favorites")
              }
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="all">All resumes</option>
              <option value="favorites">Favorites</option>
            </select>
            <select
              aria-label="Sort resumes"
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as "updated" | "name" | "oldest")
              }
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="updated">Recently updated</option>
              <option value="oldest">Oldest updated</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            {sortedResumes.length} of {resumes.length} resumes ·{" "}
            {sort === "name"
              ? "Name A–Z"
              : sort === "oldest"
                ? "Oldest updated first"
                : "Most recently updated first"}
            {resumes.length === 100 ? " · Showing latest 100" : ""}
          </p>
          {sortedResumes.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center">
              <h2 className="text-lg font-semibold">No matching resumes</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different search or filter.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                Clear search and filter
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {sortedResumes.map((resume) => (
                <article
                  key={resume.id}
                  className="flex flex-col rounded-2xl border bg-card p-5 shadow-sm"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={pendingFavorite === resume.id}
                      aria-label={
                        resume.isFavorite
                          ? `Remove ${resume.title} from favorites`
                          : `Add ${resume.title} to favorites`
                      }
                      aria-pressed={resume.isFavorite}
                      onClick={async () => {
                        setPendingFavorite(resume.id);
                        try {
                          const result = await toggleResumeFavoriteAction(
                            resume.id,
                          );
                          if (!result.ok) setNotice(result.error);
                          else {
                            setFavoriteOverrides((current) => ({
                              ...current,
                              [resume.id]: !resume.isFavorite,
                            }));
                            setNotice(
                              resume.isFavorite
                                ? "Removed from favorites."
                                : "Added to favorites.",
                            );
                          }
                        } catch {
                          setNotice(
                            "Could not update favorite. Please try again.",
                          );
                        } finally {
                          setPendingFavorite(null);
                        }
                      }}
                    >
                      <Star
                        className={
                          resume.isFavorite
                            ? "fill-amber-400 text-amber-500"
                            : ""
                        }
                      />
                    </Button>
                    <span className="rounded-xl bg-teal-50 p-3 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                      <FileText aria-hidden className="size-5" />
                    </span>
                    <Menu.Root>
                      <Menu.Trigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            id={`resume-actions-${resume.id}`}
                            aria-label={`Actions for ${resume.title}`}
                          />
                        }
                      >
                        <MoreHorizontal />
                      </Menu.Trigger>
                      <Menu.Portal>
                        <Menu.Positioner
                          sideOffset={6}
                          align="end"
                          className="z-40"
                        >
                          <Menu.Popup className="min-w-40 rounded-xl border bg-popover p-1 shadow-lg">
                            <Menu.Item
                              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-highlighted:bg-muted"
                              onClick={() =>
                                setEditor({ kind: "rename", resume })
                              }
                            >
                              <Pencil className="size-4" /> Rename
                            </Menu.Item>
                            <Menu.Item
                              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive outline-none data-highlighted:bg-muted"
                              onClick={() =>
                                setEditor({ kind: "delete", resume })
                              }
                            >
                              <Trash2 className="size-4" /> Delete
                            </Menu.Item>
                          </Menu.Popup>
                        </Menu.Positioner>
                      </Menu.Portal>
                    </Menu.Root>
                  </div>
                  <h2
                    className="truncate text-lg font-semibold"
                    title={resume.title}
                  >
                    {resume.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 min-h-16 text-sm leading-relaxed text-muted-foreground">
                    {resume.preview}
                  </p>
                  <div className="mt-5 flex flex-wrap justify-between gap-2 border-t pt-4 text-xs text-muted-foreground">
                    <span>{resume.analysisCount} analyses</span>
                    <time dateTime={resume.updatedAt}>
                      Updated {resume.updatedAt.slice(0, 10)}
                    </time>
                  </div>
                  <Link
                    className={buttonVariants({
                      variant: "outline",
                      className: "mt-4 w-full",
                    })}
                    href={`/analyzer?resumeId=${encodeURIComponent(resume.id)}`}
                  >
                    Analyze resume <ArrowUpRight className="size-4" />
                  </Link>
                  <Link href={`/optimizer?resumeId=${encodeURIComponent(resume.id)}`}
                    className={buttonVariants({ variant: "ghost", className: "mt-2 w-full" })}>
                    Optimize resume
                  </Link>
                </article>
              ))}
            </div>
          )}
        </>
      )}
      {editor && (
        <ResumeEditor
          editor={editor}
          onClose={() => setEditor(null)}
          onSuccess={() => {
            setNotice(
              editor.kind === "delete" ? "Resume deleted." : "Resume saved.",
            );
            setEditor(null);
          }}
        />
      )}
    </>
  );
}
function ResumeEditor({
  editor,
  onClose,
  onSuccess,
}: {
  editor: Editor;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState(
    editor.kind === "create" ? "" : editor.resume.title,
  );
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState<string>();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const busy = useRef(false);
  const deleting = editor.kind === "delete";
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setError("");
    startTransition(async () => {
      try {
        const result =
          editor.kind === "create"
            ? await createResumeAction({ title, content, fileName })
            : editor.kind === "rename"
              ? await renameResumeAction({ id: editor.resume.id, title })
              : await deleteResumeAction(editor.resume.id);
        if (result.ok) onSuccess();
        else setError(result.error);
      } catch {
        setError(
          "Connection interrupted. Check your workspace before trying again.",
        );
      } finally {
        busy.current = false;
      }
    });
  }
  return (
    <Dialog.Root
      open
      disablePointerDismissal
      onOpenChange={(open) => {
        if (!open && !busy.current) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm" />
        <Dialog.Popup
          initialFocus={() =>
            document.getElementById(deleting ? "resume-cancel" : "resume-title")
          }
          finalFocus={() =>
            document.getElementById(
              editor.kind === "create"
                ? "create-resume"
                : `resume-actions-${editor.resume.id}`,
            ) ?? document.getElementById("create-resume")
          }
          className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-background p-6 shadow-xl"
        >
          <div className="flex items-center justify-between gap-4">
            <Dialog.Title className="text-xl font-semibold">
              {deleting
                ? "Delete resume?"
                : editor.kind === "create"
                  ? "Create a resume"
                  : "Rename resume"}
            </Dialog.Title>
            <Dialog.Close
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={pending}
                  aria-label="Close dialog"
                />
              }
            >
              <X />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mb-6 mt-2 text-sm text-muted-foreground">
            {deleting
              ? `“${editor.resume.title}” and its ${editor.resume.analysisCount} saved analyses will be permanently deleted. This cannot be undone.`
              : "Give your resume a clear name so it is easy to find."}
          </Dialog.Description>
          <form onSubmit={submit} className="space-y-4" aria-busy={pending}>
            {!deleting && (
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="resume-title">
                  Resume title
                </label>
                <input
                  autoFocus
                  id="resume-title"
                  required
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={pending}
                  className={fieldClass}
                  placeholder="e.g. Frontend Developer — 2026"
                />
              </div>
            )}
            {editor.kind === "create" && (
              <>
                <ResumeUploader
                  disabled={pending}
                  onExtracted={(text, meta) => {
                    setContent(text);
                    setFileName(meta.fileName);
                  }}
                  onClear={() => {
                    setContent("");
                    setFileName(undefined);
                  }}
                />
                <div className="space-y-2">
                  <label
                    htmlFor="resume-content"
                    className="text-sm font-medium"
                  >
                    Resume text
                  </label>
                  <textarea
                    id="resume-content"
                    required
                    minLength={50}
                    maxLength={12000}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={pending}
                    className={`${fieldClass} min-h-40`}
                    placeholder="Paste your resume or upload a PDF above."
                  />
                  <p className="text-xs text-muted-foreground">
                    {content.length.toLocaleString()} / 12,000 characters.
                    Review extracted text before saving.
                  </p>
                </div>
              </>
            )}
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                id="resume-cancel"
                type="button"
                variant="outline"
                disabled={pending}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={deleting ? "destructive" : "default"}
                disabled={pending}
              >
                {pending && <Loader2 className="animate-spin" />}
                {pending
                  ? "Saving…"
                  : deleting
                    ? "Delete permanently"
                    : "Save resume"}
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
