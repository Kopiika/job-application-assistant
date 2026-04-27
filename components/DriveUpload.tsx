'use client'

import { useState } from 'react'
import type { DriveUploadResponse } from '@/types'

interface DriveUploadProps {
  cvSummary: string
  coverLetter: string
  candidateName: string
}

type UploadState =
  | { status: 'idle' }
  | { status: 'loading'; step: string }
  | { status: 'success'; cv: DriveUploadResponse; cover: DriveUploadResponse }
  | { status: 'error'; message: string }

export default function DriveUpload({ cvSummary, coverLetter, candidateName }: DriveUploadProps) {
  const [state, setState] = useState<UploadState>({ status: 'idle' })

  async function handleUpload() {
    setState({ status: 'loading', step: 'Generating CV.docx…' })

    try {
      const cvBase64 = await fetchDocxAsBase64(cvSummary, 'cv', candidateName)

      setState({ status: 'loading', step: 'Generating CoverLetter.docx…' })
      const coverBase64 = await fetchDocxAsBase64(coverLetter, 'cover', candidateName)

      setState({ status: 'loading', step: 'Uploading to Google Drive…' })
      const [cvResult, coverResult] = await Promise.all([
        uploadToDrive(cvBase64, `CV_${candidateName.replace(/\s+/g, '_')}.docx`),
        uploadToDrive(coverBase64, `CoverLetter_${candidateName.replace(/\s+/g, '_')}.docx`),
      ])

      setState({ status: 'success', cv: cvResult, cover: coverResult })
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Upload failed',
      })
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <DriveIcon />
        <div className="flex-1">
          <p className="text-sm font-semibold text-zinc-700">Save to Google Drive</p>
          <p className="text-xs text-zinc-400">Uploads CV + Cover Letter as .docx files</p>
        </div>

        {state.status !== 'success' && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={state.status === 'loading'}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {state.status === 'loading' ? (
              <>
                <Spinner />
                Uploading…
              </>
            ) : (
              'Upload to Drive'
            )}
          </button>
        )}
      </div>

      {state.status === 'loading' && (
        <p className="mt-3 text-xs text-zinc-400">{state.step}</p>
      )}

      {state.status === 'error' && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.message}
        </p>
      )}

      {state.status === 'success' && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-green-600">✓ Uploaded successfully</p>
          <DriveLink label="CV.docx" href={state.cv.driveLink} />
          <DriveLink label="CoverLetter.docx" href={state.cover.driveLink} />
          <button
            type="button"
            onClick={() => setState({ status: 'idle' })}
            className="mt-1 text-xs text-zinc-400 hover:text-zinc-600"
          >
            Upload again
          </button>
        </div>
      )}
    </div>
  )
}

function DriveLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-zinc-700 underline-offset-2 hover:underline"
    >
      <DriveIcon size={14} />
      {label}
    </a>
  )
}

async function fetchDocxAsBase64(text: string, type: 'cv' | 'cover', name: string): Promise<string> {
  const res = await fetch('/api/docx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, type, name }),
  })
  if (!res.ok) throw new Error(`Failed to generate ${type} docx (${res.status})`)

  const buffer = await res.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

async function uploadToDrive(fileBase64: string, fileName: string): Promise<DriveUploadResponse> {
  const res = await fetch('/api/drive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileBase64, fileName }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `Drive upload failed (${res.status})`)
  return data as DriveUploadResponse
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

function DriveIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 87.3 78" fill="none">
      <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L29.9 48H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066DA"/>
      <path d="M43.65 25L27.5 0c-1.35.8-2.5 1.9-3.3 3.3L1.2 43.5C.4 44.9 0 46.45 0 48h29.9z" fill="#00AC47"/>
      <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H57.4l6.2 11.9z" fill="#EA4335"/>
      <path d="M43.65 25L57.4 48h29.9c0-1.55-.4-3.1-1.2-4.5L64.2 3.3c-.8-1.4-1.95-2.5-3.3-3.3z" fill="#00832D"/>
      <path d="M57.4 48H29.9L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684FC"/>
      <path d="M73.4 25.5L61.05 3.3c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 57.4 48l29.75-.05c0-1.55-.4-3.1-1.2-4.5z" fill="#FFBA00"/>
    </svg>
  )
}
