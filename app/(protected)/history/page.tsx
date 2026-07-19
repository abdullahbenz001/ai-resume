import { PageHeader } from "@/components/app-shell/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HistoryPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="History"
        description="Review past analyses and track how your match scores change."
      />
      <Card>
        <CardHeader>
          <CardTitle>No history yet</CardTitle>
          <CardDescription>
            Saved analyses will appear here once history is enabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Placeholder for the analysis history list.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
