import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
export function RecentActivity({
  items,
}: {
  items: {
    id: string;
    score: number;
    createdAt: Date;
    resume: { title: string | null };
  }[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Your latest resume comparisons.</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <ul className="divide-y">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <Link
                    href="/history"
                    className="block truncate text-sm font-medium hover:underline"
                  >
                    {item.resume.title || "Untitled resume"}
                  </Link>
                  <time
                    className="text-xs text-muted-foreground"
                    dateTime={item.createdAt.toISOString()}
                  >
                    {item.createdAt.toISOString().slice(0, 10)}
                  </time>
                </div>
                <span className="font-semibold tabular-nums text-teal-700 dark:text-teal-400">
                  {item.score}%
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Run your first analysis to start building history.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
