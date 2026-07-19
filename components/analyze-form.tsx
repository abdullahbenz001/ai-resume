"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AnalysisResults } from "@/components/analysis-results";
import { AnalyzingState } from "@/components/analyzing-state";
import { ResumeUploader } from "@/components/resume-uploader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { analyzeMatch, AnalyzeApiError } from "@/lib/analyze-api";
import type { AnalysisResult } from "@/types/analysis";

export function AnalyzeForm() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Please provide both your resume and the job description.");
      return;
    }

    setIsLoading(true);

    try {
      const analysis = await analyzeMatch({ resumeText, jobDescription });
      setResult(analysis);
    } catch (err) {
      if (err instanceof AnalyzeApiError) {
        setError(err.message);
      } else {
        setError("Network error. Check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
        <CardHeader className="gap-2 border-b border-border/50 pb-5">
          <CardTitle className="text-lg tracking-tight sm:text-xl">
            Compare resume to role
          </CardTitle>
          <CardDescription className="text-[15px] leading-relaxed">
            Upload a PDF or paste resume text, then add the job description. We
            analyze fit, highlight gaps, and suggest stronger wording.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
              <div className="space-y-2.5">
                <Label
                  htmlFor="resume-text"
                  className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase"
                >
                  Resume Text
                </Label>

                <ResumeUploader
                  disabled={isLoading}
                  onExtracted={(text) => {
                    setResumeText(text);
                    setError(null);
                  }}
                  onClear={() => setResumeText("")}
                />

                <Textarea
                  id="resume-text"
                  value={resumeText}
                  onChange={(event) => setResumeText(event.target.value)}
                  placeholder="Paste your full resume text here, or upload a PDF above..."
                  className="min-h-56 resize-y rounded-xl border-border/70 bg-background/70 px-3.5 py-3 text-[15px] leading-relaxed shadow-none transition-colors focus-visible:bg-background"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2.5">
                <Label
                  htmlFor="job-description"
                  className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase"
                >
                  Job Description
                </Label>
                <Textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Paste the target job description here..."
                  className="min-h-56 resize-y rounded-xl border-border/70 bg-background/70 px-3.5 py-3 text-[15px] leading-relaxed shadow-none transition-colors focus-visible:bg-background"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error ? (
              <Alert variant="destructive" className="rounded-xl">
                <AlertTitle>Analysis failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground sm:max-w-sm">
                Your text is sent securely to generate a match analysis. Nothing
                is stored in this demo flow.
              </p>
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="h-10 min-w-44 rounded-xl px-5 transition-transform duration-200 active:translate-y-px"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles data-icon="inline-start" />
                    Analyze Match
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading ? <AnalyzingState /> : null}

      {result && !isLoading ? <AnalysisResults result={result} /> : null}
    </div>
  );
}
