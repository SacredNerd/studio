import { UpdateProfileForm } from "@/components/settings/update-profile-form";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { SourcesForm } from "@/components/settings/sources-form";

export default function SettingsPage() {
  return (
    <div className="space-y-12">
      <h1 className="text-4xl font-bold font-headline">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <UpdateProfileForm />
          <ChangePasswordForm />
        </div>
        <div className="space-y-8">
          <SourcesForm />
        </div>
      </div>
    </div>
  );
}
