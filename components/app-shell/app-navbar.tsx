"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";

import { AppLogo } from "@/components/app-shell/app-logo";
import { NotificationButton } from "@/components/app-shell/notification-button";
import { Button } from "@/components/ui/button";

type AppNavbarProps = {
  onMenuClick: () => void;
};

export function AppNavbar({ onMenuClick }: AppNavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 rounded-xl lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </Button>

      <div className="lg:hidden">
        <AppLogo />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <NotificationButton />
        <UserButton />
      </div>
    </header>
  );
}
