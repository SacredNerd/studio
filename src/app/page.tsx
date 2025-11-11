"use client";
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterBar } from "@/components/filter-bar";
import { JobListWrapper } from "@/components/job-list-wrapper";
import { jobs as allJobs } from "@/lib/data";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // This is a placeholder for a real check
  const isSetupComplete = typeof window !== 'undefined' && localStorage.getItem('job.hunt-setup-complete');

  useEffect(() => {
    if (!isSetupComplete) {
      router.replace('/setup');
    }
  }, [isSetupComplete, router]);

  const filteredJobs = allJobs.filter(job => {
    const query = searchParams.get('q')?.toLowerCase() || '';
    const jobType = searchParams.get('jobType');
    const location = searchParams.get('location');
    const status = searchParams.get('status');

    const matchesQuery = query ? 
      job.title.toLowerCase().includes(query) || 
      job.companyName.toLowerCase().includes(query) ||
      job.skills.some(skill => skill.toLowerCase().includes(query))
      : true;

    const matchesJobType = jobType && jobType !== 'all'
      ? (jobType === 'Remote' ? job.location.toLowerCase().includes('remote') : job.title.toLowerCase().includes(jobType.toLowerCase()) || jobType === "Contract" || jobType === "Part-time" || jobType === "Full-time")
      : true;
      
    const matchesLocation = location && location !== 'all' ? job.location === location : true;

    const matchesStatus = status && status !== 'all' ? job.status === status : true;

    return matchesQuery && matchesJobType && matchesLocation && matchesStatus;
  });

  if (!isSetupComplete) {
    // You can return a loader here while the redirect happens
    return (
        <div className="flex items-center justify-center h-screen">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <>
      <FilterBar />
      <JobListWrapper jobs={filteredJobs} />
    </>
  );
}
