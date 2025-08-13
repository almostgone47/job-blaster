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

export type InterviewType =
  | 'PHONE_SCREEN'
  | 'TECHNICAL'
  | 'BEHAVIORAL'
  | 'SYSTEM_DESIGN'
  | 'CODING_CHALLENGE'
  | 'ONSITE'
  | 'FINAL_ROUND'
  | 'OTHER';

export type InterviewStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED';

export interface Interview {
  id: string;
  userId: string;
  jobId: string;
  applicationId?: string | null;
  title: string;
  type: InterviewType;
  scheduledAt: string;
  duration: number;
  location?: string | null;
  participants?: string | null;
  notes?: string | null;
  status: InterviewStatus;
  reminderAt?: string | null;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    company: string;
    status: string;
  };
  application?: {
    id: string;
    status: string;
  } | null;
}
