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
  BarChart,
  Building2,
} from "lucide-react";

interface JobCardProps {
  job: Job;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
}

export function JobCard({ job, isSelected, onToggleSelection }: JobCardProps) {
  return (
    <Card className="flex flex-col h-full transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-muted flex-shrink-0">
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
            <BarChart className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="font-semibold text-foreground">{job.profileMatchScore}% Match</span>
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
      <CardFooter>
        <Button variant="outline" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
