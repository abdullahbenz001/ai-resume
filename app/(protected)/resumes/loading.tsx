export default function Loading() {
  return (
    <div role="status" className="mx-auto max-w-6xl animate-pulse">
      <span className="sr-only">Loading resumes…</span>
      <div className="mb-8 h-12 w-60 rounded-xl bg-muted" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
