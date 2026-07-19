import { PageHeader } from "@/components/app-shell/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AnalyzerPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Resume Analyzer"
        description="Compare a resume to a job description and get a match score."
      />
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            The analyzer workspace will live here in a later phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            For now, use the public landing page to run an analysis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
