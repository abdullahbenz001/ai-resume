"use client";

import { FileText, Loader2, Upload, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { useDropzone, type FileRejection } from "react-dropzone";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  RESUME_PDF_ACCEPT,
  RESUME_PDF_MAX_BYTES,
  uploadAndExtractResumePdf,
  validateResumePdfFile,
  type ResumePdfProgress,
} from "@/lib/resume-pdf";
import { cn } from "@/lib/utils";

export type ResumeUploaderProps = {
  disabled?: boolean;
  className?: string;
  onExtracted: (text: string, meta: { fileName: string }) => void;
  onError?: (message: string) => void;
  onClear?: () => void;
};

function rejectionMessage(rejection: FileRejection): string {
  const code = rejection.errors[0]?.code;

  if (code === "file-invalid-type") {
    return "Only PDF files are allowed.";
  }

  if (code === "file-too-large") {
    return "PDF must be 5MB or smaller.";
  }

  return rejection.errors[0]?.message || "Unable to accept this file.";
}

export function ResumeUploader({
  disabled = false,
  className,
  onExtracted,
  onError,
  onClear,
}: ResumeUploaderProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ResumePdfProgress | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const reportError = useCallback(
    (message: string) => {
      setError(message);
      onError?.(message);
    },
    [onError]
  );

  const processFile = useCallback(
    async (file: File) => {
      const validationError = validateResumePdfFile(file);
      if (validationError) {
        setFileName(null);
        reportError(validationError);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setError(null);
      setFileName(file.name);
      setIsProcessing(true);
      setProgress({ percent: 0, stage: "uploading" });

      try {
        const text = await uploadAndExtractResumePdf(file, {
          signal: controller.signal,
          onProgress: setProgress,
        });

        onExtracted(text, { fileName: file.name });
      } catch (err) {
        if (controller.signal.aborted) return;

        const message =
          err instanceof Error
            ? err.message
            : "Failed to extract text from this PDF.";
        setFileName(null);
        setProgress(null);
        reportError(message);
      } finally {
        if (!controller.signal.aborted) {
          setIsProcessing(false);
          setProgress(null);
        }
      }
    },
    [onExtracted, reportError]
  );

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (disabled || isProcessing) return;

      if (rejected[0]) {
        setFileName(null);
        reportError(rejectionMessage(rejected[0]));
        return;
      }

      const file = accepted[0];
      if (!file) return;
      void processFile(file);
    },
    [disabled, isProcessing, processFile, reportError]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: RESUME_PDF_ACCEPT,
    maxSize: RESUME_PDF_MAX_BYTES,
    multiple: false,
    disabled: disabled || isProcessing,
    noClick: true,
    noKeyboard: true,
  });

  function handleClear(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    abortRef.current?.abort();
    setFileName(null);
    setError(null);
    setIsProcessing(false);
    setProgress(null);
    onClear?.();
  }

  const progressLabel =
    progress?.stage === "extracting"
      ? "Extracting text…"
      : "Uploading PDF…";

  return (
    <div className={cn("space-y-2.5", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "rounded-xl border border-dashed border-border/70 bg-background/70 px-4 py-5 transition-colors",
          isDragActive && "border-teal-600/50 bg-teal-50/40 dark:bg-teal-950/20",
          (disabled || isProcessing) && "cursor-not-allowed opacity-60",
          !disabled && !isProcessing && "hover:border-border hover:bg-background"
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card">
              {isProcessing ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="size-4 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-foreground">
                {isDragActive
                  ? "Drop your resume PDF here"
                  : "Upload resume PDF"}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Drag and drop, or browse. PDF only, up to 5MB.
              </p>

              {fileName ? (
                <p className="flex items-center gap-1.5 pt-1 text-xs text-foreground/80">
                  <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{fileName}</span>
                </p>
              ) : null}

              {isProcessing && progress ? (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                    <span>{progressLabel}</span>
                    <span>{progress.percent}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-teal-700 transition-[width] duration-200 dark:bg-teal-400"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {fileName ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled || isProcessing}
                onClick={handleClear}
                className="rounded-lg"
              >
                <X data-icon="inline-start" />
                Clear
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isProcessing}
              onClick={open}
              className="rounded-lg"
            >
              {isProcessing ? "Processing…" : "Browse PDF"}
            </Button>
          </div>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive" className="rounded-xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
