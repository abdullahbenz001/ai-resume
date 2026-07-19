import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-foreground text-[11px] font-semibold tracking-tight text-background">
            AR
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            AI Resume Match
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
