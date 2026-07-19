import Link from "next/link";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const APP_HOME = "/dashboard";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 outline-none">
          <span className="flex size-7 items-center justify-center rounded-lg bg-foreground text-[11px] font-semibold tracking-tight text-background">
            AR
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            AI Resume Match
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton
              mode="modal"
              forceRedirectUrl={APP_HOME}
              fallbackRedirectUrl={APP_HOME}
            >
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton
              mode="modal"
              forceRedirectUrl={APP_HOME}
              fallbackRedirectUrl={APP_HOME}
            >
              <Button size="sm">Sign up</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Button
              render={<Link href={APP_HOME} />}
              nativeButton={false}
              size="sm"
              variant="outline"
            >
              Dashboard
            </Button>
            <UserButton />
          </Show>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
