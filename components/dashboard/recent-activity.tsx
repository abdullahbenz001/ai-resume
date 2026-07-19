import { Clock3 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function RecentActivity() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>
          Your latest resume analyses will show up here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 px-4 py-10 text-center">
          <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Clock3 className="size-4" aria-hidden />
          </span>
          <p className="text-sm font-medium text-foreground">No activity yet</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Run your first analysis to start building history.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
