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
import { Separator } from "@/components/ui/separator";
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
    <Card className="flex flex-col h-full transition-shadow duration-300 neobrutal-shadow neobrutal-shadow-hover relative overflow-hidden">
      <JobStatusRibbon />
      <CardHeader className="flex-row items-start gap-4 space-y-0 pt-8">
        <div className="flex items-center justify-center h-12 w-12 rounded-none border-2 bg-muted flex-shrink-0">
            <Building2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg font-headline">{job.title}</CardTitle>
          <CardDescription>{job.companyName}</CardDescription>
        </div>
        <Checkbox
          aria-label={`Select job: ${job.title}`}
          checked={isSelected}
          onCheckedChange={() => onToggleSelection(job.id)}
          className="mt-1"
        />
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{job.salary}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{job.postedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            {getMatchScoreIcon()}
            <span className={`font-semibold ${getMatchScoreColor()}`}>{job.profileMatchScore}% Match</span>
          </div>
        </div>
        <Separator />
        <div>
          <h4 className="text-sm font-semibold mb-2 font-headline">Skills</h4>
          <div className="flex flex-wrap gap-1">
            {job.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2">
        <Button variant="outline" className="w-full" onClick={onViewDetails}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
