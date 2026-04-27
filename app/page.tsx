'use client'

import { useState } from 'react'
import CVForm from '@/components/CVForm'
import JobForm from '@/components/JobForm'
import ResultPanel from '@/components/ResultPanel'
import type { GenerateResponse } from '@/types'

function extractName(cv: string): string {
  const firstLine = cv.split('\n').find((l) => l.trim())
  return firstLine?.split('|')[0].trim() || 'Candidate'
}

export default function Home() {
  const [baseCV, setBaseCV] = useState('')
  const [result, setResult] = useState<GenerateResponse | null>(null)

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <h1 className="text-2xl font-bold text-zinc-800">Job Application Assistant</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <CVForm onChange={setBaseCV} />
          <JobForm baseCV={baseCV} onResult={setResult} />
        </div>

        {result && (
          <ResultPanel
            cvSummary={result.cvSummary}
            coverLetter={result.coverLetter}
            candidateName={extractName(baseCV)}
          />
        )}
      </div>
    </div>
  )
}
