import Link from "next/link";

import { cn } from "@/lib/utils";

type AppLogoProps = {
  href?: string;
  className?: string;
};

export function AppLogo({ href = "/dashboard", className }: AppLogoProps) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2.5 outline-none", className)}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-[11px] font-semibold tracking-tight text-background">
        AR
      </span>
      <span className="text-sm font-semibold tracking-tight text-foreground">
        AI Resume Match
      </span>
    </Link>
  );
}
