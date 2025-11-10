"use client";

import type { Job } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  CalendarDays,
  DollarSign,
  Building2,
} from "lucide-react";

interface JobDetailsModalProps {
  job: Job;
  onClose: () => void;
}

export function JobDetailsModal({ job, onClose }: JobDetailsModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full h-full max-w-full max-h-full flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-none border-2 bg-muted flex-shrink-0">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-headline">{job.title}</DialogTitle>
              <DialogDescription className="text-lg">{job.companyName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto px-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-md text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 flex-shrink-0" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 flex-shrink-0" />
              <span>{job.salary}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 flex-shrink-0" />
              <span>{job.postedDate}</span>
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-3 font-headline">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-sm px-3 py-1">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-3 font-headline">Job Description</h3>
            <p className="text-base leading-relaxed text-foreground/80">
              {job.description}
            </p>
          </div>
        </div>
        <DialogFooter className="p-6 border-t-2 bg-background sticky bottom-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button>Apply Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
