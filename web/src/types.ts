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
  isRemote?: boolean;
  locationCity?: string | null;
  locationState?: string | null;
  locationCountry?: string | null;
  postedAt?: string | null;
  salaryCurrency?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryType?: string;
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
  jobTitle?: string; // For calendar compatibility
  company?: string; // For calendar compatibility
}

export interface CompanyResearch {
  id: string;
  userId: string;
  companyName: string;
  insights: string;
  rating?: number | null;
  pros: string[];
  cons: string[];
  createdAt: string;
  updatedAt: string;
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
  date: string; // For calendar compatibility
  time?: string | null; // For calendar compatibility
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

export interface CalendarEvent {
  id: string;
  type: 'interview' | 'deadline' | 'follow-up';
  title: string;
  date: Date;
  time?: string | null;
  company: string;
  status?: string;
  data: Interview | Job | Application;
  alerts: {
    hasDeadline: boolean;
    hasFollowUp: boolean;
    hasInterview: boolean;
    isOverdue: boolean;
    priority: number;
  };
}

export const SalaryType = {
  HOURLY: 'HOURLY',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  ANNUAL: 'ANNUAL',
  PROJECT_BASED: 'PROJECT_BASED',
} as const;

export type SalaryType = (typeof SalaryType)[keyof typeof SalaryType];

export const OfferStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  NEGOTIATING: 'NEGOTIATING',
  EXPIRED: 'EXPIRED',
} as const;

export type OfferStatus = (typeof OfferStatus)[keyof typeof OfferStatus];

export interface SalaryOffer {
  id: string;
  userId: string;
  jobId: string;
  applicationId?: string;
  amount: number; // in cents
  currency: string;
  type: SalaryType;
  status: OfferStatus;
  offeredAt: string;
  expiresAt?: string;
  notes?: string;
  benefits: string[];
  createdAt: string;
  updatedAt: string;
  job: {
    title: string;
    company: string;
    location?: string;
  };
}

export interface SalaryHistory {
  id: string;
  userId: string;
  jobId: string;
  amount: number; // in cents
  currency: string;
  type: SalaryType;
  effectiveDate: string;
  changeType: string;
  notes?: string;
  createdAt: string;
  job: {
    title: string;
    company: string;
  };
}

export interface SalaryAnalytics {
  totalJobsWithSalary: number;
  totalOffers: number;
  pendingOffers: number;
  acceptedOffers: number;
  averageSalary: number;
  salaryRange: {
    min: number;
    max: number;
  };
  byLocation: Record<string, {count: number; avgSalary: number}>;
  byCompany: Record<string, {count: number; avgSalary: number}>;
}
