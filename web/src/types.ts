export type JobStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED';

export type AppStatus =
  | 'DRAFT'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OA'
  | 'OFFER'
  | 'REJECTED';

export interface Job {
  id: string;
  userId: string;
  title: string;
  company: string;
  url: string;
  source?: string | null;
  location?: string | null;
  salary?: string | null;
  tags: string[];
  faviconUrl?: string | null;
  notes?: string | null;
  deadline?: string | null;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  resumeId?: string | null;
  coverNote?: string | null;
  status: AppStatus;
  appliedAt?: string | null;
  nextAction?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  job: Job;
}

export interface Resume {
  id: string;
  userId: string;
  name: string;
  fileUrl: string;
  createdAt: string;
  applications?: Application[];
}

export interface Template {
  id: string;
  userId: string;
  name: string;
  body: string;
  createdAt: string;
}
