import React, { useRef, useState } from 'react'
import type { ResumeData } from '../data'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResumeEntry = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  data: ResumeData
}

type DashboardViewProps = {
  resumes: ResumeEntry[]
  onOpen: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => string
  onRename: (id: string, name: string) => void
}

// ─── Date helper ──────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  return new Date(iso).toLocaleDateString()
}

// ─── Template badge colour map ────────────────────────────────────────────────

const TEMPLATE_LABEL: Record<string, string> = {
  classic: 'Classic',
  professional: 'Professional',
  specialist: 'Specialist',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardView({
  resumes,
  onOpen,
  onNew,
  onDelete,
  onDuplicate,
  onRename,
}: DashboardViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function startEditing(id: string, currentName: string) {
    setEditingId(id)
    setEditingName(currentName)
    // Defer focus so the input is in the DOM first
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function commitEdit() {
    if (editingId && editingName.trim()) {
      onRename(editingId, editingName.trim())
    }
    setEditingId(null)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditingId(null)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-8 py-4 border-b-2 border-black">
        <div className="flex items-center gap-3">
          {/* Logo box */}
          <div
            className="w-9 h-9 bg-purple-600 border-2 border-black rounded flex items-center justify-center"
          >
            <span className="text-white font-black text-lg leading-none select-none">R</span>
          </div>
          <span className="font-bold text-sm tracking-widest uppercase text-black">
            Resume Builder
          </span>
        </div>

        <button
          onClick={onNew}
          className="bg-purple-600 text-white font-bold text-sm px-5 py-2 rounded border-2 border-black hover:bg-purple-700 transition-colors"
          style={{ boxShadow: '2px 2px 0 #000' }}
        >
          + New Resume
        </button>
      </header>

      {/* ── Main area ───────────────────────────────────────────────────────── */}
      <main className="px-8 py-10 max-w-7xl mx-auto">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-8 text-black">
          My Resumes
        </h1>

        {resumes.length === 0 ? (
          /* ── Empty state ──────────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-gray-400 text-lg mb-6">No resumes yet</p>
            <button
              onClick={onNew}
              className="bg-purple-600 text-white font-bold px-6 py-3 rounded border-2 border-black hover:bg-purple-700 transition-colors"
              style={{ boxShadow: '2px 2px 0 #000' }}
            >
              Create your first resume
            </button>
          </div>
        ) : (
          /* ── Resume grid ──────────────────────────────────────────────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map(resume => (
              <div
                key={resume.id}
                className="bg-white border-2 border-black rounded-[6px] flex flex-col cursor-pointer transition-transform duration-150 hover:-translate-y-1"
                style={{ boxShadow: '2px 2px 0 #000' }}
                onClick={() => onOpen(resume.id)}
              >
                {/* ── Card body ────────────────────────────────────────────── */}
                <div className="flex-1 p-5 pb-3 flex flex-col gap-1.5">
                  {/* Inline-editable name — stop propagation so click doesn't open */}
                  <div onClick={e => e.stopPropagation()}>
                    {editingId === resume.id ? (
                      <input
                        ref={inputRef}
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={handleKeyDown}
                        className="w-full font-bold text-lg border-b-2 border-purple-600 outline-none bg-transparent text-black"
                      />
                    ) : (
                      <h3
                        className="font-bold text-lg leading-snug text-black cursor-text hover:text-purple-700 transition-colors"
                        title="Click to rename"
                        onClick={() => startEditing(resume.id, resume.name)}
                      >
                        {resume.name || 'Untitled Resume'}
                      </h3>
                    )}
                  </div>

                  <p className="text-xs text-gray-400">
                    Updated {timeAgo(resume.updatedAt)}
                  </p>
                </div>

                {/* ── Template badge ───────────────────────────────────────── */}
                <div className="px-5 pb-3">
                  <span className="inline-block bg-yellow-300 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded border border-yellow-400">
                    {TEMPLATE_LABEL[resume.data.customization.selectedTemplate] ??
                      resume.data.customization.selectedTemplate}
                  </span>
                </div>

                {/* ── Action buttons ───────────────────────────────────────── */}
                <div
                  className="flex gap-2 px-4 pb-4"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => onOpen(resume.id)}
                    className="flex-1 bg-purple-600 text-white text-sm font-bold py-1.5 rounded border border-black hover:bg-purple-700 transition-colors"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDuplicate(resume.id)}
                    className="flex-1 bg-white text-black text-sm font-semibold py-1.5 rounded border border-black hover:bg-gray-50 transition-colors"
                  >
                    Duplicate
                  </button>

                  <button
                    onClick={() => onDelete(resume.id)}
                    className="flex-1 bg-white text-black text-sm font-semibold py-1.5 rounded border border-black hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
