import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Terminal, Settings } from "lucide-react";

export function AgentStatusWidget() {
    return (
        <Card className="border-3 border-black dark:border-white shadow-neobrutal dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none bg-white dark:bg-card flex flex-col">
            <CardHeader className="border-b-3 border-black dark:border-white bg-slate-100 dark:bg-slate-800 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-black dark:bg-white border-2 border-black dark:border-white">
                            <Terminal className="h-4 w-4 text-white dark:text-black" />
                        </div>
                        <CardTitle className="font-headline font-black uppercase text-xl dark:text-white">AI Agent Status</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900 border-2 border-black dark:border-white text-xs font-bold uppercase text-green-700 dark:text-green-300">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Idle
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-6 space-y-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold border-b-2 border-dashed border-gray-300 dark:border-gray-700 pb-2">
                        <span className="text-muted-foreground">Last Run</span>
                        <span className="font-mono dark:text-white">2 hours ago</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold border-b-2 border-dashed border-gray-300 dark:border-gray-700 pb-2">
                        <span className="text-muted-foreground">Jobs Scanned</span>
                        <span className="font-mono dark:text-white">142</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold border-b-2 border-dashed border-gray-300 dark:border-gray-700 pb-2">
                        <span className="text-muted-foreground">Applications Sent</span>
                        <span className="font-mono dark:text-white">12</span>
                    </div>
                </div>

                <div className="bg-slate-900 text-green-400 p-4 font-mono text-xs border-2 border-black dark:border-white shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                    <p className="opacity-70">$ agent check-status</p>
                    <p>{">"} All systems operational.</p>
                    <p>{">"} Waiting for next scheduled run...</p>
                    <span className="animate-pulse">_</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto pt-4">
                    <Button className="w-full border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-none transition-all bg-primary text-white font-bold uppercase tracking-wide">
                        <Play className="mr-2 h-4 w-4" /> Start
                    </Button>
                    <Button variant="outline" className="w-full border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-none transition-all font-bold uppercase tracking-wide dark:text-white dark:bg-card">
                        <Settings className="mr-2 h-4 w-4" /> Config
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
