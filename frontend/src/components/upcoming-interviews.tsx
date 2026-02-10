import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jobs } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock } from "lucide-react";

export function UpcomingInterviews() {
    const interviews = jobs.filter(j => j.status === 'INTERVIEW');

    return (
        <Card className="border-3 border-black dark:border-white shadow-neobrutal dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none bg-white dark:bg-card">
            <CardHeader className="border-b-3 border-black dark:border-white bg-yellow-100 dark:bg-yellow-900/30 pb-3 pt-3">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 dark:text-white" />
                    <CardTitle className="font-headline font-black uppercase text-lg dark:text-white">Upcoming Interviews</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {interviews.length > 0 ? (
                    <div className="divide-y-2 divide-gray-100 dark:divide-gray-800">
                        {interviews.map((job) => (
                            <div key={job.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg dark:text-white">{job.companyName}</h3>
                                    <Badge className="bg-black text-white rounded-none dark:bg-white dark:text-black">
                                        TOMORROW
                                    </Badge>
                                </div>
                                <p className="font-medium text-primary mb-3">{job.title}</p>

                                <div className="space-y-2 text-sm text-muted-foreground font-medium">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>10:00 AM - 11:00 AM</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>Google Meet</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-muted-foreground font-medium">
                        No upcoming interviews scheduled.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
