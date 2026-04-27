'use client'

import { useState } from 'react'

interface ResultPanelProps {
  cvSummary: string
  coverLetter: string
  candidateName: string
}

export default function ResultPanel({ cvSummary, coverLetter, candidateName }: ResultPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Panel
        title="CV Summary"
        initialText={cvSummary}
        downloadLabel="Download CV.docx"
        type="cv"
        candidateName={candidateName}
      />
      <Panel
        title="Cover Letter"
        initialText={coverLetter}
        downloadLabel="Download CoverLetter.docx"
        type="cover"
        candidateName={candidateName}
      />
    </div>
  )
}

interface PanelProps {
  title: string
  initialText: string
  downloadLabel: string
  type: 'cv' | 'cover'
  candidateName: string
}

function Panel({ title, initialText, downloadLabel, type, candidateName }: PanelProps) {
  const [text, setText] = useState(initialText)
  const [isEditing, setIsEditing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  async function handleDownload() {
    setIsDownloading(true)
    try {
      const res = await fetch('/api/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type, name: candidateName }),
      })

      if (!res.ok) throw new Error(`Failed to generate docx (${res.status})`)

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download =
        type === 'cv'
          ? `CV_${candidateName.replace(/\s+/g, '_')}.docx`
          : `CoverLetter_${candidateName.replace(/\s+/g, '_')}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-700">{title}</h2>
        <button
          type="button"
          onClick={() => setIsEditing((v) => !v)}
          className="text-xs font-medium text-zinc-400 hover:text-zinc-700"
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          className="w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm leading-relaxed text-zinc-800 focus:border-zinc-400 focus:outline-none"
        />
      ) : (
        <div className="min-h-[14rem] whitespace-pre-wrap rounded-lg bg-zinc-50 px-3 py-2 text-sm leading-relaxed text-zinc-700">
          {text}
        </div>
      )}

      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isDownloading ? (
          <>
            <Spinner />
            Generating…
          </>
        ) : (
          <>
            <DownloadIcon />
            {downloadLabel}
          </>
        )}
      </button>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a1 1 0 011 1v7.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 10.586V3a1 1 0 011-1z" />
      <path d="M3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
    </svg>
  )
}
