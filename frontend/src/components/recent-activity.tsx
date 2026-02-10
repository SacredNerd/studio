import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jobs } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function RecentActivity() {
    // Sort jobs by ID (proxy for date) or just take the last few that aren't 'new'
    const recentActivities = jobs
        .filter(j => j.status !== 'new')
        .slice(0, 5);

    return (
        <Card className="border-3 border-black dark:border-white shadow-neobrutal dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none bg-white dark:bg-card">
            <CardHeader className="border-b-3 border-black dark:border-white bg-secondary/10 pb-4">
                <CardTitle className="font-headline font-black uppercase text-xl dark:text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[250px]">
                    <div className="divide-y-2 divide-gray-100 dark:divide-gray-800">
                        {recentActivities.map((job) => (
                            <div key={job.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                <Avatar className="h-10 w-10 border-2 border-black dark:border-white rounded-none">
                                    <AvatarFallback className="rounded-none bg-primary text-white font-bold">
                                        {job.companyName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1 flex-1">
                                    <p className="text-sm font-bold dark:text-white line-clamp-1">
                                        Application status updated for <span className="text-primary">{job.title}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">{job.companyName}</p>
                                    <div className="flex items-center gap-2 pt-1">
                                        <Badge variant="outline" className="rounded-none border-black dark:border-white font-bold text-[10px] uppercase">
                                            {job.status}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground">Today</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
