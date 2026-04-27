'use client'

import { useState } from 'react'
import CVForm from '@/components/CVForm'
import JobForm from '@/components/JobForm'
import type { GenerateResponse } from '@/types'

export default function Home() {
  const [baseCV, setBaseCV] = useState('')
  const [result, setResult] = useState<GenerateResponse | null>(null)

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="text-2xl font-bold text-zinc-800">Job Application Assistant</h1>
        <CVForm onChange={setBaseCV} />
        <JobForm baseCV={baseCV} onResult={setResult} />
        {result && (
          <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">CV Summary</p>
              <pre className="whitespace-pre-wrap text-sm text-zinc-700">{result.cvSummary}</pre>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">Cover Letter</p>
              <pre className="whitespace-pre-wrap text-sm text-zinc-700">{result.coverLetter}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
