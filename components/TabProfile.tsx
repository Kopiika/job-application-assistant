'use client'

import { useRef, useState } from 'react'
import { IconCheck, IconSparkles, IconPlus, IconEdit, IconTrash, IconCamera } from '@/components/icons'
import { PhotoCropper } from './PhotoCropper'
import type { Profile, ExperienceEntry, ProjectEntry, EducationEntry, LanguageEntry } from '@/types'

// ─── completion ───────────────────────────────────────────────────────────────

const COMPLETION_FIELDS: { key: keyof Profile; label: string; weight: number; minLen?: number }[] = [
  { key: 'name', label: 'Add your name', weight: 10 },
  { key: 'email', label: 'Add your email', weight: 10 },
  { key: 'role', label: 'Add your current role or studies', weight: 12 },
  { key: 'skills', label: 'List your tech skills', weight: 15, minLen: 20 },
  { key: 'experience', label: 'Describe work experience', weight: 15 },
  { key: 'projects', label: 'Add projects', weight: 12 },
  { key: 'education', label: 'Add education', weight: 8 },
  { key: 'languages', label: 'Add languages', weight: 6 },
  { key: 'location', label: 'Add location & availability', weight: 6 },
  { key: 'about', label: 'Write a short "about you"', weight: 6, minLen: 30 },
]

function computeCompletion(p: Profile) {
  let score = 0
  const suggestions: string[] = []
  for (const f of COMPLETION_FIELDS) {
    const v = p[f.key]
    const ok = Array.isArray(v)
      ? (v as unknown[]).length > 0
      : f.minLen
        ? ((v as string) ?? '').trim().length >= f.minLen
        : ((v as string) ?? '').trim().length > 0
    if (ok) score += f.weight
    else suggestions.push(f.label)
  }
  return { score, suggestions: suggestions.slice(0, 4) }
}

// ─── empty factories ──────────────────────────────────────────────────────────

const emptyExp = (): ExperienceEntry => ({
  title: '', company: '', location: '', from: '', to: '', description: '', bullets: '', tech: '',
})
const emptyProj = (): ProjectEntry => ({
  name: '', from: '', to: '', description: '', bullets: '', tech: '', githubLink: '', demoLink: '',
})
const emptyEdu = (): EducationEntry => ({
  degree: '', school: '', from: '', to: '', description: '',
})
const emptyLang = (): LanguageEntry => ({ language: '', level: '' })

// ─── photo upload ─────────────────────────────────────────────────────────────

function PhotoUpload({ photo, onChange }: { photo?: string; onChange: (v: string | undefined) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCropSrc(URL.createObjectURL(file))
    e.target.value = ''
  }

  function handleCrop(blob: Blob) {
    const reader = new FileReader()
    reader.onload = () => {
      onChange(reader.result as string)
      setCropSrc(null)
    }
    reader.readAsDataURL(blob)
  }

  return (
    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 6 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingTop: 14 }}>
        <div
          style={{
            width: 72, height: 72, borderRadius: 10, flexShrink: 0,
            border: `2px ${photo ? 'solid var(--accent)' : 'dashed var(--border-strong)'}`,
            background: 'var(--surface-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {photo
            ? <img src={photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <IconCamera size={22} style={{ color: 'var(--text-subtle)' }} />}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>Profile photo</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.4 }}>
            Appears in the CV header. JPEG or PNG, ideally square.
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={() => inputRef.current?.click()} style={smallBtn}>
              {photo ? 'Change' : 'Upload photo'}
            </button>
            {photo && (
              <button type="button" onClick={() => onChange(undefined)} style={{ ...smallBtn, color: 'var(--danger, #dc2626)' }}>
                Remove
              </button>
            )}
            {cropSrc && (
              <button type="button" onClick={() => setCropSrc(null)} style={smallBtn}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png" style={{ display: 'none' }} onChange={handleFile} />

      {cropSrc && (
        <div style={{ marginTop: 14, padding: 14, background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <PhotoCropper src={cropSrc} onCrop={handleCrop} />
        </div>
      )}
    </div>
  )
}

// ─── entry editors ────────────────────────────────────────────────────────────

function ExpEditor({ entry, onChange, onDone, onRemove }: {
  entry: ExperienceEntry; onChange: (e: ExperienceEntry) => void; onDone: () => void; onRemove: () => void
}) {
  const s = (key: keyof ExperienceEntry) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...entry, [key]: e.target.value })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 12 }}>
      <FormRow>
        <SF label="Title / role" value={entry.title} onChange={s('title')} placeholder="Frontend Developer — Internship" flex={2} />
        <SF label="Company" value={entry.company} onChange={s('company')} placeholder="Ellarion Tales Oy" flex={1} />
      </FormRow>
      <FormRow>
        <SF label="Location" value={entry.location} onChange={s('location')} placeholder="Remote, Helsinki" flex={2} />
        <SF label="From" value={entry.from} onChange={s('from')} placeholder="March 2026" flex={1} />
        <SF label="To" value={entry.to} onChange={s('to')} placeholder="Present" flex={1} />
      </FormRow>
      <STA label="Description" value={entry.description} onChange={s('description')} placeholder="Brief context about this role..." rows={2} />
      <STA label="Bullets (one per line, • optional)" value={entry.bullets} onChange={s('bullets')} placeholder={"Built a 5-step registration form...\nDeveloped full admin panel..."} rows={4} />
      <SF label="Tech stack" value={entry.tech} onChange={s('tech')} placeholder="React 19 · TypeScript · Tailwind CSS · Git" />
      <EntryActions onDone={onDone} onRemove={onRemove} />
    </div>
  )
}

function ProjEditor({ entry, onChange, onDone, onRemove }: {
  entry: ProjectEntry; onChange: (e: ProjectEntry) => void; onDone: () => void; onRemove: () => void
}) {
  const s = (key: keyof ProjectEntry) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...entry, [key]: e.target.value })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 12 }}>
      <FormRow>
        <SF label="Project name" value={entry.name} onChange={s('name')} placeholder="LARP Event Registration Platform" flex={2} />
        <SF label="From" value={entry.from} onChange={s('from')} placeholder="Mar 2026" flex={1} />
        <SF label="To" value={entry.to} onChange={s('to')} placeholder="Present" flex={1} />
      </FormRow>
      <FormRow>
        <SF label="GitHub link" value={entry.githubLink} onChange={s('githubLink')} placeholder="github.com/user/repo" flex={1} />
        <SF label="Live demo link" value={entry.demoLink} onChange={s('demoLink')} placeholder="myproject.vercel.app" flex={1} />
      </FormRow>
      <STA label="Description" value={entry.description} onChange={s('description')} placeholder="What the project does and who it's for..." rows={2} />
      <STA label="Bullets (one per line, • optional)" value={entry.bullets} onChange={s('bullets')} placeholder={"Token-based invite system...\n100% Lighthouse score..."} rows={3} />
      <SF label="Tech stack" value={entry.tech} onChange={s('tech')} placeholder="React 19 · TypeScript · Vite · Tailwind CSS 4" />
      <EntryActions onDone={onDone} onRemove={onRemove} />
    </div>
  )
}

function EduEditor({ entry, onChange, onDone, onRemove }: {
  entry: EducationEntry; onChange: (e: EducationEntry) => void; onDone: () => void; onRemove: () => void
}) {
  const s = (key: keyof EducationEntry) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...entry, [key]: e.target.value })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 12 }}>
      <SF label="Degree / qualification" value={entry.degree} onChange={s('degree')} placeholder="Vocational Qualification – Software Development" />
      <FormRow>
        <SF label="School / institution" value={entry.school} onChange={s('school')} placeholder="Business College Helsinki" flex={2} />
        <SF label="From" value={entry.from} onChange={s('from')} placeholder="March 2025" flex={1} />
        <SF label="To" value={entry.to} onChange={s('to')} placeholder="Present" flex={1} />
      </FormRow>
      <STA label="Details (optional)" value={entry.description} onChange={s('description')} placeholder="Courses, specializations, notable projects..." rows={2} />
      <EntryActions onDone={onDone} onRemove={onRemove} />
    </div>
  )
}

// ─── entry lists ──────────────────────────────────────────────────────────────

function ExpList({ entries, onChange }: { entries: ExperienceEntry[]; onChange: (v: ExperienceEntry[]) => void }) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const add = () => { const next = [...entries, emptyExp()]; onChange(next); setExpanded(next.length - 1) }
  const upd = (i: number, e: ExperienceEntry) => onChange(entries.map((x, j) => j === i ? e : x))
  const rem = (i: number) => { onChange(entries.filter((_, j) => j !== i)); setExpanded(null) }
  return (
    <EntrySection label="Work experience" hint="One entry per position." onAdd={add} addLabel="Add position">
      {entries.map((e, i) => (
        <EntryCard key={i} title={e.title || 'Untitled position'} sub={[e.company, e.location].filter(Boolean).join(' · ')} date={[e.from, e.to].filter(Boolean).join(' – ')} isExpanded={expanded === i} onToggle={() => setExpanded(expanded === i ? null : i)} onRemove={() => rem(i)}>
          <ExpEditor entry={e} onChange={(v) => upd(i, v)} onDone={() => setExpanded(null)} onRemove={() => rem(i)} />
        </EntryCard>
      ))}
    </EntrySection>
  )
}

function ProjList({ entries, onChange }: { entries: ProjectEntry[]; onChange: (v: ProjectEntry[]) => void }) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const add = () => { const next = [...entries, emptyProj()]; onChange(next); setExpanded(next.length - 1) }
  const upd = (i: number, e: ProjectEntry) => onChange(entries.map((x, j) => j === i ? e : x))
  const rem = (i: number) => { onChange(entries.filter((_, j) => j !== i)); setExpanded(null) }
  return (
    <EntrySection label="Projects" hint="Most relevant projects are reordered by the AI per job." onAdd={add} addLabel="Add project">
      {entries.map((e, i) => (
        <EntryCard key={i} title={e.name || 'Untitled project'} sub={[e.githubLink, e.demoLink].filter(Boolean).join('  ·  ')} date={[e.from, e.to].filter(Boolean).join(' – ')} isExpanded={expanded === i} onToggle={() => setExpanded(expanded === i ? null : i)} onRemove={() => rem(i)}>
          <ProjEditor entry={e} onChange={(v) => upd(i, v)} onDone={() => setExpanded(null)} onRemove={() => rem(i)} />
        </EntryCard>
      ))}
    </EntrySection>
  )
}

function EduList({ entries, onChange }: { entries: EducationEntry[]; onChange: (v: EducationEntry[]) => void }) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const add = () => { const next = [...entries, emptyEdu()]; onChange(next); setExpanded(next.length - 1) }
  const upd = (i: number, e: EducationEntry) => onChange(entries.map((x, j) => j === i ? e : x))
  const rem = (i: number) => { onChange(entries.filter((_, j) => j !== i)); setExpanded(null) }
  return (
    <EntrySection label="Education" hint="Most recent first." onAdd={add} addLabel="Add education">
      {entries.map((e, i) => (
        <EntryCard key={i} title={e.degree || 'Untitled'} sub={e.school} date={[e.from, e.to].filter(Boolean).join(' – ')} isExpanded={expanded === i} onToggle={() => setExpanded(expanded === i ? null : i)} onRemove={() => rem(i)}>
          <EduEditor entry={e} onChange={(v) => upd(i, v)} onDone={() => setExpanded(null)} onRemove={() => rem(i)} />
        </EntryCard>
      ))}
    </EntrySection>
  )
}

function LangList({ entries, onChange }: { entries: LanguageEntry[]; onChange: (v: LanguageEntry[]) => void }) {
  const add = () => onChange([...entries, emptyLang()])
  const upd = (i: number, e: LanguageEntry) => onChange(entries.map((x, j) => j === i ? e : x))
  const rem = (i: number) => onChange(entries.filter((_, j) => j !== i))
  return (
    <EntrySection label="Languages" hint="" onAdd={add} addLabel="Add language">
      {entries.map((e, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <SF label="Language" value={e.language} onChange={(ev) => upd(i, { ...e, language: ev.target.value })} placeholder="English" flex={1} />
          <SF label="Level" value={e.level} onChange={(ev) => upd(i, { ...e, level: ev.target.value })} placeholder="Working proficiency" flex={2} />
          <button type="button" onClick={() => rem(i)} style={{ ...iconBtn, color: 'var(--danger, #dc2626)', marginBottom: 1, height: 32 }}>
            <IconTrash size={14} />
          </button>
        </div>
      ))}
    </EntrySection>
  )
}

// ─── main ─────────────────────────────────────────────────────────────────────

const SIMPLE_FIELDS: { key: keyof Profile; label: string; hint?: string; placeholder: string; rows?: number }[] = [
  { key: 'role', label: 'Current role / studies', placeholder: 'Junior Full Stack Developer, Business College Helsinki' },
  { key: 'skills', label: 'Tech skills', hint: 'Comma-separated — tools, languages, frameworks.', placeholder: 'React, Node.js, TypeScript, PostgreSQL, Git, REST APIs…', rows: 3 },
  { key: 'location', label: 'Location & availability', placeholder: 'Helsinki — available from June 2026' },
  { key: 'about', label: 'About you', hint: 'Used as context for cover letters. One short paragraph.', placeholder: 'Junior developer who learns fastest in code review. Comfortable across the stack.', rows: 4 },
]

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

  function setVal<T>(key: keyof Profile) {
    return (v: T) => { setDraft((d) => ({ ...d, [key]: v })); setSaved(false) }
  }

  function handleSave() { onSave(draft); setSaved(true) }

  const completion = computeCompletion(draft)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
      {/* Form */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', padding: 28 }}>
        <div style={{ marginBottom: 18 }}>
          <div className="font-serif" style={{ fontSize: 20, fontWeight: 500, marginBottom: 4, color: 'var(--text)' }}>Your profile</div>
          <div style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>
            Used to personalize generated documents. The more detail, the better the result.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Photo */}
          <PhotoUpload photo={draft.photo} onChange={setVal('photo')} />

          {/* Name + Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Your name" value={draft.name} onChange={set('name')} placeholder="Your full name" />
            <Field label="Email" value={draft.email} onChange={set('email')} placeholder="you@email.com" />
          </div>

          {/* LinkedIn + GitHub */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="LinkedIn URL" value={draft.linkedin} onChange={set('linkedin')} placeholder="linkedin.com/in/yourname" />
            <Field label="GitHub URL" value={draft.github} onChange={set('github')} placeholder="github.com/yourname" />
          </div>

          {/* Simple fields */}
          {SIMPLE_FIELDS.map((f) =>
            f.rows ? (
              <TextareaField key={f.key} label={f.label} hint={f.hint} value={draft[f.key] as string} onChange={set(f.key)} placeholder={f.placeholder} rows={f.rows} />
            ) : (
              <Field key={f.key} label={f.label} hint={f.hint} value={draft[f.key] as string} onChange={set(f.key)} placeholder={f.placeholder} />
            ),
          )}

          <Divider />
          <ExpList entries={draft.experience} onChange={setVal('experience')} />

          <Divider />
          <ProjList entries={draft.projects} onChange={setVal('projects')} />

          <Divider />
          <EduList entries={draft.education} onChange={setVal('education')} />

          <Divider />
          <LangList entries={draft.languages} onChange={setVal('languages')} />
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
              height: '100%', width: `${completion.score}%`,
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

        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <IconSparkles size={14} style={{ color: 'var(--accent)' }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Tip</div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
            Write bullets in outcome-focused style: "Built X with Y, reduced Z by N%". Each bullet becomes a bullet point in the downloaded DOCX.
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ui primitives ────────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
}

function EntrySection({ label, hint, onAdd, addLabel, children }: {
  label: string; hint?: string; onAdd: () => void; addLabel: string; children: React.ReactNode
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{label}</div>
          {hint && <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 2 }}>{hint}</div>}
        </div>
        <button type="button" onClick={onAdd} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
          background: 'var(--accent-soft)', color: 'var(--accent)',
          border: '1px solid var(--accent)', cursor: 'pointer', flexShrink: 0, marginLeft: 12,
        }}>
          <IconPlus size={12} /> {addLabel}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  )
}

function EntryCard({ title, sub, date, isExpanded, onToggle, onRemove, children }: {
  title: string; sub: string; date: string
  isExpanded: boolean; onToggle: () => void; onRemove: () => void; children: React.ReactNode
}) {
  return (
    <div style={{
      border: `1px solid ${isExpanded ? 'var(--accent)' : 'var(--border-strong)'}`,
      borderRadius: 8, background: isExpanded ? 'var(--accent-soft)' : 'var(--surface)',
      overflow: 'hidden', transition: 'border-color 120ms, background 120ms',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
          {(sub || date) && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1, display: 'flex', gap: 8 }}>
              {sub && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</span>}
              {date && <span style={{ flexShrink: 0, color: 'var(--text-subtle)' }}>{date}</span>}
            </div>
          )}
        </div>
        <button type="button" onClick={onToggle} title={isExpanded ? 'Collapse' : 'Edit'} style={iconBtn}><IconEdit size={14} /></button>
        <button type="button" onClick={onRemove} title="Remove" style={{ ...iconBtn, color: 'var(--danger, #dc2626)' }}><IconTrash size={14} /></button>
      </div>
      {isExpanded && (
        <div style={{ padding: '0 12px 14px', borderTop: '1px solid var(--border)' }}>{children}</div>
      )}
    </div>
  )
}

function EntryActions({ onDone, onRemove }: { onDone: () => void; onRemove: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
      <button type="button" onClick={onDone} style={{ padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500, background: 'var(--accent)', color: 'white', border: '1px solid var(--accent)', cursor: 'pointer' }}>
        Done
      </button>
      <button type="button" onClick={onRemove} style={{ padding: '6px 10px', borderRadius: 6, fontSize: 13, background: 'transparent', color: 'var(--danger, #dc2626)', border: '1px solid var(--border-strong)', cursor: 'pointer' }}>
        Remove
      </button>
    </div>
  )
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 8 }}>{children}</div>
}

// SF = SmallField, STA = SmallTextarea (short names to keep editors readable)
function SF({ label, value, onChange, placeholder, flex }: {
  label: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string; flex?: number
}) {
  const [focus, setFocus] = useState(false)
  return (
    <label style={{ display: 'block', flex: flex ?? 1, minWidth: 0 }}>
      <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <input value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ width: '100%', height: 32, padding: '0 10px', fontSize: 13, border: `1px solid ${focus ? 'var(--accent)' : 'var(--border-strong)'}`, borderRadius: 6, outline: 'none', background: 'var(--surface)', boxShadow: focus ? '0 0 0 2px var(--accent-soft)' : 'none', transition: 'border-color 120ms, box-shadow 120ms' }}
      />
    </label>
  )
}

function STA({ label, value, onChange, placeholder, rows }: {
  label: string; value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string; rows?: number
}) {
  const [focus, setFocus] = useState(false)
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows ?? 3}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ width: '100%', padding: '8px 10px', fontSize: 13, lineHeight: 1.5, border: `1px solid ${focus ? 'var(--accent)' : 'var(--border-strong)'}`, borderRadius: 6, outline: 'none', background: 'var(--surface)', boxShadow: focus ? '0 0 0 2px var(--accent-soft)' : 'none', transition: 'border-color 120ms, box-shadow 120ms', resize: 'vertical' }}
      />
    </label>
  )
}

const iconBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 28, height: 28, borderRadius: 6, flexShrink: 0,
  background: 'transparent', border: '1px solid transparent',
  color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 120ms',
}

const smallBtn: React.CSSProperties = {
  fontSize: 12, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
  background: 'var(--surface)', border: '1px solid var(--border-strong)',
}

function Field({ label, hint, value, onChange, placeholder }: {
  label: string; hint?: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string
}) {
  const [focus, setFocus] = useState(false)
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>{label}</div>
      <input value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ width: '100%', height: 38, padding: '0 12px', border: `1px solid ${focus ? 'var(--accent)' : 'var(--border-strong)'}`, borderRadius: 'var(--radius-sm)', outline: 'none', boxShadow: focus ? '0 0 0 3px var(--accent-soft)' : 'none', background: 'var(--surface)', fontSize: 14, transition: 'border-color 120ms, box-shadow 120ms' }}
      />
      {hint && <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 4 }}>{hint}</div>}
    </label>
  )
}

function TextareaField({ label, hint, value, onChange, placeholder, rows }: {
  label: string; hint?: string; value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder: string; rows: number
}) {
  const [focus, setFocus] = useState(false)
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>{label}</div>
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ width: '100%', padding: '10px 12px', border: `1px solid ${focus ? 'var(--accent)' : 'var(--border-strong)'}`, borderRadius: 'var(--radius-sm)', outline: 'none', boxShadow: focus ? '0 0 0 3px var(--accent-soft)' : 'none', background: 'var(--surface)', fontSize: 14, lineHeight: 1.55, transition: 'border-color 120ms, box-shadow 120ms' }}
      />
      {hint && <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 4 }}>{hint}</div>}
    </label>
  )
}
