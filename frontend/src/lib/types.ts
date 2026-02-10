export type JobStatus =
  | 'new'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'PARTIALLY_CLEARED'
  | 'WAITING'
  | 'OFFER'
  | 'REJECTED';

export type Job = {
  id: string;
  title: string;
  companyName: string;
  location: string;
  postedDate: string;
  salary: string;
  skills: string[];
  profileMatchScore: number;
  description: string;
  status: JobStatus;
};

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
}
