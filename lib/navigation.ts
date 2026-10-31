import type { LucideIcon } from "lucide-react";
import {
  FileSearch,
  Sparkles,
  Files,
  History,
  LayoutDashboard,
  Settings,
  UserRound,
} from "lucide-react";

export type AppNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const appNavItems: AppNavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Resumes", href: "/resumes", icon: Files },
  { title: "Resume Analyzer", href: "/analyzer", icon: FileSearch },
  { title: "Resume Optimizer", href: "/optimizer", icon: Sparkles },
  { title: "History", href: "/history", icon: History },
  { title: "Profile", href: "/profile", icon: UserRound },
  { title: "Settings", href: "/settings", icon: Settings },
];
