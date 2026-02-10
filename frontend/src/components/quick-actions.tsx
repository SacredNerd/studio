import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText, Settings, RefreshCw, PlusCircle, CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";

export function QuickActions() {
    const actions = [
        {
            label: "Scan New Jobs",
            icon: RefreshCw,
            to: "/jobs",
            variant: "default" as const,
            color: "bg-primary text-white"
        },
        {
            label: "Update Resume",
            icon: FileText,
            to: "/setup",
            variant: "outline" as const,
            color: "bg-white dark:bg-card dark:text-white"
        },
        {
            label: "Job Preferences",
            icon: Settings,
            to: "/settings",
            variant: "outline" as const,
            color: "bg-white dark:bg-card dark:text-white"
        },
        {
            label: "Add Manual Job",
            icon: PlusCircle,
            to: "/jobs",
            variant: "outline" as const,
            color: "bg-white dark:bg-card dark:text-white"
        },
        {
            label: "Check Status",
            icon: CheckSquare,
            to: "/jobs",
            variant: "outline" as const,
            color: "bg-white dark:bg-card dark:text-white"
        },
        {
            label: "View Archive",
            icon: Briefcase,
            to: "/jobs?status=REJECTED",
            variant: "outline" as const,
            color: "bg-white dark:bg-card dark:text-white"
        }
    ];

    return (
        <Card className="border-3 border-black dark:border-white shadow-neobrutal dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none bg-white dark:bg-card">
            <CardHeader className="border-b-3 border-black dark:border-white bg-secondary/20 dark:bg-secondary/10 pb-3 pt-3">
                <CardTitle className="font-headline font-black uppercase text-lg dark:text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3">
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            asChild
                            variant={action.variant}
                            className={`h-auto py-3 flex flex-col items-center justify-center gap-1.5 border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-none transition-all font-bold uppercase tracking-wide ${action.color}`}
                        >
                            <Link to={action.to}>
                                <action.icon className="h-6 w-6 mb-1" />
                                <span className="text-xs">{action.label}</span>
                            </Link>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
