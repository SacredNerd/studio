import { StatsOverview } from "@/components/stats-overview";
import { AgentStatusWidget } from "@/components/agent-status-widget";
import { RecentActivity } from "@/components/recent-activity";
import { QuickActions } from "@/components/quick-actions";
import { UpcomingInterviews } from "@/components/upcoming-interviews";

export default function Dashboard() {
    // Dashboard logic simplified as job discovery moved to /jobs

    return (
        <div className="min-h-screen bg-background pb-12">
            <div className="container mx-auto px-4 md:px-6 space-y-8 mt-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-headline font-black uppercase tracking-tight dark:text-white">Dashboard</h1>
                    <p className="text-xl text-muted-foreground font-medium dark:text-gray-400">Welcome back. Here's what's happening today.</p>
                </div>

                {/* Stats Overview */}
                <StatsOverview />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <UpcomingInterviews />
                        <RecentActivity />
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8">
                        <QuickActions />
                        <AgentStatusWidget />
                    </div>
                </div>
            </div>
        </div>
    );
}
