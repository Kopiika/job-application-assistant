'use client'

import { useState, useEffect } from 'react'
import ResultPanel from '@/components/ResultPanel'
import { IconSparkles, IconFileText, IconMail, IconCheck, IconRefresh } from '@/components/icons'
import { profileToCV } from '@/lib/profileToCV'
import { mergeCVWithTailored } from '@/lib/mergeCVWithTailored'
import type { Profile, Application, GenerateResponse } from '@/types'

export type GenState =
  | { status: 'idle' }
  | { status: 'generating' }
  | { status: 'done'; cv: string | null; cover: string | null }
  | { status: 'error'; message: string }

interface TabGenerateProps {
  profile: Profile
  onSaveApplication: (app: Application) => void
  genState: GenState
  onGenStateChange: (s: GenState) => void
}

const STEPS = [
  'Reading the job description',
  'Matching your skills',
  'Drafting CV',
  'Writing cover letter',
]

export default function TabGenerate({
  profile,
  onSaveApplication,
  genState,
  onGenStateChange,
}: TabGenerateProps) {
  const [jd, setJd] = useState(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('jd') ?? ''
  })

  useEffect(() => {
    if (jd) localStorage.setItem('jd', jd)
    else localStorage.removeItem('jd')
  }, [jd])
  const [saveModal, setSaveModal] = useState(false)
  const [generateCV, setGenerateCV] = useState(true)
  const [generateCover, setGenerateCover] = useState(true)

  const wordCount = jd.trim().split(/\s+/).filter(Boolean).length

  async function handleGenerate() {
    if (!jd.trim()) return
    const baseCV = profileToCV(profile)
    if (!baseCV.trim()) {
      onGenStateChange({ status: 'error', message: 'Fill in your profile first (My profile tab).' })
      return
    }

    onGenStateChange({ status: 'generating' })
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jd, baseCV, generateCV, generateCover }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? `Request failed (${res.status})`)
      }
      const data: GenerateResponse = await res.json()
      const cv = data.tailoredFields ? mergeCVWithTailored(profile, data.tailoredFields) : null
      onGenStateChange({ status: 'done', cv, cover: data.coverLetter })
    } catch (err) {
      onGenStateChange({
        status: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong',
      })
    }
  }

  function handleUpdate(key: 'cv' | 'cover', value: string) {
    if (genState.status !== 'done') return
    onGenStateChange({ ...genState, [key === 'cv' ? 'cv' : 'cover']: value })
  }

  function handleSaveToTracker() {
    setSaveModal(true)
  }

  function saveApplication(company: string, role: string) {
    if (genState.status !== 'done') return
    const app: Application = {
      id: 'a' + Date.now(),
      company,
      role,
      location: '',
      status: 'draft',
      appliedOn: '',
      updatedOn: new Date().toISOString().slice(0, 10),
      notes: '',
      url: '',
      cvSummary: genState.cv ?? '',
      coverLetter: genState.cover ?? '',
      starred: false,
    }
    onSaveApplication(app)
    setSaveModal(false)
  }

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* JD card */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-sm)',
              padding: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-subtle)',
                }}
              >
                Job description
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--text-subtle)',
                  fontFamily: 'var(--font-mono), monospace',
                }}
              >
                {wordCount} words
              </span>
            </div>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job description here…"
              style={{
                width: '100%',
                minHeight: 280,
                padding: '12px 14px',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface)',
                fontSize: 13.5,
                lineHeight: 1.6,
                outline: 'none',
                resize: 'vertical',
              }}
            />
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button
                onClick={() => setJd('')}
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Generate options card */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-sm)',
              padding: 20,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-subtle)',
                display: 'block',
                marginBottom: 14,
              }}
            >
              What to generate
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <DocTypeRow
                icon={<IconFileText size={18} />}
                title="Full CV"
                desc="Complete CV rewritten and tailored to this role"
                checked={generateCV}
                onClick={() => setGenerateCV((v) => !v)}
              />
              <DocTypeRow
                icon={<IconMail size={18} />}
                title="Cover letter"
                desc="Personalized opening referencing the company"
                checked={generateCover}
                onClick={() => setGenerateCover((v) => !v)}
              />
            </div>

            {genState.status === 'error' && (
              <div
                style={{
                  marginTop: 14,
                  padding: '10px 14px',
                  background: 'var(--danger-soft)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 13,
                  color: 'var(--danger)',
                }}
              >
                {genState.message}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={
                genState.status === 'generating' || !jd.trim() || (!generateCV && !generateCover)
              }
              style={{
                width: '100%',
                marginTop: 18,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 18px',
                fontSize: 15,
                fontWeight: 500,
                background: 'var(--accent)',
                color: 'white',
                border: '1px solid var(--accent)',
                borderRadius: 'var(--radius-sm)',
                opacity:
                  genState.status === 'generating' || !jd.trim() || (!generateCV && !generateCover)
                    ? 0.6
                    : 1,
                cursor:
                  genState.status === 'generating' || !jd.trim() || (!generateCV && !generateCover)
                    ? 'not-allowed'
                    : 'pointer',
                transition: 'background 120ms',
              }}
            >
              {genState.status === 'generating' ? (
                <>
                  <IconRefresh size={16} style={{ animation: 'spin 800ms linear infinite' }} />{' '}
                  Generating…
                </>
              ) : (
                <>
                  <IconSparkles size={16} />{' '}
                  {generateCV && generateCover
                    ? 'Generate both documents'
                    : generateCV
                      ? 'Generate CV summary'
                      : 'Generate cover letter'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right */}
        <div style={{ position: 'sticky', top: 24 }}>
          {genState.status === 'idle' && <EmptyState />}
          {genState.status === 'generating' && <GeneratingState />}
          {genState.status === 'error' && <EmptyState />}
          {genState.status === 'done' && (
            <ResultPanel
              cvSummary={genState.cv}
              coverLetter={genState.cover}
              candidateName={profile.name || 'Candidate'}
              photo={profile.photo}
              onUpdate={handleUpdate}
              onSaveToTracker={handleSaveToTracker}
              onClear={() => onGenStateChange({ status: 'idle' })}
            />
          )}
        </div>
      </div>

      {saveModal && genState.status === 'done' && (
        <SaveModal onConfirm={saveApplication} onClose={() => setSaveModal(false)} />
      )}
    </>
  )
}

function DocTypeRow({
  icon,
  title,
  desc,
  checked,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  checked: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        border: `1px solid ${checked ? 'var(--accent)' : 'var(--border-strong)'}`,
        background: checked ? 'var(--accent-soft)' : 'var(--surface)',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          flexShrink: 0,
          background: checked ? 'var(--accent)' : 'var(--surface-2)',
          color: checked ? 'white' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
      </div>
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          flexShrink: 0,
          border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--border-strong)'}`,
          background: checked ? 'var(--accent)' : 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        {checked && <IconCheck size={12} />}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        padding: '60px 40px',
        textAlign: 'center',
        minHeight: 520,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface)',
        border: '1px dashed var(--border-strong)',
        borderRadius: 'var(--radius)',
        boxShadow: 'none',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          marginBottom: 16,
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconSparkles size={26} />
      </div>
      <div
        className="font-serif"
        style={{ fontSize: 22, fontWeight: 500, marginBottom: 6, color: 'var(--text)' }}
      >
        Ready when you are
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13.5, maxWidth: 280, lineHeight: 1.55 }}>
        Paste a job description on the left and your tailored CV + cover letter will appear here.
      </div>
    </div>
  )
}

function GeneratingState() {
  return (
    <div
      style={{
        padding: 32,
        minHeight: 520,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconSparkles size={16} />
        </div>
        <div style={{ fontWeight: 500 }}>Tailoring your documents…</div>
      </div>
      {STEPS.map((step, i) => (
        <div
          key={step}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 0',
            borderTop: i === 0 ? 'none' : '1px solid var(--border)',
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: '2px solid var(--accent)',
              borderTopColor: 'transparent',
              animation: `spin ${800 + i * 100}ms linear infinite`,
              animationDelay: `${i * 200}ms`,
            }}
          />
          <span style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>{step}</span>
        </div>
      ))}
    </div>
  )
}

function SaveModal({
  onConfirm,
  onClose,
}: {
  onConfirm: (company: string, role: string) => void
  onClose: () => void
}) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')

  return (
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'oklch(0.2 0.012 70 / 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        animation: 'fadeIn 160ms ease',
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: 420,
          animation: 'popIn 200ms ease',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid var(--border)',
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Save to tracker
        </div>
        <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Company" value={company} onChange={setCompany} placeholder="e.g. Wolt" />
          <Field
            label="Role"
            value={role}
            onChange={setRole}
            placeholder="e.g. Junior Frontend Developer"
          />
        </div>
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            background: 'var(--surface-2)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              color: 'var(--text)',
              border: '1px solid transparent',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(company || 'Unknown', role || 'Unknown')}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              fontWeight: 500,
              background: 'var(--accent)',
              color: 'white',
              border: '1px solid var(--accent)',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const [focus, setFocus] = useState(false)
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
        {label}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%',
          height: 38,
          padding: '0 12px',
          border: `1px solid ${focus ? 'var(--accent)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-sm)',
          outline: 'none',
          boxShadow: focus ? '0 0 0 3px var(--accent-soft)' : 'none',
          background: 'var(--surface)',
          fontSize: 14,
          transition: 'border-color 120ms, box-shadow 120ms',
        }}
      />
    </label>
  )
}
