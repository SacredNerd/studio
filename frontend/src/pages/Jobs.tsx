import { useSearchParams } from 'react-router-dom';
import { FilterBar } from "@/components/filter-bar";
import { JobListWrapper } from "@/components/job-list-wrapper";
import { jobs as allJobs } from "@/lib/data";

export default function JobsPage() {
    const [searchParams] = useSearchParams();

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

    return (
        <div className="container mx-auto py-8 space-y-8 min-h-screen">
            <div className="space-y-4">
                <h1 className="text-4xl font-headline font-black uppercase tracking-tight dark:text-white">
                    Job Discovery
                </h1>
                <p className="text-xl text-muted-foreground font-medium dark:text-gray-400">
                    Find and apply to the best opportunities matching your profile.
                </p>
            </div>
            <FilterBar />
            <JobListWrapper jobs={filteredJobs} />
        </div>
    );
}
