export type JobStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED';

export interface Job {
  id: string;
  userId: string;
  title: string;
  company: string;
  url: string;
  source?: string | null;
  faviconUrl?: string | null;
  notes?: string | null;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  tags: string[];
}
