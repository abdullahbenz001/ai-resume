import { FileText, Target, FileSearch, TrendingUp } from "lucide-react";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
export function StatsGrid({
  resumes,
  analysisCount,
  average,
  latest,
}: {
  resumes: number;
  analysisCount: number;
  average: number | null;
  latest: number | null;
}) {
  const stats = [
    { label: "Saved resumes", value: resumes, icon: FileText },
    { label: "Analyses run", value: analysisCount, icon: FileSearch },
    {
      label: "Average match",
      value: average === null ? "—" : `${Math.round(average)}%`,
      icon: Target,
    },
    {
      label: "Latest match",
      value: latest === null ? "—" : `${latest}%`,
      icon: TrendingUp,
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label} size="sm">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardDescription>{label}</CardDescription>
              <CardTitle className="mt-2 text-2xl tabular-nums">
                {value}
              </CardTitle>
            </div>
            <Icon className="size-5 text-teal-700" aria-hidden />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
