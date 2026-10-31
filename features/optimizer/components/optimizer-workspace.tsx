"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { createResumeAction } from "@/features/resume/actions/resume";
import { createResumeSchema } from "@/features/resume/schemas/resume";
import { optimizationSchema, optimizeInputSchema, optimizationModes, optimizationModeSchema, type OptimizationMode, type Optimization } from "../schemas/optimizer";

const field = "w-full rounded-lg border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
export function OptimizerWorkspace({ resume }: {
  resume: { id: string; title: string; content: string };
}) {
  const [jobDescription, setJobDescription] = useState("");
  const [mode, setMode] = useState<OptimizationMode>("full");
  const [generatedMode, setGeneratedMode] = useState<OptimizationMode>("full");
  const selectedMode = optimizationModes.find(option => option.value === mode)!;
  const [result, setResult] = useState<Optimization | null>(null);
  const [generatedFor, setGeneratedFor] = useState("");
  const [draft, setDraft] = useState("");
  const [title, setTitle] = useState((resume.title.slice(0, 106) + " — Optimized").slice(0, 120));
  const [reviewed, setReviewed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState<"generate" | "save" | null>(null);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const stale = result !== null && (generatedFor !== jobDescription.trim() || generatedMode !== mode);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const input = optimizeInputSchema.safeParse({ resumeId: resume.id, jobDescription, mode });
    if (!input.success) { setError(input.error.issues[0].message); return; }
    busy.current = true;
    setPending("generate");
    setError("");
    try {
      const response = await fetch("/api/optimize", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input.data), signal: AbortSignal.timeout(60000),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
          ? payload.error : "Optimization failed. Please try again.";
        throw new Error(message);
      }
      const parsed = optimizationSchema.safeParse(payload);
      if (!parsed.success) throw new Error("The response was incomplete. Please try again.");
      setResult(parsed.data);
      setDraft(parsed.data.optimizedText);
      setGeneratedFor(input.data.jobDescription);
      setGeneratedMode(input.data.mode);
      setReviewed(false);
      setSaved(false);
    } catch (cause) {
      setError(cause instanceof Error && cause.name !== "TimeoutError"
        ? cause.message : "The request timed out. Please try again.");
    } finally { busy.current = false; setPending(null); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || saved || !reviewed || stale || !result) return;
    const input = createResumeSchema.safeParse({ title, content: draft });
    if (!input.success) { setError(input.error.issues[0].message); return; }
    busy.current = true;
    setPending("save");
    setError("");
    try {
      const outcome = await createResumeAction(input.data);
      if (!outcome.ok) { setError(outcome.error); return; }
      setSaved(true);
    } catch {
      setError("Connection interrupted. Check My Resumes before retrying to avoid saving a duplicate.");
    } finally { busy.current = false; setPending(null); }
  }

  return <div className="space-y-6">
    <Link href="/optimizer" className="text-sm text-muted-foreground underline">Choose another resume</Link>
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Resume Optimizer</h1>
      <p className="mt-2 break-words text-muted-foreground">Tailor “{resume.title}” to your next role. Review and save the result as a separate resume.</p>
    </div>
    <form onSubmit={generate} className="space-y-3 rounded-2xl border bg-card p-5" aria-busy={pending === "generate"}>
      <label htmlFor="optimizer-mode" className="block font-medium">Optimization focus</label>
      <select id="optimizer-mode" value={mode} disabled={pending !== null}
        aria-describedby="optimizer-mode-description" className={field}
        onChange={e => {
          const parsed = optimizationModeSchema.safeParse(e.target.value);
          if (parsed.success) { setMode(parsed.data); setReviewed(false); }
        }}>
        {optimizationModes.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <p id="optimizer-mode-description" className="text-sm text-muted-foreground">{selectedMode.description}</p>
      <label htmlFor="optimizer-job" className="block font-medium">Target job description</label>
      <textarea id="optimizer-job" required minLength={50} maxLength={12000} rows={6}
        value={jobDescription} disabled={pending !== null}
        onChange={e => { setJobDescription(e.target.value); setReviewed(false); }}
        className={field} placeholder="Paste the role, requirements and responsibilities…" />
      <p className="text-xs text-muted-foreground">50–12,000 characters. Generation may take up to a minute.</p>
      <Button disabled={pending !== null} type="submit">
        {pending === "generate" ? <Loader2 className="animate-spin" aria-hidden /> : <Sparkles aria-hidden />}
        {pending === "generate" ? "Optimizing…" : result ? "Generate a new draft" : "Optimize resume"}
      </Button>
      {result && <p className="text-xs text-muted-foreground">A successful new generation replaces the current draft, including unsaved edits.</p>}
    </form>
    {error && <p role="alert" className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}
    <p role="status" className="text-sm" aria-live="polite">{pending === "generate" ? "Preparing your draft…" : saved ? "Saved as a new resume." : result ? "Draft ready for review." : ""}</p>
    {result && <>
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">
        AI can introduce mistakes. Check every claim, date, skill and number before saving or applying.
        {stale && <p className="mt-2 font-medium">The job description or optimization focus changed. Generate a new draft before saving.</p>}
      </div>
      <p className="text-sm text-muted-foreground">Draft focus: {optimizationModes.find(option => option.value === generatedMode)?.label}. Compare the complete draft with your original before saving.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="min-w-0 rounded-xl border bg-card p-5">
          <h2 className="mb-3 font-semibold">Original resume</h2>
          <p className="max-h-[36rem] overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed">{resume.content}</p>
        </section>
        <form onSubmit={save} className="min-w-0 space-y-4 rounded-xl border bg-card p-5" aria-busy={pending === "save"}>
          <label htmlFor="optimizer-draft" className="block font-semibold">Suggested resume — editable</label>
          <textarea id="optimizer-draft" rows={18} required minLength={50} maxLength={12000} value={draft}
            disabled={pending !== null || saved} className={field}
            onChange={e => { setDraft(e.target.value); setReviewed(false); }} />
          <label htmlFor="optimizer-title" className="block text-sm font-medium">New resume title</label>
          <input id="optimizer-title" required maxLength={120} value={title} disabled={pending !== null || saved}
            onChange={e => setTitle(e.target.value)} className={field} />
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={reviewed} disabled={pending !== null || saved || stale}
              onChange={e => setReviewed(e.target.checked)} className="mt-1" />
            I checked the draft and confirmed its claims are accurate.
          </label>
          {saved ? <Link className={buttonVariants()} href="/resumes">View My Resumes</Link> :
            <Button type="submit" disabled={pending !== null || !reviewed || stale}>
              {pending === "save" && <Loader2 className="animate-spin" aria-hidden />}
              {pending === "save" ? "Saving…" : "Save as new resume"}
            </Button>}
          <p className="text-xs text-muted-foreground">Unsaved drafts are lost when you leave or reload this page.</p>
        </form>
      </div>
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-5"><h2 className="mb-3 font-semibold">Suggested changes</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm">{result.changes.map((text, i) => <li key={i}>{text}</li>)}</ul>
        </div>
        <div className="rounded-xl border p-5"><h2 className="mb-3 font-semibold">Review notes</h2>
          {result.cautions.length ? <ul className="list-disc space-y-2 pl-5 text-sm">{result.cautions.map((text, i) => <li key={i}>{text}</li>)}</ul> :
            <p className="text-sm text-muted-foreground">No specific notes returned. You still need to verify the draft.</p>}
        </div>
      </section>
    </>}
  </div>;
}
