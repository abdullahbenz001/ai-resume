import { FileSearch, Target, TrendingUp, Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  {
    label: "Analyses run",
    value: "—",
    hint: "No data yet",
    icon: FileSearch,
  },
  {
    label: "Avg. match score",
    value: "—",
    hint: "After first analysis",
    icon: Target,
  },
  {
    label: "Skill gaps found",
    value: "—",
    hint: "Tracked over time",
    icon: TrendingUp,
  },
  {
    label: "Suggestions",
    value: "—",
    hint: "Rewrite ideas ready",
    icon: Sparkles,
  },
] as const;

export function StatsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card key={stat.label} size="sm">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="mt-1 font-heading text-2xl tabular-nums">
                  {stat.value}
                </CardTitle>
              </div>
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="size-4" aria-hidden />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
