import type {Job} from '../types';

export function processTemplate(template: string, job: Job): string {
  return template
    .replace(/{jobTitle}/g, job.title || '')
    .replace(/{company}/g, job.company || '')
    .replace(/{skills}/g, job.tags?.join(', ') || '')
    .replace(/{location}/g, job.location || '')
    .replace(/{source}/g, job.source || '');
}

export function getTemplatePreview(template: string): string {
  return template
    .replace(/{jobTitle}/g, '[Job Title]')
    .replace(/{company}/g, '[Company Name]')
    .replace(/{skills}/g, '[Skills]')
    .replace(/{location}/g, '[Location]')
    .replace(/{source}/g, '[Source]');
}
