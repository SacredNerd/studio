"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
import { getAiRefinement } from "@/app/actions";
import type { RefineSearchOutput } from "@/ai/flows/ai-search-refinement";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
    
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleAiRefine = () => {
    if (!query) {
      toast({ variant: "destructive", title: "Please enter a search query first." });
      return;
    }
    setAiError(null);
    setAiResult(null);

    startTransition(async () => {
      const result = await getAiRefinement(query);
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
      router.push(`${pathname}?${newParams.toString()}`);
      setAiResult(null);
    }
  };

  return (
    <div className="p-4 mb-8 bg-card rounded-none border-2 neobrutal-shadow">
      <form onSubmit={handleApplyFilters} className="space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <div className="relative w-full flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              name="q"
              type="text"
              placeholder="Search by title, skill, or company..."
              className="pl-10 h-12 text-base w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex w-full md:w-auto items-center gap-2">
            <Popover onOpenChange={(open) => !open && setAiResult(null)}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 w-12 flex-shrink-0 p-0"
                  onClick={handleAiRefine}
                  disabled={isPending}
                  type="button"
                  aria-label="Refine search with AI"
                >
                  {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                  <div className="grid gap-4">
                      <div className="space-y-2">
                          <h4 className="font-medium leading-none font-headline">AI Search Refinement</h4>
                          <p className="text-sm text-muted-foreground">Let AI enhance your query for better results.</p>
                      </div>
                      {aiResult && (
                          <div className="text-sm space-y-2">
                              <p><strong>Suggestion:</strong> {aiResult.refinedKeywords}</p>
                              <p className="text-muted-foreground"><strong>Reasoning:</strong> {aiResult.reasoning}</p>
                              <Button size="sm" className="w-full" onClick={applyAiRefinement}>Apply Suggestion</Button>
                          </div>
                      )}
                      {aiError && <p className="text-sm text-destructive">{aiError}</p>}
                  </div>
              </PopoverContent>
            </Popover>
            <Button type="submit" className="h-12 w-full flex-grow md:w-auto">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Select name="jobType" value={jobType} onValueChange={setJobType}>
            <SelectTrigger><SelectValue placeholder="Job Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Job Types</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
            </SelectContent>
          </Select>
          <Select name="location" value={location} onValueChange={setLocation}>
            <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
              <SelectItem value="New York, NY">New York, NY</SelectItem>
              <SelectItem value="Austin, TX (Remote)">Austin, TX (Remote)</SelectItem>
              <SelectItem value="Seattle, WA">Seattle, WA</SelectItem>
            </SelectContent>
          </Select>
          <Select name="salary" value={salary} onValueChange={setSalary}>
            <SelectTrigger><SelectValue placeholder="Salary Range" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Salary</SelectItem>
              <SelectItem value="75k-inf">$75k+</SelectItem>
              <SelectItem value="100k-inf">$100k+</SelectItem>
              <SelectItem value="125k-inf">$125k+</SelectItem>
              <SelectItem value="150k-inf">$150k+</SelectItem>
            </SelectContent>
          </Select>
          <Select name="date" value={date} onValueChange={setDate}>
            <SelectTrigger><SelectValue placeholder="Date Posted" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Time</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="3d">Last 3 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="14d">Last 14 days</SelectItem>
            </SelectContent>
          </Select>
          <Select name="status" value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
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
