import { notFound } from "next/navigation";
import { AnalyzeForm } from "@/components/analyze-form";
import { PageHeader } from "@/components/app-shell/page-header";
import { getResume } from "@/features/resume/services/resume";
export default async function AnalyzerPage({
  searchParams,
}: {
  searchParams: Promise<{ resumeId?: string }>;
}) {
  const { resumeId } = await searchParams;
  const resume = resumeId ? await getResume(resumeId) : null;
  if (resumeId && !resume) notFound();
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Resume Analyzer"
        description={
          resume
            ? `Compare “${resume.title || "Untitled resume"}” against a job description.`
            : "Compare your experience with your next opportunity."
        }
      />
      <AnalyzeForm
        key={resume?.id || "new"}
        savedResume={
          resume ? { id: resume.id, content: resume.content } : undefined
        }
      />
    </div>
  );
}
