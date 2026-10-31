import Link from "next/link";
import { notFound } from "next/navigation";
import { getResume, listResumes } from "@/features/resume/services/resume";
import { OptimizerWorkspace } from "@/features/optimizer/components/optimizer-workspace";
import { buttonVariants } from "@/components/ui/button";
export default async function OptimizerPage({
  searchParams,
}: { searchParams: Promise<{ resumeId?: string | string[] }> }) {
  const { resumeId } = await searchParams;
  if (resumeId !== undefined) {
    if (typeof resumeId !== "string") notFound();
    const resume = await getResume(resumeId);
    if (!resume) notFound();
    return <div className="mx-auto w-full max-w-6xl">
      <OptimizerWorkspace key={resume.id} resume={{ id: resume.id, title: resume.title || "Untitled resume", content: resume.content }} />
    </div>;
  }
  const resumes = await listResumes();
  return <div className="mx-auto w-full max-w-6xl space-y-6">
    <h1 className="text-3xl font-semibold tracking-tight">Resume Optimizer</h1>
    <p className="text-muted-foreground">Choose a saved resume to tailor its wording to a job description.</p>
    {resumes.length === 0 ? <div className="rounded-2xl border border-dashed p-8">
      <p className="mb-4">Save your first resume to start optimizing.</p>
      <Link href="/resumes" className={buttonVariants()}>Go to My Resumes</Link>
    </div> : <ul className="grid gap-4 sm:grid-cols-2">
      {resumes.map(resume => <li key={resume.id}>
        <Link href={`/optimizer?resumeId=${encodeURIComponent(resume.id)}`} className="block rounded-xl border bg-card p-5 font-medium break-words hover:bg-muted focus-visible:outline-2">
          {resume.title}<span className="mt-2 block text-sm font-normal text-muted-foreground">Optimize this resume →</span>
        </Link>
      </li>)}
    </ul>}
  </div>;
}
