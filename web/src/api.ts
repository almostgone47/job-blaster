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

// types import
import type {Job, Application, Resume} from './types';
