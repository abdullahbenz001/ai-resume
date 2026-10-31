export type ResumeSummary = {
  id: string;
  title: string;
  preview: string;
  fileName: string | null;
  isFavorite: boolean;
  updatedAt: string;
  analysisCount: number;
};
export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fields?: Record<string, string[]> };
