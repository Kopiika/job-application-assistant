'use client'

import { useState } from 'react'
import type { GenerateResponse } from '@/types'

interface JobFormProps {
  baseCV: string
  onResult: (result: GenerateResponse) => void
}

export default function JobForm({ baseCV, onResult }: JobFormProps) {
  const [jobDescription, setJobDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!jobDescription.trim()) return
    if (!baseCV.trim()) {
      setError('Please fill in your CV first.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, baseCV }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Request failed (${res.status})`)
      }

      const data: GenerateResponse = await res.json()
      onResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-zinc-700">Job Description</label>
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        rows={12}
        placeholder="Paste the full job description here..."
        disabled={isLoading}
        className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-800 placeholder-zinc-300 focus:border-zinc-400 focus:outline-none disabled:opacity-50"
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isLoading || !jobDescription.trim()}
        className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isLoading ? (
          <>
            <Spinner />
            Generating…
          </>
        ) : (
          'Generate CV + Cover Letter'
        )}
      </button>
    </div>
  )
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )
}
