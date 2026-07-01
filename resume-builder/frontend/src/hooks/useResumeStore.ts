/**
 * Resume store backed by the FastAPI backend.
 *
 * Returns the SAME shape as the old localStorage-backed hook so App.tsx and
 * DashboardView.tsx do not need to change:
 *   { resumes, createResume, updateResume, renameResume, deleteResume,
 *     duplicateResume, getResume }
 *
 * Differences from the original semantics:
 *   - `createResume` and `duplicateResume` return a string id synchronously
 *     by issuing the API call in the background and using a temporary
 *     placeholder id until the real one arrives. This preserves the
 *     synchronous signature App.tsx already relies on, since the editor
 *     calls `setActiveId(store.createResume())` right after.
 *   - `updateResume(id, fn)` is debounced (300 ms) — instant local state
 *     update for snappy preview, with a deferred PUT to the backend.
 */

import { useEffect, useRef, useState } from 'react'
import { sampleResume, type ResumeData } from '../data'
import * as api from '../api/client'

export type ResumeEntry = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  data: ResumeData
}

const SAVE_DEBOUNCE_MS = 300

/** Deep-clone sampleResume with blank identity fields. */
function createBlankResume(): ResumeData {
  const clone: ResumeData = JSON.parse(JSON.stringify(sampleResume))
  clone.headerFooter.documentTitle = 'Untitled'
  clone.personalDetails.fullName = ''
  return clone
}

export function useResumeStore() {
  const [resumes, setResumes] = useState<ResumeEntry[]>([])
  const [, setLoaded] = useState(false)

  // Per-resume debounced PUT timers
  const saveTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Initial load — pull summaries, then hydrate each resume.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const summaries = await api.listResumes()
        const entries = await Promise.all(summaries.map((s) => api.getResume(s.id)))
        if (!cancelled) {
          setResumes(entries)
          setLoaded(true)
        }
      } catch (err) {
        console.error('Failed to load resumes from backend:', err)
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function scheduleSave(id: string, data: ResumeData) {
    const t = saveTimers.current.get(id)
    if (t) clearTimeout(t)
    const newT = setTimeout(() => {
      api.updateResume(id, { data }).catch((e) => console.error('Save failed:', e))
      saveTimers.current.delete(id)
    }, SAVE_DEBOUNCE_MS)
    saveTimers.current.set(id, newT)
  }

  function createResume(): string {
    // Synchronously assign a temporary id and patch it once the real id
    // arrives. App.tsx calls setActiveId(createResume()) so we must hand back
    // a string immediately.
    const tempId = `tmp_${Math.random().toString(36).slice(2, 10)}`
    const now = new Date().toISOString()
    const entry: ResumeEntry = {
      id: tempId,
      name: 'Untitled',
      createdAt: now,
      updatedAt: now,
      data: createBlankResume(),
    }
    setResumes((prev) => [...prev, entry])
    ;(async () => {
      try {
        const created = await api.createResume({ name: entry.name, data: entry.data })
        setResumes((prev) => prev.map((r) => (r.id === tempId ? created : r)))
      } catch (err) {
        console.error('createResume failed; rolling back:', err)
        setResumes((prev) => prev.filter((r) => r.id !== tempId))
      }
    })()
    return tempId
  }

  function updateResume(id: string, fn: (data: ResumeData) => ResumeData): void {
    setResumes((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const nextData = fn(r.data)
        // tmp_ ids haven't reached the server yet; skip scheduling save until
        // the create resolves and the id gets replaced.
        if (!id.startsWith('tmp_')) scheduleSave(id, nextData)
        return { ...r, data: nextData, updatedAt: new Date().toISOString() }
      }),
    )
  }

  function renameResume(id: string, name: string): void {
    setResumes((prev) => prev.map((r) => (r.id === id ? { ...r, name } : r)))
    if (!id.startsWith('tmp_')) {
      api.updateResume(id, { name }).catch((e) => console.error('rename failed:', e))
    }
  }

  function deleteResume(id: string): void {
    setResumes((prev) => prev.filter((r) => r.id !== id))
    if (!id.startsWith('tmp_')) {
      api.deleteResume(id).catch((e) => console.error('delete failed:', e))
    }
  }

  function duplicateResume(id: string): string {
    if (id.startsWith('tmp_')) {
      // Server doesn't know about it yet; fall back to local clone via create.
      const source = resumes.find((r) => r.id === id)
      if (!source) return ''
      const tempId = `tmp_${Math.random().toString(36).slice(2, 10)}`
      const now = new Date().toISOString()
      const entry: ResumeEntry = {
        id: tempId,
        name: `${source.name} (Copy)`,
        createdAt: now,
        updatedAt: now,
        data: JSON.parse(JSON.stringify(source.data)),
      }
      setResumes((prev) => [...prev, entry])
      ;(async () => {
        try {
          const created = await api.createResume({ name: entry.name, data: entry.data })
          setResumes((prev) => prev.map((r) => (r.id === tempId ? created : r)))
        } catch (err) {
          console.error('duplicate failed; rolling back:', err)
          setResumes((prev) => prev.filter((r) => r.id !== tempId))
        }
      })()
      return tempId
    }

    const tempId = `tmp_${Math.random().toString(36).slice(2, 10)}`
    const source = resumes.find((r) => r.id === id)
    if (source) {
      const now = new Date().toISOString()
      setResumes((prev) => [
        ...prev,
        {
          id: tempId,
          name: `${source.name} (Copy)`,
          createdAt: now,
          updatedAt: now,
          data: JSON.parse(JSON.stringify(source.data)),
        },
      ])
    }
    ;(async () => {
      try {
        const created = await api.duplicateResume(id)
        setResumes((prev) => prev.map((r) => (r.id === tempId ? created : r)))
      } catch (err) {
        console.error('duplicate failed; rolling back:', err)
        setResumes((prev) => prev.filter((r) => r.id !== tempId))
      }
    })()
    return tempId
  }

  function getResume(id: string): ResumeEntry | undefined {
    return resumes.find((r) => r.id === id)
  }

  return {
    resumes,
    createResume,
    updateResume,
    renameResume,
    deleteResume,
    duplicateResume,
    getResume,
  }
}
