import { PageHeader } from "@/components/app-shell/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Profile"
        description="Manage your personal details and account preferences."
      />
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Profile editing will be available in a later phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Placeholder for profile settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
