import { FilterBar } from "@/components/filter-bar";
import { JobListWrapper } from "@/components/job-list-wrapper";
import { jobs as allJobs } from "@/lib/data";

interface PageProps {
  searchParams: {
    q?: string;
    jobType?: string;
    location?: string;
    salary?: string;
    date?: string;
    status?: string;
  };
}

export default function Home({ searchParams }: PageProps) {
  
  const filteredJobs = allJobs.filter(job => {
    const query = searchParams.q?.toLowerCase() || '';
    const jobType = searchParams.jobType;
    const location = searchParams.location;
    const status = searchParams.status;

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

  return (
    <>
      <FilterBar />
      <JobListWrapper jobs={filteredJobs} />
    </>
  );
}
