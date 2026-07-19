import { currentUser } from "@clerk/nextjs/server";

import {
  QuickActions,
  RecentActivity,
  StatsGrid,
  WelcomeCard,
} from "@/components/dashboard";

export default async function DashboardPage() {
  const user = await currentUser();
  const name = user?.firstName ?? user?.username ?? null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <WelcomeCard name={name} />
      <StatsGrid />
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  );
}
