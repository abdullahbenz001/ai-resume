import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type WelcomeCardProps = {
  name?: string | null;
};

export function WelcomeCard({ name }: WelcomeCardProps) {
  const greeting = name ? `Welcome back, ${name}` : "Welcome back";

  return (
    <Card className="border-0 bg-[linear-gradient(135deg,oklch(0.97_0.02_200),oklch(0.99_0.01_240))] ring-foreground/8 dark:bg-[linear-gradient(135deg,oklch(0.22_0.02_220),oklch(0.18_0.01_260))]">
      <CardHeader>
        <CardTitle className="font-heading text-2xl tracking-tight">
          {greeting}
        </CardTitle>
        <CardDescription className="max-w-xl text-base">
          Compare resumes to job descriptions, track match scores, and improve
          your applications from one workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button render={<Link href="/analyzer" />} nativeButton={false}>
          Analyze a resume
          <ArrowRight data-icon="inline-end" />
        </Button>
      </CardContent>
    </Card>
  );
}
