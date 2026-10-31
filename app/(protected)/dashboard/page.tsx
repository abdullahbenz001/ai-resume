import { getDashboard } from "@/features/dashboard/services/dashboard";
import { currentUser } from "@clerk/nextjs/server";

import {
  QuickActions,
  RecentActivity,
  StatsGrid,
  WelcomeCard,
} from "@/components/dashboard";

export default async function DashboardPage() {
  const [user, data] = await Promise.all([currentUser(), getDashboard()]);
  const name = user?.firstName ?? user?.username ?? null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <WelcomeCard name={name} />
      <StatsGrid
        resumes={data.resumes}
        analysisCount={data.analysisCount}
        average={data.average}
        latest={data.recent[0]?.score ?? null}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity items={data.recent} />
        <QuickActions />
      </div>
    </div>
  );
}
