import { useEffect, useState } from "react";
// import { UpdateProfileForm } from "@/components/settings/update-profile-form";
// import { ChangePasswordForm } from "@/components/settings/change-password-form";
// import { SourcesForm } from "@/components/settings/sources-form";
import { api } from "@/services/api";

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        api.getUser().then(setUser);
        api.getSettings().then(setSettings);
    }, []);

    if (!user || !settings) return <div>Loading settings...</div>;

    return (
        <div className="space-y-12 px-4 md:px-0 container mx-auto py-6">
            <h1 className="text-4xl font-bold font-headline dark:text-white">Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8 bg-white dark:bg-card p-8 border-3 border-black dark:border-white shadow-neobrutal dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none">
                    <h2 className="text-2xl font-headline font-black uppercase border-b-3 border-black dark:border-white pb-2 mb-6 dark:text-white">Profile Settings</h2>
                    <p className="font-medium text-lg dark:text-white">Settings forms will be migrated here.</p>
                    {/* <UpdateProfileForm user={user} />
          <ChangePasswordForm /> */}
                </div>
                <div className="space-y-8 bg-secondary/20 dark:bg-secondary/10 p-8 border-3 border-black dark:border-white shadow-neobrutal dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none">
                    <h2 className="text-2xl font-headline font-black uppercase border-b-3 border-black dark:border-white pb-2 mb-6 dark:text-white">Data Sources</h2>
                    <p className="font-medium text-lg dark:text-white">Connect your job boards here.</p>
                    {/* <SourcesForm settings={settings} /> */}
                </div>
            </div>
        </div>
    );
}
