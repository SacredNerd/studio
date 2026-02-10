"use client";

import { useState, useTransition } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Sparkles, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { getAiRefinement } from "@/app/actions";
import type { RefineSearchOutput } from "@/ai/flows/ai-search-refinement";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

export function FilterBar() {
  const navigate = useNavigate();
  const browserLocation = useLocation();
  const pathname = browserLocation.pathname;
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [jobType, setJobType] = useState(searchParams.get("jobType") || "all");
  const [location, setLocation] = useState(searchParams.get("location") || "all");
  const [salary, setSalary] = useState(searchParams.get("salary") || "all");
  const [date, setDate] = useState(searchParams.get("date") || "all");
  const [status, setStatus] = useState(searchParams.get("status") || "all");


  const [isPending, startTransition] = useTransition();
  const [aiResult, setAiResult] = useState<RefineSearchOutput | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleApplyFilters = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newParams = new URLSearchParams();

    if (query) newParams.set("q", query);
    if (jobType !== 'all') newParams.set("jobType", jobType);
    if (location !== 'all') newParams.set("location", location);
    if (salary !== 'all') newParams.set("salary", salary);
    if (date !== 'all') newParams.set("date", date);
    if (status !== 'all') newParams.set("status", status);

    navigate(`${pathname}?${newParams.toString()}`);
  };

  const handleAiRefine = () => {
    if (!query) {
      toast({ variant: "destructive", title: "Please enter a search query first." });
      return;
    }
    setAiError(null);
    setAiResult(null);

    startTransition(async () => {
      // Stub for migration
      const result: any = { error: "AI Service not connected yet" }; // await getAiRefinement(query);
      if ("error" in result) {
        setAiError(result.error);
        toast({ variant: "destructive", title: "AI Refinement Failed", description: result.error });
      } else {
        setAiResult(result);
      }
    });
  };

  const applyAiRefinement = () => {
    if (aiResult?.refinedKeywords) {
      setQuery(aiResult.refinedKeywords);
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("q", aiResult.refinedKeywords);
      navigate(`${pathname}?${newParams.toString()}`);
      setAiResult(null);
    }
  };

  return (
    <div className="p-6 mb-8 bg-white dark:bg-card border-3 border-black dark:border-white shadow-neobrutal dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-none">
      <form onSubmit={handleApplyFilters} className="space-y-6">
        <div className="flex flex-col md:flex-row items-stretch gap-3">
          <div className="relative w-full flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/50 dark:text-white/50" />
            <Input
              name="q"
              type="text"
              placeholder="Search by title, skill, or company..."
              className="pl-11 h-14 text-lg w-full border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400 font-medium bg-white dark:bg-card dark:text-white"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex w-full md:w-auto items-stretch gap-3">
            <Popover onOpenChange={(open) => !open && setAiResult(null)}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-14 w-14 flex-shrink-0 p-0 border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-none transition-all bg-accent text-white hover:bg-accent/90"
                  onClick={handleAiRefine}
                  disabled={isPending}
                  type="button"
                  aria-label="Refine search with AI"
                >
                  {isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 border-3 border-black dark:border-white rounded-none shadow-neobrutal dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] mr-4 bg-white dark:bg-card dark:text-white">
                <div className="grid gap-4">
                  <div className="space-y-2 border-b-2 border-black dark:border-white pb-2">
                    <h4 className="font-headline font-black uppercase tracking-tight">AI Search Refinement</h4>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Let AI enhance your query for better results.</p>
                  </div>
                  {aiResult && (
                    <div className="text-sm space-y-3">
                      <div className="bg-secondary/20 p-3 border-2 border-black dark:border-white dark:bg-secondary/10">
                        <p className="font-bold mb-1">Suggestion:</p>
                        <p className="text-lg">{aiResult.refinedKeywords}</p>
                      </div>
                      <p className="text-muted-foreground dark:text-gray-400 text-xs"><strong>Reasoning:</strong> {aiResult.reasoning}</p>
                      <Button size="sm" className="w-full h-10 border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[1px] hover:shadow-none font-bold bg-primary text-white" onClick={applyAiRefinement}>Apply Suggestion</Button>
                    </div>
                  )}
                  {aiError && <p className="text-sm text-white bg-destructive p-2 border-2 border-black dark:border-white font-bold">{aiError}</p>}
                </div>
              </PopoverContent>
            </Popover>
            <Button type="submit" className="h-14 px-8 w-full flex-grow md:w-auto border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-none transition-all bg-primary text-white font-headline font-bold uppercase tracking-wide text-lg">
              <SlidersHorizontal className="mr-2 h-5 w-5" />
              Filter
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Select name="jobType" value={jobType} onValueChange={setJobType}>
            <SelectTrigger className="h-12 border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] focus:ring-0 focus:ring-offset-0 bg-white dark:bg-card dark:text-white font-medium ring-offset-0 focus:ring-offset-0"><SelectValue placeholder="Job Type" /></SelectTrigger>
            <SelectContent className="border-2 border-black dark:border-white rounded-none shadow-neobrutal dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-card dark:text-white">
              <SelectItem value="all">All Job Types</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
            </SelectContent>
          </Select>
          <Select name="location" value={location} onValueChange={setLocation}>
            <SelectTrigger className="h-12 border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] focus:ring-0 focus:ring-offset-0 bg-white dark:bg-card dark:text-white font-medium"><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent className="border-2 border-black dark:border-white rounded-none shadow-neobrutal dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-card dark:text-white">
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
              <SelectItem value="New York, NY">New York, NY</SelectItem>
              <SelectItem value="Austin, TX (Remote)">Austin, TX (Remote)</SelectItem>
              <SelectItem value="Seattle, WA">Seattle, WA</SelectItem>
            </SelectContent>
          </Select>
          <Select name="salary" value={salary} onValueChange={setSalary}>
            <SelectTrigger className="h-12 border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] focus:ring-0 focus:ring-offset-0 bg-white dark:bg-card dark:text-white font-medium"><SelectValue placeholder="Salary Range" /></SelectTrigger>
            <SelectContent className="border-2 border-black dark:border-white rounded-none shadow-neobrutal dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-card dark:text-white">
              <SelectItem value="all">Any Salary</SelectItem>
              <SelectItem value="75k-inf">$75k+</SelectItem>
              <SelectItem value="100k-inf">$100k+</SelectItem>
              <SelectItem value="125k-inf">$125k+</SelectItem>
              <SelectItem value="150k-inf">$150k+</SelectItem>
            </SelectContent>
          </Select>
          <Select name="date" value={date} onValueChange={setDate}>
            <SelectTrigger className="h-12 border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] focus:ring-0 focus:ring-offset-0 bg-white dark:bg-card dark:text-white font-medium"><SelectValue placeholder="Date Posted" /></SelectTrigger>
            <SelectContent className="border-2 border-black dark:border-white rounded-none shadow-neobrutal dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-card dark:text-white">
              <SelectItem value="all">Any Time</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="3d">Last 3 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="14d">Last 14 days</SelectItem>
            </SelectContent>
          </Select>
          <Select name="status" value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-12 border-2 border-black dark:border-white rounded-none shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] focus:ring-0 focus:ring-offset-0 bg-white dark:bg-card dark:text-white font-medium"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="border-2 border-black dark:border-white rounded-none shadow-neobrutal dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-card dark:text-white">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="APPLIED">Applied</SelectItem>
              <SelectItem value="INTERVIEW">Interview</SelectItem>
              <SelectItem value="OFFER">Offer</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="WAITING">Waiting</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
    </div>
  );
}
