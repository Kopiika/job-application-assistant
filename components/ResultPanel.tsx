'use client'

import { useState } from 'react'
import {
  IconFileText, IconMail, IconEdit, IconCheck,
  IconCopy, IconDownload, IconCloud, IconPlus,
} from '@/components/icons'

interface ResultPanelProps {
  cvSummary: string | null
  coverLetter: string | null
  candidateName: string
  onUpdate: (key: 'cv' | 'cover', value: string) => void
  onSaveToTracker: () => void
}

type DocTab = 'cv' | 'cover'

function IconButton({
  title, onClick, children,
}: { title: string; onClick: () => void; children: React.ReactNode }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 30, height: 30, borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)',
        background: hover ? 'var(--surface-2)' : 'transparent',
        border: `1px solid ${hover ? 'var(--border)' : 'transparent'}`,
        transition: 'all 120ms',
      }}
    >
      {children}
    </button>
  )
}

export default function ResultPanel({
  cvSummary, coverLetter, candidateName, onUpdate, onSaveToTracker,
}: ResultPanelProps) {
  const [activeTab, setActiveTab] = useState<DocTab>(cvSummary ? 'cv' : 'cover')
  const [editing, setEditing] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [driveLink, setDriveLink] = useState<string | null>(null)

  const current = (activeTab === 'cv' ? cvSummary : coverLetter) ?? ''
  const availableTabs: DocTab[] = [
    ...(cvSummary != null ? ['cv' as DocTab] : []),
    ...(coverLetter != null ? ['cover' as DocTab] : []),
  ]

  function switchTab(t: DocTab) {
    setActiveTab(t)
    setEditing(false)
    setDriveLink(null)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(current)
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      const res = await fetch('/api/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: current, type: activeTab, name: candidateName }),
      })
      if (!res.ok) throw new Error('Failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = activeTab === 'cv'
        ? `CV_${candidateName.replace(/\s+/g, '_')}.docx`
        : `CoverLetter_${candidateName.replace(/\s+/g, '_')}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  async function handleDriveUpload() {
    setUploading(true)
    setDriveLink(null)
    try {
      const docxRes = await fetch('/api/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: current, type: activeTab, name: candidateName }),
      })
      if (!docxRes.ok) throw new Error('docx failed')
      const buf = await docxRes.arrayBuffer()
      const bytes = new Uint8Array(buf)
      let binary = ''
      bytes.forEach((b) => (binary += String.fromCharCode(b)))
      const fileBase64 = btoa(binary)
      const fileName = activeTab === 'cv'
        ? `CV_${candidateName.replace(/\s+/g, '_')}.docx`
        : `CoverLetter_${candidateName.replace(/\s+/g, '_')}.docx`

      const driveRes = await fetch('/api/drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64, fileName }),
      })
      const data = await driveRes.json()
      if (!driveRes.ok) throw new Error(data.error ?? 'Drive upload failed')
      setDriveLink(data.driveLink)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 'calc(100vh - 140px)',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface-2)',
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {availableTabs.map((t) => {
            const active = activeTab === t
            return (
              <button
                key={t}
                onClick={() => switchTab(t)}
                style={{
                  padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                  background: active ? 'var(--surface)' : 'transparent',
                  color: active ? 'var(--text)' : 'var(--text-muted)',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  border: active ? '1px solid var(--border)' : '1px solid transparent',
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 120ms',
                }}
              >
                {t === 'cv' ? <IconFileText size={14} /> : <IconMail size={14} />}
                {t === 'cv' ? 'CV' : 'Cover letter'}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <IconButton title={editing ? 'Done editing' : 'Edit'} onClick={() => setEditing((v) => !v)}>
            {editing ? <IconCheck size={15} /> : <IconEdit size={15} />}
          </IconButton>
          <IconButton title="Copy to clipboard" onClick={handleCopy}>
            <IconCopy size={15} />
          </IconButton>
          <IconButton title={downloading ? 'Downloading…' : 'Download .docx'} onClick={handleDownload}>
            <IconDownload size={15} style={downloading ? { animation: 'spin 1s linear infinite' } : undefined} />
          </IconButton>
          <IconButton title={uploading ? 'Uploading…' : 'Save to Google Drive'} onClick={handleDriveUpload}>
            <IconCloud size={15} style={uploading ? { animation: 'spin 1s linear infinite' } : undefined} />
          </IconButton>
        </div>
      </div>

      {/* Drive link */}
      {driveLink && (
        <div style={{ padding: '8px 16px', background: 'var(--success-soft)', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
          ✓ Saved to Drive —{' '}
          <a href={driveLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 500 }}>
            Open file
          </a>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24, background: 'var(--surface)' }}>
        {editing ? (
          <textarea
            value={current}
            onChange={(e) => onUpdate(activeTab, e.target.value)}
            style={{
              width: '100%', minHeight: 480, padding: 0,
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: 13, lineHeight: 1.65,
              fontFamily: 'var(--font-mono), JetBrains Mono, monospace',
              resize: 'none',
            }}
          />
        ) : (
          <pre style={{
            margin: 0,
            fontFamily: activeTab === 'cv'
              ? 'var(--font-mono), JetBrains Mono, monospace'
              : 'var(--font-serif), IBM Plex Serif, Georgia, serif',
            fontSize: activeTab === 'cv' ? 12.5 : 14.5,
            lineHeight: 1.7,
            color: 'var(--text)',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}>
            {current}
          </pre>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface-2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
          Tailored · ready to send
        </div>
        <button
          onClick={onSaveToTracker}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 'var(--radius-sm)',
            background: 'var(--surface)', color: 'var(--text)',
            border: '1px solid var(--border-strong)',
            fontSize: 13, fontWeight: 500,
            boxShadow: 'var(--shadow-sm)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)' }}
        >
          <IconPlus size={14} />
          Save to tracker
        </button>
      </div>
    </div>
  )
}
