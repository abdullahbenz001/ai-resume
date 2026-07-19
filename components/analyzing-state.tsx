import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STEPS = [
  "Parsing resume content",
  "Comparing against job requirements",
  "Scoring skills and experience",
  "Generating tailored suggestions",
];

export function AnalyzingState() {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="relative flex size-10 items-center justify-center rounded-xl bg-muted">
            <Loader2 className="size-5 animate-spin text-foreground" />
            <span className="absolute inset-0 animate-ping rounded-xl bg-foreground/5" />
          </div>
          <div>
            <CardTitle className="text-base">Analyzing match</CardTitle>
            <CardDescription>
              This usually takes a few seconds
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="analyzing-bar h-full w-1/3 rounded-full bg-foreground/80" />
        </div>

        <ul className="space-y-3">
          {STEPS.map((step, index) => (
            <li
              key={step}
              className="analyzing-step flex items-center gap-3 text-sm text-muted-foreground"
              style={{ animationDelay: `${index * 180}ms` }}
            >
              <span className="size-1.5 shrink-0 rounded-full bg-foreground/40" />
              {step}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
