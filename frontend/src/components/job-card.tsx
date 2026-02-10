"use client";

import type { Job } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MapPin,
  CalendarDays,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CircleDotDashed,
  Building2,
} from "lucide-react";
import { JobStatusRibbon } from "./job-status-ribbon";

interface JobCardProps {
  job: Job;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onViewDetails: () => void;
}

export function JobCard({ job, isSelected, onToggleSelection, onViewDetails }: JobCardProps) {

  const getMatchScoreIcon = () => {
    if (job.profileMatchScore >= 90) {
      return <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0" />;
    }
    if (job.profileMatchScore >= 75) {
      return <CircleDotDashed className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-500 flex-shrink-0" />;
  };

  const getMatchScoreColor = () => {
    if (job.profileMatchScore >= 90) return "text-green-500";
    if (job.profileMatchScore >= 75) return "text-yellow-500";
    return "text-red-500";
  };


  return (
    <div className="relative h-full group">
      <JobStatusRibbon />
      <Card className="flex flex-col h-full border-3 border-black dark:border-white rounded-none shadow-neobrutal dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neobrutal-sm dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all duration-200 bg-white dark:bg-card">
        <CardHeader className="flex-row items-start gap-4 space-y-0 pb-4 border-b-3 border-black dark:border-white bg-secondary/20 pt-6 px-5 relative mt-3">
          <div className="flex items-center justify-center h-14 w-14 rounded-none border-2 border-black dark:border-white bg-white dark:bg-accent shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] flex-shrink-0 mt-1">
            <Building2 className="h-7 w-7 text-black dark:text-white" />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <CardTitle className="text-lg font-headline font-black uppercase tracking-tight py-1 leading-tight line-clamp-2 mb-1 dark:text-white">{job.title}</CardTitle>
            <CardDescription className="text-sm font-bold text-black/70 dark:text-white/80 truncate">{job.companyName}</CardDescription>
          </div>
          <Checkbox
            aria-label={`Select job: ${job.title}`}
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(job.id)}
            className="mt-1 h-6 w-6 border-2 border-black dark:border-white rounded-none data-[state=checked]:bg-primary data-[state=checked]:text-white shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] dark:data-[state=checked]:border-white"
          />
        </CardHeader>
        <CardContent className="flex-grow space-y-6 pt-6">
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm font-medium text-black/80 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0 text-primary dark:text-primary-foreground" />
              <span className="truncate" title={job.location}>{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
              <span className="truncate" title={job.salary}>{job.salary}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span className="truncate">{job.postedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              {getMatchScoreIcon()}
              <span className={`font-bold ${getMatchScoreColor()}`}>{job.profileMatchScore}% Match</span>
            </div>
          </div>

          <div className="border-t-3 border-black dark:border-white pt-4">
            <h4 className="text-xs font-black uppercase tracking-wider mb-3 text-black/50 dark:text-gray-400">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {job.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="secondary" className="border-2 border-black dark:border-white rounded-none bg-accent text-white px-2 py-0.5 text-xs shadow-neobrutal-sm dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[1px] hover:shadow-none transition-all">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 4 && (
                <Badge variant="outline" className="border-2 border-black dark:border-white rounded-none px-2 py-0.5 text-xs font-bold bg-white dark:bg-card dark:text-white">
                  +{job.skills.length - 4}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-2 pt-0 pb-6 px-6">
          <Button
            className="w-full h-11 border-2 border-black dark:border-white shadow-neobrutal dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[2px] hover:shadow-none transition-all rounded-none font-bold text-md bg-white dark:bg-card text-black dark:text-white hover:bg-slate-100 dark:hover:bg-gray-800 uppercase tracking-wide"
            onClick={onViewDetails}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
