"use client";

import { useState } from "react";
import type { Job } from "@/lib/types";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { JobDetailsModal } from "@/components/job-details-modal";

interface JobListWrapperProps {
  jobs: Job[];
}

export function JobListWrapper({ jobs }: JobListWrapperProps) {
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { toast } = useToast();

  const handleToggleSelection = (id: string) => {
    setSelectedJobIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBulkApply = () => {
    if (selectedJobIds.size === 0) return;
    toast({
      title: "Bulk Apply Submitted!",
      description: `Successfully applied to ${selectedJobIds.size} job(s).`,
    });
    setSelectedJobIds(new Set());
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Showing {jobs.length} results</p>
          <Button onClick={handleBulkApply} disabled={selectedJobIds.size === 0}>
            Bulk Apply ({selectedJobIds.size})
          </Button>
        </div>
        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJobIds.has(job.id)}
                onToggleSelection={handleToggleSelection}
                onViewDetails={() => handleViewDetails(job)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card rounded-none border-2 border-dashed">
            <h3 className="text-xl font-semibold font-headline text-foreground">No jobs found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search filters or check back later.</p>
          </div>
        )}
      </div>
      {selectedJob && <JobDetailsModal job={selectedJob} onClose={handleCloseModal} />}
    </>
  );
}
