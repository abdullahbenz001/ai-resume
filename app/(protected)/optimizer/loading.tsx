export default function Loading() {
  return <div role="status" className="mx-auto max-w-6xl animate-pulse">
    <span className="sr-only">Loading optimizer…</span>
    <div className="mb-6 h-10 w-64 rounded bg-muted" />
    <div className="h-80 rounded-xl bg-muted" />
  </div>;
}
