import { CheckCircle2, Lightbulb, XCircle } from "lucide-react";

import { ScoreRing } from "@/components/score-ring";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AnalysisResult } from "@/types/analysis";
import { cn } from "@/lib/utils";

interface AnalysisResultsProps {
  result: AnalysisResult;
}

function fitLabel(score: number): string {
  if (score >= 80) return "Strong fit";
  if (score >= 60) return "Moderate fit";
  return "Needs work";
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-5 duration-500 sm:space-y-6">
      <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
        <CardContent className="flex flex-col items-center gap-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="max-w-md space-y-2 text-center sm:text-left">
            <p className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase">
              Match analysis
            </p>
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {fitLabel(result.score)}
            </h2>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Based on your resume and the target job description. Use the gaps
              and suggestions below to tighten your application.
            </p>
          </div>
          <ScoreRing score={result.score} />
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base tracking-tight">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              Strengths
            </CardTitle>
            <CardDescription>Skills that align with the role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.strengths.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="rounded-lg px-2.5 py-1 text-[13px] font-medium"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base tracking-tight">
              <XCircle className="size-4 text-rose-600 dark:text-rose-400" />
              Missing Skills
            </CardTitle>
            <CardDescription>Gaps to address before applying</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.missingSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="rounded-lg px-2.5 py-1 text-[13px] font-medium"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base tracking-tight">
            <Lightbulb className="size-4 text-amber-600 dark:text-amber-400" />
            Suggestions
          </CardTitle>
          <CardDescription>
            Actionable improvements for a stronger match
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.suggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                className={cn(
                  "flex gap-3 rounded-xl border border-transparent bg-muted/40 px-3.5 py-3 text-[15px] leading-relaxed text-foreground transition-colors duration-200 hover:border-border/60 hover:bg-muted/70"
                )}
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-background text-xs font-semibold text-muted-foreground shadow-sm ring-1 ring-border/60">
                  {index + 1}
                </span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
