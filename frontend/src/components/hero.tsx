import { Button } from "@/components/ui/button";
import { Briefcase, Search, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
    return (
        <div className="w-full bg-white dark:bg-card border-b-3 border-black dark:border-white py-16 md:py-24">
            <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
                <div className="space-y-4 max-w-3xl">
                    <h1 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tight text-black dark:text-white leading-tight">
                        Find Your <span className="text-primary underline decoration-4 underline-offset-4">Dream Job</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-black/70 dark:text-white/70 font-medium max-w-[800px] mx-auto">
                        Automated search, smart filtering, and AI-powered applications. <br className="hidden md:inline" />
                        Let our agent handle the boring stuff while you prepare for interviews.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                    <Button asChild size="lg" className="h-14 px-8 text-lg font-bold border-2 border-black dark:border-white shadow-neobrutal dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-none transition-all rounded-none uppercase bg-primary text-white">
                        <Link to="/setup">
                            Get Started Now
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-bold border-2 border-black dark:border-white shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-none transition-all rounded-none uppercase bg-white dark:bg-card dark:text-white">
                        <Link to="/#jobs">
                            Explore Demo
                            <Briefcase className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>

                {/* Decorative elements */}
                <div className="flex items-center gap-8 pt-8 text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                    <div className="flex items-center gap-2">
                        <Search className="h-4 w-4" /> Smart Search
                    </div>
                    <div className="w-2 h-2 bg-black dark:bg-white rounded-full" />
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-current" /> AI Matching
                    </div>
                    <div className="w-2 h-2 bg-black dark:bg-white rounded-full" />
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" /> Auto-Apply
                    </div>
                </div>
            </div>
        </div>
    );
}
