const API = import.meta.env.VITE_API_URL as string;

const headers = {
  'Content-Type': 'application/json',
  'x-user-id': 'dev-user-1', // dev-only auth
};

export async function createApplication(payload: {
  jobId: string;
  coverNote?: string;
}) {
  const r = await fetch(`${API}/applications`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('Failed to create application');
  return r.json();
}

export async function listJobs(): Promise<Job[]> {
  const r = await fetch(`${API}/jobs`, {headers});
  if (!r.ok) throw new Error('Failed to list jobs');
  return r.json();
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

// types import
import type {Job} from './types';
