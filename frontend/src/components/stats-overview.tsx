import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jobs } from "@/lib/data";
import { Activity, Briefcase, CheckCircle, Clock } from "lucide-react";

export function StatsOverview() {
    // Calculate stats from mock data
    const totalApplied = jobs.filter(j => j.status !== 'new').length;
    const interviews = jobs.filter(j => j.status === 'INTERVIEW').length;
    const offers = jobs.filter(j => j.status === 'OFFER').length;
    const waiting = jobs.filter(j => j.status === 'WAITING' || j.status === 'APPLIED').length;

    const stats = [
        {
            title: "Total Applied",
            value: totalApplied,
            icon: Briefcase,
            color: "bg-blue-200 dark:bg-blue-900",
            textColor: "text-blue-700 dark:text-blue-100"
        },
        {
            title: "Interviews",
            value: interviews,
            icon: Activity,
            color: "bg-yellow-200 dark:bg-yellow-900",
            textColor: "text-yellow-700 dark:text-yellow-100"
        },
        {
            title: "Offers",
            value: offers,
            icon: CheckCircle,
            color: "bg-green-200 dark:bg-green-900",
            textColor: "text-green-700 dark:text-green-100"
        },
        {
            title: "Waiting",
            value: waiting,
            icon: Clock,
            color: "bg-purple-200 dark:bg-purple-900",
            textColor: "text-purple-700 dark:text-purple-100"
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <Card key={index} className="border-3 border-black dark:border-white shadow-neobrutal dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-none hover:translate-y-[-2px] transition-transform bg-white dark:bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold font-headline uppercase tracking-wider dark:text-white">
                            {stat.title}
                        </CardTitle>
                        <div className={`p-2 border-2 border-black dark:border-white rounded-none ${stat.color}`}>
                            <stat.icon className={`h-4 w-4 ${stat.textColor} font-bold`} strokeWidth={3} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black font-headline dark:text-white">{stat.value}</div>
                        <p className="text-xs font-bold text-muted-foreground mt-1">+2 from last week</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
