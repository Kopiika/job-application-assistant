'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'job-assistant-base-cv'

const DEFAULT_CV = `Elya Mir | elya.mir28@gmail.com | LinkedIn: linkedin.com/in/elyamir

EXPERIENCE

Frontend Developer — Acme Corp (2022–present)
- Built React/TypeScript admin dashboard used by 1,200+ internal users
- Migrated legacy CRA app to Next.js App Router, reducing initial load by 40%
- Achieved 100% Lighthouse performance score on main marketing pages
- Led a team of 3 developers through a 6-month product rewrite

Junior Developer — Startup XYZ (2020–2022)
- Developed REST API integrations with third-party services (Stripe, SendGrid)
- Wrote unit and integration tests with Jest and Testing Library (85% coverage)

EDUCATION

Bachelor of Computer Science — University of Helsinki (2020)

SKILLS

TypeScript, React, Next.js, Node.js, REST APIs, Git, Tailwind CSS, PostgreSQL

LANGUAGES

Ukrainian (native), English (fluent), Finnish (B2)`

interface CVFormProps {
  onChange: (value: string) => void
}

export default function CVForm({ onChange }: CVFormProps) {
  const [value, setValue] = useState('')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const initial = stored ?? DEFAULT_CV
    setValue(initial)
    onChange(initial)
    setHydrated(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value
    setValue(next)
    onChange(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-zinc-700">Your Base CV</label>
        <button
          type="button"
          onClick={() => {
            setValue(DEFAULT_CV)
            onChange(DEFAULT_CV)
            localStorage.setItem(STORAGE_KEY, DEFAULT_CV)
          }}
          className="text-xs text-zinc-400 hover:text-zinc-600"
        >
          Reset to default
        </button>
      </div>
      <textarea
        value={hydrated ? value : ''}
        onChange={handleChange}
        rows={18}
        placeholder="Paste your CV here..."
        className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-zinc-800 placeholder-zinc-300 focus:border-zinc-400 focus:ring-0 focus:outline-none"
      />
      <p className="text-xs text-zinc-400">Saved automatically to your browser</p>
    </div>
  )
}
