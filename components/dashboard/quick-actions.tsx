import Link from "next/link";
import { FileSearch, History, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const actions = [
  {
    title: "Resume Analyzer",
    description: "Match a resume to a job description.",
    href: "/analyzer",
    icon: FileSearch,
  },
  {
    title: "View history",
    description: "Browse past analyses and scores.",
    href: "/history",
    icon: History,
  },
  {
    title: "Update profile",
    description: "Keep your account details current.",
    href: "/profile",
    icon: UserRound,
  },
] as const;

export function QuickActions() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>Jump into common workflows.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Button
              key={action.href}
              variant="outline"
              render={<Link href={action.href} />}
              nativeButton={false}
              className="h-auto w-full justify-start gap-3 px-3 py-3 text-left whitespace-normal"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  {action.title}
                </span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {action.description}
                </span>
              </span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
