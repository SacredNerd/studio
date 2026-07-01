/**
 * Typed client for the FastAPI backend at /api.
 *
 * Wraps fetch(); throws on non-2xx. JSON request/response shape matches the
 * Pydantic models in backend/app/models/resume.py and the TS types in
 * src/data.ts.
 */

import type { ResumeData } from '../data'

export type ResumeEntry = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  data: ResumeData
}

export type ResumeSummary = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    throw new ApiError(res.status, `${res.status} ${res.statusText} on ${path}`)
  }
  if (res.status === 204) return undefined as unknown as T
  const ct = res.headers.get('Content-Type') || ''
  if (ct.includes('application/json')) return (await res.json()) as T
  return (await res.blob()) as unknown as T
}

export async function listResumes(): Promise<ResumeSummary[]> {
  return request('/resumes')
}

export async function getResume(id: string): Promise<ResumeEntry> {
  return request(`/resumes/${encodeURIComponent(id)}`)
}

export async function createResume(payload?: { name?: string; data?: ResumeData }): Promise<ResumeEntry> {
  return request('/resumes', {
    method: 'POST',
    body: JSON.stringify(payload ?? {}),
  })
}

export async function updateResume(id: string, payload: { name?: string; data?: ResumeData }): Promise<ResumeEntry> {
  return request(`/resumes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteResume(id: string): Promise<void> {
  await request<void>(`/resumes/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function duplicateResume(id: string): Promise<ResumeEntry> {
  return request(`/resumes/${encodeURIComponent(id)}/duplicate`, { method: 'POST' })
}

/** Stateless PDF render — POSTs a ResumeData and returns the PDF blob. */
export async function exportPdf(data: ResumeData): Promise<Blob> {
  const res = await fetch('/api/resumes/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new ApiError(res.status, `PDF render failed: ${res.status}`)
  return await res.blob()
}
