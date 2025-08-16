const API = import.meta.env.VITE_API_URL as string;

const headers = {
  'Content-Type': 'application/json',
  'x-user-id': 'dev-user-1', // dev-only auth
};

export async function createApplication(payload: {
  jobId: string;
  status?: string;
  appliedAt?: Date;
  resumeId?: string;
  coverNote?: string;
  nextAction?: Date;
  notes?: string;
}) {
  const r = await fetch(`${API}/applications`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('Failed to create application');
  return r.json();
}

export async function updateApplication(
  id: string,
  patch: Partial<Application>,
) {
  const r = await fetch(`${API}/applications/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error('Failed to update application');
  return r.json();
}

export async function listJobs(): Promise<Job[]> {
  const r = await fetch(`${API}/jobs`, {headers});
  if (!r.ok) throw new Error('Failed to list jobs');
  return r.json();
}

export async function listApplications(): Promise<Application[]> {
  const r = await fetch(`${API}/applications`, {headers});
  if (!r.ok) throw new Error('Failed to list applications');
  return r.json();
}

export async function listResumes(): Promise<Resume[]> {
  const r = await fetch(`${API}/resumes`, {headers});
  if (!r.ok) throw new Error('Failed to list resumes');
  return r.json();
}

export async function createResume(payload: {name: string; fileUrl: string}) {
  const r = await fetch(`${API}/resumes`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('Failed to create resume');
  return r.json();
}

export async function updateResume(id: string, patch: Partial<Resume>) {
  const r = await fetch(`${API}/resumes/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error('Failed to update resume');
  return r.json();
}

export async function deleteResume(id: string) {
  const r = await fetch(`${API}/resumes/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!r.ok) throw new Error('Failed to delete resume');
}

// Company Research API functions
export async function getCompanyResearch(companyName?: string) {
  if (companyName) {
    const r = await fetch(
      `${API}/company-research/${encodeURIComponent(companyName)}`,
      {
        headers,
      },
    );
    if (!r.ok) {
      if (r.status === 404) return null;
      throw new Error('Failed to fetch company research');
    }
    return r.json();
  } else {
    const r = await fetch(`${API}/company-research`, {
      headers,
    });
    if (!r.ok) throw new Error('Failed to fetch company research');
    return r.json();
  }
}

export async function upsertCompanyResearch(data: {
  companyName: string;
  website?: string;
  domain?: string;
  insights?: string;
  rating?: number;
  pros?: string[];
  cons?: string[];
}) {
  const r = await fetch(`${API}/company-research`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('Failed to save company research');
  return r.json();
}

export async function deleteCompanyResearch(companyName: string) {
  const r = await fetch(
    `${API}/company-research/${encodeURIComponent(companyName)}`,
    {
      method: 'DELETE',
      headers,
    },
  );
  if (!r.ok) throw new Error('Failed to delete company research');
}

export async function createJob(payload: Partial<Job>) {
  const r = await fetch(`${API}/jobs`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('Failed to create job');
  return r.json();
}
export async function updateJob(id: string, patch: Partial<Job>) {
  const r = await fetch(`${API}/jobs/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error('Failed to update job');
  return r.json();
}
export async function parseUrl(url: string) {
  const r = await fetch(`${API}/jobs/parse-url`, {
    method: 'POST',
    headers,
    body: JSON.stringify({url}),
  });
  if (!r.ok) throw new Error('Failed to parse URL');
  return r.json() as Promise<{
    title: string;
    company: string;
    source: string;
    faviconUrl?: string;
    domain?: string | null;
    isJobPlatform: boolean;
  }>;
}

export async function getApplicationsDueToday(): Promise<Application[]> {
  const r = await fetch(`${API}/applications?due=today`, {headers});
  if (!r.ok) throw new Error('Failed to get applications due today');
  return r.json();
}

export async function exportJobsCSV(): Promise<Blob> {
  const r = await fetch(`${API}/jobs/export`, {headers});
  if (!r.ok) throw new Error('Failed to export jobs');
  return r.blob();
}

export async function listTemplates(): Promise<Template[]> {
  const r = await fetch(`${API}/templates`, {headers});
  if (!r.ok) throw new Error('Failed to list templates');
  return r.json();
}

export async function createTemplate(payload: {name: string; body: string}) {
  const r = await fetch(`${API}/templates`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw Error('Failed to create template');
  return r.json();
}

export async function updateTemplate(id: string, patch: Partial<Template>) {
  const r = await fetch(`${API}/templates/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error('Failed to update template');
  return r.json();
}

export async function deleteTemplate(id: string) {
  const r = await fetch(`${API}/templates/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!r.ok) throw new Error('Failed to delete template');
}

export async function listInterviews(): Promise<Interview[]> {
  const r = await fetch(`${API}/interviews`, {headers});
  if (!r.ok) throw new Error('Failed to list interviews');
  return r.json();
}

export async function getJobInterviews(jobId: string): Promise<Interview[]> {
  const r = await fetch(`${API}/interviews/job/${jobId}`, {headers});
  if (!r.ok) throw new Error('Failed to get job interviews');
  return r.json();
}

export async function createInterview(payload: {
  jobId: string;
  applicationId?: string;
  title: string;
  type: string;
  scheduledAt: string;
  duration: number;
  location?: string;
  participants?: string;
  notes?: string;
  reminderAt?: string;
}): Promise<Interview> {
  const r = await fetch(`${API}/interviews`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('Failed to create interview');
  return r.json();
}

export async function updateInterview(
  id: string,
  patch: Partial<Interview>,
): Promise<Interview> {
  const r = await fetch(`${API}/interviews/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error('Failed to update interview');
  return r.json();
}

export async function deleteInterview(id: string) {
  const r = await fetch(`${API}/interviews/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!r.ok) throw new Error('Failed to delete interview');
}

// Salary Analytics API functions
export async function getSalaryAnalytics(): Promise<{
  analytics: SalaryAnalytics;
  jobs: Array<{
    id: string;
    title: string;
    company: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency: string;
    salaryType: string;
    status: string;
    createdAt: string;
  }>;
  offers: SalaryOffer[];
  salaryHistory: SalaryHistory[];
}> {
  const r = await fetch(`${API}/salary/analytics`, {headers});
  if (!r.ok) throw new Error('Failed to fetch salary analytics');
  return r.json();
}

export async function createSalaryOffer(payload: {
  jobId: string;
  applicationId?: string;
  amount: number;
  currency?: string;
  type?: string;
  status?: string;
  expiresAt?: string;
  notes?: string;
  benefits?: string[];
}): Promise<SalaryOffer> {
  const r = await fetch(`${API}/salary/offers`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('Failed to create salary offer');
  return r.json();
}

export async function updateSalaryOffer(
  id: string,
  patch: Partial<SalaryOffer>,
): Promise<SalaryOffer> {
  const r = await fetch(`${API}/salary/offers/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error('Failed to update salary offer');
  return r.json();
}

export async function createSalaryHistory(payload: {
  jobId: string;
  amount: number;
  currency?: string;
  type?: string;
  effectiveDate?: string;
  changeType?: string;
  notes?: string;
}): Promise<SalaryHistory> {
  const r = await fetch(`${API}/salary/history`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('Failed to create salary history');
  return r.json();
}

// Follow-up API functions
export async function createFollowUp(payload: {
  applicationId: string;
  scheduledDate: Date;
  type: string;
  templateId?: string;
  message?: string;
  notes?: string;
}) {
  const r = await fetch(`${API}/follow-ups`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('Failed to create follow-up');
  return r.json();
}

export async function listFollowUps(params?: {
  status?: string;
  applicationId?: string;
  due?: string;
}): Promise<FollowUp[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.applicationId)
    searchParams.append('applicationId', params.applicationId);
  if (params?.due) searchParams.append('due', params.due);

  const url = `${API}/follow-ups${
    searchParams.toString() ? `?${searchParams.toString()}` : ''
  }`;
  const r = await fetch(url, {headers});
  if (!r.ok) throw new Error('Failed to list follow-ups');
  return r.json();
}

export async function getFollowUp(id: string): Promise<FollowUp> {
  const r = await fetch(`${API}/follow-ups/${id}`, {headers});
  if (!r.ok) throw new Error('Failed to fetch follow-up');
  return r.json();
}

export async function updateFollowUp(
  id: string,
  patch: Partial<FollowUp>,
): Promise<FollowUp> {
  const r = await fetch(`${API}/follow-ups/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error('Failed to update follow-up');
  return r.json();
}

export async function completeFollowUp(
  id: string,
  notes?: string,
): Promise<FollowUp> {
  const r = await fetch(`${API}/follow-ups/${id}/complete`, {
    method: 'POST',
    headers,
    body: JSON.stringify({notes}),
  });
  if (!r.ok) throw new Error('Failed to complete follow-up');
  return r.json();
}

export async function deleteFollowUp(id: string) {
  const r = await fetch(`${API}/follow-ups/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!r.ok) throw new Error('Failed to delete follow-up');
}

export async function listFollowUpTemplates(params?: {
  type?: string;
  isDefault?: boolean;
}): Promise<FollowUpTemplate[]> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append('type', params.type);
  if (params?.isDefault !== undefined)
    searchParams.append('isDefault', params.isDefault.toString());

  const url = `${API}/follow-up-templates${
    searchParams.toString() ? `?${searchParams.toString()}` : ''
  }`;
  const r = await fetch(url, {headers});
  if (!r.ok) throw new Error('Failed to list follow-up templates');
  return r.json();
}

// types import
import type {
  Job,
  Application,
  Resume,
  Template,
  Interview,
  SalaryOffer,
  SalaryHistory,
  SalaryAnalytics,
  FollowUp,
  FollowUpTemplate,
} from './types';
