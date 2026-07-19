import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NotificationButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Notifications"
      className="relative size-9 rounded-xl"
      disabled
    >
      <Bell className="size-4" />
      <span className="absolute top-2 right-2 size-1.5 rounded-full bg-teal-600 dark:bg-teal-400" />
    </Button>
  );
}
