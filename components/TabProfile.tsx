'use client'

import { useState } from 'react'
import { IconCheck, IconSparkles } from '@/components/icons'
import type { Profile } from '@/types'

const PROFILE_FIELDS: { key: keyof Profile; label: string; hint?: string; placeholder: string; rows?: number }[] = [
  { key: 'role', label: 'Current role / studies', placeholder: 'Junior Full Stack Developer, Business College Helsinki' },
  { key: 'skills', label: 'Tech skills', hint: 'Comma-separated — tools, languages, frameworks.', placeholder: 'React, Node.js, TypeScript, PostgreSQL, Git, REST APIs…', rows: 3 },
  { key: 'experience', label: 'Work experience', hint: 'One entry per line. Include outcomes when you can.', placeholder: 'Frontend Developer — Acme (2022–present)\n- Built admin dashboard for 1,200 users\n- Reduced load time by 40%', rows: 6 },
  { key: 'projects', label: 'Projects', hint: 'Especially important for junior roles. Add links and tech stack.', placeholder: 'Bloglist (2025) — React + Express + MongoDB, deployed on Fly.io\nPatientor — TypeScript fullstack patient records app', rows: 5 },
  { key: 'education', label: 'Education', placeholder: 'Business College Helsinki — ICT, 2024–2026', rows: 3 },
  { key: 'languages', label: 'Languages', placeholder: 'English C1, Ukrainian native, Finnish A2' },
  { key: 'location', label: 'Location & availability', placeholder: 'Helsinki — available from June 2026' },
  { key: 'about', label: 'About you', hint: 'Used as the opener of cover letters. One short paragraph.', placeholder: 'Junior developer who learns fastest in code review. Comfortable across the stack and especially curious about TypeScript.', rows: 4 },
]

const COMPLETION_FIELDS: { key: keyof Profile; label: string; weight: number; minLen?: number }[] = [
  { key: 'name', label: 'Add your name', weight: 10 },
  { key: 'email', label: 'Add your email', weight: 10 },
  { key: 'role', label: 'Add your current role or studies', weight: 12 },
  { key: 'skills', label: 'List your tech skills', weight: 15, minLen: 20 },
  { key: 'experience', label: 'Describe work experience', weight: 15, minLen: 40 },
  { key: 'projects', label: 'Add projects', weight: 12, minLen: 30 },
  { key: 'education', label: 'Add education', weight: 8 },
  { key: 'languages', label: 'Add languages', weight: 6 },
  { key: 'location', label: 'Add location & availability', weight: 6 },
  { key: 'about', label: 'Write a short "about you"', weight: 6, minLen: 30 },
]

function computeCompletion(p: Profile) {
  let score = 0
  const suggestions: string[] = []
  COMPLETION_FIELDS.forEach((f) => {
    const v = (p[f.key] ?? '').trim()
    const ok = f.minLen ? v.length >= f.minLen : v.length > 0
    if (ok) score += f.weight
    else suggestions.push(f.label)
  })
  return { score, suggestions: suggestions.slice(0, 4) }
}

interface TabProfileProps {
  profile: Profile
  onSave: (p: Profile) => void
}

export default function TabProfile({ profile, onSave }: TabProfileProps) {
  const [draft, setDraft] = useState<Profile>(profile)
  const [saved, setSaved] = useState(true)

  function set(key: keyof Profile) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setDraft((d) => ({ ...d, [key]: e.target.value }))
      setSaved(false)
    }
  }

  function handleSave() {
    onSave(draft)
    setSaved(true)
  }

  const completion = computeCompletion(draft)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
      {/* Form */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', padding: 28 }}>
        <div style={{ marginBottom: 22 }}>
          <div className="font-serif" style={{ fontSize: 20, fontWeight: 500, marginBottom: 4, color: 'var(--text)' }}>Your profile</div>
          <div style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>
            Used to personalize generated documents. The more detail, the better the result.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Your name" value={draft.name} onChange={set('name')} placeholder="Your full name" />
            <Field label="Email" value={draft.email} onChange={set('email')} placeholder="you@email.com" />
          </div>

          {PROFILE_FIELDS.map((f) =>
            f.rows ? (
              <TextareaField key={f.key} label={f.label} hint={f.hint} value={draft[f.key]} onChange={set(f.key)} placeholder={f.placeholder} rows={f.rows} />
            ) : (
              <Field key={f.key} label={f.label} hint={f.hint} value={draft[f.key]} onChange={set(f.key)} placeholder={f.placeholder} />
            ),
          )}
        </div>

        <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12.5, color: 'var(--text-subtle)' }}>
            {saved ? '✓ All changes saved' : 'Unsaved changes'}
          </div>
          <button
            onClick={handleSave}
            disabled={saved}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 'var(--radius-sm)',
              background: saved ? 'var(--surface-2)' : 'var(--accent)',
              color: saved ? 'var(--text-muted)' : 'white',
              border: `1px solid ${saved ? 'var(--border-strong)' : 'var(--accent)'}`,
              fontSize: 14, fontWeight: 500,
              opacity: saved ? 0.6 : 1,
              cursor: saved ? 'not-allowed' : 'pointer',
              transition: 'all 120ms',
            }}
          >
            <IconCheck size={14} />
            Save profile
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
        {/* Strength */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 12 }}>
            Profile strength
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
            <span className="font-serif" style={{ fontSize: 32, fontWeight: 500, lineHeight: 1, color: 'var(--text)' }}>{completion.score}</span>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{
              height: '100%',
              width: `${completion.score}%`,
              background: completion.score >= 80 ? 'var(--success)' : completion.score >= 50 ? 'var(--accent)' : 'var(--warning)',
              borderRadius: 999, transition: 'width 300ms',
            }} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {completion.score >= 80
              ? 'Looking great. Generated documents will be highly tailored.'
              : completion.score >= 50
              ? 'Solid base. Fill more fields to improve quality.'
              : 'Add more detail to get better results.'}
          </div>
        </div>

        {/* Suggestions */}
        {completion.suggestions.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 12 }}>
              Suggested next
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {completion.suggestions.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', fontSize: 13.5, color: 'var(--text-muted)', borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tip */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <IconSparkles size={14} style={{ color: 'var(--accent)' }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Tip</div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
            Write experience in outcome-focused bullets. "Built X with Y, reduced Z by N%" generates much stronger CVs than vague responsibilities.
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, hint, value, onChange, placeholder }: { label: string; hint?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string }) {
  const [focus, setFocus] = useState(false)
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>{label}</div>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%', height: 38, padding: '0 12px',
          border: `1px solid ${focus ? 'var(--accent)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-sm)', outline: 'none',
          boxShadow: focus ? '0 0 0 3px var(--accent-soft)' : 'none',
          background: 'var(--surface)', fontSize: 14,
          transition: 'border-color 120ms, box-shadow 120ms',
        }}
      />
      {hint && <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 4 }}>{hint}</div>}
    </label>
  )
}

function TextareaField({ label, hint, value, onChange, placeholder, rows }: { label: string; hint?: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder: string; rows: number }) {
  const [focus, setFocus] = useState(false)
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>{label}</div>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%', padding: '10px 12px',
          border: `1px solid ${focus ? 'var(--accent)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-sm)', outline: 'none',
          boxShadow: focus ? '0 0 0 3px var(--accent-soft)' : 'none',
          background: 'var(--surface)', fontSize: 14, lineHeight: 1.55,
          transition: 'border-color 120ms, box-shadow 120ms',
        }}
      />
      {hint && <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 4 }}>{hint}</div>}
    </label>
  )
}
