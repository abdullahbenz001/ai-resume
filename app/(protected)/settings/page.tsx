import { PageHeader } from "@/components/app-shell/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Settings"
        description="Configure application preferences and notifications."
      />
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Application settings will be available in a later phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Placeholder for settings controls.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
