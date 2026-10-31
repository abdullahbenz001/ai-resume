import { listResumes } from "@/features/resume/services/resume";
import { ResumeWorkspace } from "@/features/resume/components/resume-workspace";
export default async function ResumesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <ResumeWorkspace resumes={await listResumes()} />
    </div>
  );
}
