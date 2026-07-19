export const RESUME_PDF_MAX_BYTES = 5 * 1024 * 1024;

export const RESUME_PDF_ACCEPT = {
  "application/pdf": [".pdf"],
} as const;

export type ResumePdfProgress = {
  /** 0–100 upload/extract progress */
  percent: number;
  stage: "uploading" | "extracting";
};

/**
 * Client-side validation for resume PDF uploads.
 * Returns an error message, or null when valid.
 */
export function validateResumePdfFile(file: File): string | null {
  const isPdfMime = file.type === "application/pdf";
  const isPdfName = file.name.toLowerCase().endsWith(".pdf");

  if (!isPdfMime && !isPdfName) {
    return "Only PDF files are allowed.";
  }

  if (file.size <= 0) {
    return "This PDF appears to be empty.";
  }

  if (file.size > RESUME_PDF_MAX_BYTES) {
    return "PDF must be 5MB or smaller.";
  }

  return null;
}

function readErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  if (!("error" in data)) return null;
  const message = (data as { error?: unknown }).error;
  return typeof message === "string" && message.trim()
    ? message.trim()
    : null;
}

/**
 * Uploads a resume PDF and returns extracted plain text.
 * Progress covers upload, then a brief extracting stage while waiting.
 */
export function uploadAndExtractResumePdf(
  file: File,
  options?: {
    onProgress?: (progress: ResumePdfProgress) => void;
    signal?: AbortSignal;
  }
): Promise<string> {
  const validationError = validateResumePdfFile(file);
  if (validationError) {
    return Promise.reject(new Error(validationError));
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    const abort = () => {
      xhr.abort();
      reject(new Error("PDF upload was cancelled."));
    };

    if (options?.signal) {
      if (options.signal.aborted) {
        abort();
        return;
      }
      options.signal.addEventListener("abort", abort, { once: true });
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.min(
        90,
        Math.round((event.loaded / event.total) * 90)
      );
      options?.onProgress?.({ percent, stage: "uploading" });
    };

    xhr.upload.onload = () => {
      options?.onProgress?.({ percent: 92, stage: "extracting" });
    };

    xhr.onerror = () => {
      reject(new Error("Network error while uploading the PDF."));
    };

    xhr.onabort = () => {
      reject(new Error("PDF upload was cancelled."));
    };

    xhr.onload = () => {
      options?.onProgress?.({ percent: 100, stage: "extracting" });

      let payload: unknown = null;
      try {
        payload = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        reject(new Error("Failed to read the PDF extraction response."));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        reject(
          new Error(
            readErrorMessage(payload) ??
              "Failed to extract text from this PDF."
          )
        );
        return;
      }

      const text =
        payload &&
        typeof payload === "object" &&
        "text" in payload &&
        typeof (payload as { text: unknown }).text === "string"
          ? (payload as { text: string }).text
          : "";

      if (!text.trim()) {
        reject(
          new Error(
            "This PDF appears to be empty or contains no extractable text."
          )
        );
        return;
      }

      resolve(text);
    };

    options?.onProgress?.({ percent: 5, stage: "uploading" });
    xhr.open("POST", "/api/extract-pdf");
    xhr.send(formData);
  });
}
