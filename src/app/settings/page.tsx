import { UpdateProfileForm } from "@/components/settings/update-profile-form";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { SourcesForm } from "@/components/settings/sources-form";
import { getUser, getSettings } from "@/app/actions";

export default async function SettingsPage() {
  const user = await getUser();
  const settings = await getSettings();

  return (
    <div className="space-y-12">
      <h1 className="text-4xl font-bold font-headline">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <UpdateProfileForm user={user} />
          <ChangePasswordForm />
        </div>
        <div className="space-y-8">
          <SourcesForm settings={settings} />
        </div>
      </div>
    </div>
  );
}
