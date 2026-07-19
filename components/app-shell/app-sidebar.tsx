import { AppLogo } from "@/components/app-shell/app-logo";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

export function AppSidebar({ onNavigate, className }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <AppLogo />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <SidebarNav onNavigate={onNavigate} />
      </div>
    </aside>
  );
}
