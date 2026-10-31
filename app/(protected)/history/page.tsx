import Link from "next/link";
import { getHistory } from "@/features/analysis/services/analysis";
import { AnalysisResults } from "@/components/analysis-results";
import { PageHeader } from "@/components/app-shell/page-header";
import { buttonVariants } from "@/components/ui/button";
export default async function HistoryPage() {
  const analyses = await getHistory();
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Analysis history"
        description="Your latest 50 saved comparisons. Expand a result to review its suggestions."
      />
      {analyses.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <h2 className="text-xl font-semibold">No analyses yet</h2>
          <p className="my-4 text-muted-foreground">
            Compare your resume to a role to start your history.
          </p>
          <Link href="/analyzer" className={buttonVariants()}>
            Analyze a resume
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((a) => (
            <details key={a.id} className="rounded-xl border bg-card p-5">
              <summary className="cursor-pointer font-medium">
                {a.resume.title || "Untitled resume"} · {a.score}% match{" "}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {a.createdAt.toISOString().slice(0, 10)}
                </span>
              </summary>
              <div className="mt-5 space-y-5">
                <details>
                  <summary className="cursor-pointer text-sm">
                    Job description
                  </summary>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                    {a.jobDescription}
                  </p>
                </details>
                <AnalysisResults
                  result={{
                    score: a.score,
                    strengths: a.strengths,
                    missingSkills: a.missingSkills,
                    suggestions: a.suggestions,
                  }}
                />
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
