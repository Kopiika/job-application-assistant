'use client'

import { useState } from 'react'
import {
  IconPlus,
  IconSearch,
  IconMapPin,
  IconCalendar,
  IconChevronDown,
  IconCheck,
  IconBriefcase,
  IconStar,
  IconX,
} from '@/components/icons'
import type { Application, AppStatus } from '@/types'

const STATUS_CONFIG: Record<AppStatus, { label: string; bg: string; fg: string }> = {
  draft: { label: 'Draft', bg: 'var(--surface-2)', fg: 'var(--text-muted)' },
  applied: { label: 'Applied', bg: 'var(--info-soft)', fg: 'var(--info)' },
  interview: { label: 'Interview', bg: 'var(--warning-soft)', fg: 'oklch(0.5 0.13 75)' },
  offer: { label: 'Offer', bg: 'var(--success-soft)', fg: 'oklch(0.45 0.13 155)' },
  rejected: { label: 'Rejected', bg: 'var(--danger-soft)', fg: 'var(--danger)' },
}
const STATUS_ORDER: AppStatus[] = ['draft', 'applied', 'interview', 'offer', 'rejected']
const today = () => new Date().toISOString().slice(0, 10)

interface TabTrackerProps {
  applications: Application[]
  setApplications: (apps: Application[]) => void
}

export default function TabTracker({ applications, setApplications }: TabTrackerProps) {
  const [filter, setFilter] = useState<AppStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const filtered = applications.filter((a) => {
    if (filter !== 'all' && a.status !== filter) return false
    if (query && !`${a.company} ${a.role}`.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  const counts = STATUS_ORDER.reduce<Record<AppStatus, number>>(
    (acc, s) => {
      acc[s] = applications.filter((a) => a.status === s).length
      return acc
    },
    {} as Record<AppStatus, number>
  )

  function updateStatus(id: string, status: AppStatus) {
    setApplications(
      applications.map((a) => (a.id === id ? { ...a, status, updatedOn: today() } : a))
    )
  }

  function toggleStar(id: string) {
    setApplications(applications.map((a) => (a.id === id ? { ...a, starred: !a.starred } : a)))
  }

  function remove(id: string) {
    setApplications(applications.filter((a) => a.id !== id))
  }

  function addApp(
    app: Omit<Application, 'id' | 'updatedOn' | 'starred' | 'cvSummary' | 'coverLetter'>
  ) {
    setApplications([
      {
        ...app,
        id: 'a' + Date.now(),
        updatedOn: today(),
        starred: false,
        cvSummary: '',
        coverLetter: '',
      },
      ...applications,
    ])
  }

  return (
    <div>
      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 10,
          marginBottom: 20,
        }}
      >
        {STATUS_ORDER.map((s) => {
          const active = filter === s
          return (
            <button
              key={s}
              onClick={() => setFilter(active ? 'all' : s)}
              style={{
                padding: '14px 16px',
                textAlign: 'left',
                background: active ? 'var(--accent-soft)' : 'var(--surface)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 120ms',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--text-subtle)',
                }}
              >
                {STATUS_CONFIG[s].label}
              </div>
              <div
                className="font-serif"
                style={{
                  fontSize: 28,
                  fontWeight: 500,
                  marginTop: 4,
                  lineHeight: 1,
                  color: 'var(--text)',
                }}
              >
                {counts[s]}
              </div>
            </button>
          )
        })}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <IconSearch
            size={15}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-subtle)',
            }}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company or role…"
            style={{
              width: '100%',
              height: 36,
              padding: '0 12px 0 36px',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface)',
              outline: 'none',
              fontSize: 13.5,
            }}
          />
        </div>
        <div style={{ flex: 1 }} />
        {filter !== 'all' && (
          <button
            onClick={() => setFilter('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              color: 'var(--text)',
              border: '1px solid transparent',
            }}
          >
            <IconX size={14} /> Clear filter
          </button>
        )}
        <button
          onClick={() => setAddOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14,
            fontWeight: 500,
            background: 'var(--accent)',
            color: 'white',
            border: '1px solid var(--accent)',
          }}
        >
          <IconPlus size={14} /> Add manually
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: '60px 32px',
            textAlign: 'center',
            background: 'var(--surface)',
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius)',
            boxShadow: 'none',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              margin: '0 auto 14px',
              borderRadius: 12,
              background: 'var(--surface-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-subtle)',
            }}
          >
            <IconBriefcase size={22} />
          </div>
          <div
            className="font-serif"
            style={{ fontSize: 18, fontWeight: 500, marginBottom: 4, color: 'var(--text)' }}
          >
            {applications.length === 0 ? 'No applications yet' : 'No matches'}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>
            {applications.length === 0
              ? 'Generate documents and save to tracker, or add manually.'
              : 'Try a different filter or search.'}
          </div>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '32px minmax(0, 2fr) minmax(0, 1.5fr) minmax(0, 1fr) 120px 120px 40px',
              padding: '10px 18px',
              background: 'var(--surface-2)',
              borderBottom: '1px solid var(--border)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-subtle)',
              gap: 12,
            }}
          >
            <div />
            <div>Company / Role</div>
            <div>Location</div>
            <div>Status</div>
            <div>Applied</div>
            <div>Updated</div>
            <div />
          </div>
          {filtered.map((app, i) => (
            <AppRow
              key={app.id}
              app={app}
              isLast={i === filtered.length - 1}
              onStatusChange={updateStatus}
              onStar={() => toggleStar(app.id)}
              onRemove={() => remove(app.id)}
            />
          ))}
        </div>
      )}

      {addOpen && (
        <AddModal
          onClose={() => setAddOpen(false)}
          onAdd={(app) => {
            addApp(app)
            setAddOpen(false)
          }}
        />
      )}
    </div>
  )
}

function Badge({ status }: { status: AppStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        background: cfg.bg,
        color: cfg.fg,
      }}
    >
      {cfg.label}
    </span>
  )
}

function AppRow({
  app,
  isLast,
  onStatusChange,
  onStar,
  onRemove,
}: {
  app: Application
  isLast: boolean
  onStatusChange: (id: string, s: AppStatus) => void
  onStar: () => void
  onRemove: () => void
}) {
  const [hover, setHover] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false)
        setMenuOpen(false)
      }}
      style={{
        display: 'grid',
        gridTemplateColumns: '32px minmax(0, 2fr) minmax(0, 1.5fr) minmax(0, 1fr) 120px 120px 40px',
        padding: '14px 18px',
        gap: 12,
        alignItems: 'center',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        background: hover ? 'var(--surface-2)' : 'transparent',
        transition: 'background 100ms',
      }}
    >
      <button
        onClick={onStar}
        style={{
          width: 24,
          height: 24,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: app.starred ? 'var(--warning)' : 'var(--text-subtle)',
        }}
      >
        <IconStar
          size={15}
          style={{ fill: app.starred ? 'var(--warning)' : 'none' } as React.CSSProperties}
        />
      </button>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontWeight: 500,
            fontSize: 14,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {app.company}
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: 'var(--text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {app.role}
        </div>
      </div>

      <div
        style={{
          fontSize: 13,
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          minWidth: 0,
        }}
      >
        <IconMapPin size={13} style={{ flexShrink: 0 } as React.CSSProperties} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {app.location || '—'}
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <Badge status={app.status} />
          <IconChevronDown size={12} style={{ color: 'var(--text-subtle)' }} />
        </button>
        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 10,
              padding: 4,
              minWidth: 140,
            }}
          >
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                onClick={() => {
                  onStatusChange(app.id, s)
                  setMenuOpen(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 4,
                  fontSize: 13,
                  background: app.status === s ? 'var(--surface-2)' : 'transparent',
                }}
              >
                <Badge status={s} />
                {app.status === s && (
                  <IconCheck size={13} style={{ marginLeft: 'auto', color: 'var(--accent)' }} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: 12.5,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono), monospace',
        }}
      >
        {app.appliedOn || '—'}
      </div>
      <div
        style={{
          fontSize: 12.5,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono), monospace',
        }}
      >
        {app.updatedOn}
      </div>

      <button
        onClick={onRemove}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: hover ? 'var(--danger)' : 'transparent',
          transition: 'color 120ms',
        }}
      >
        <IconX size={14} />
      </button>
    </div>
  )
}

function AddModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (
    app: Omit<Application, 'id' | 'updatedOn' | 'starred' | 'cvSummary' | 'coverLetter'>
  ) => void
}) {
  const [form, setForm] = useState({
    company: '',
    role: '',
    location: '',
    status: 'applied' as AppStatus,
    url: '',
    notes: '',
    appliedOn: today(),
  })
  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div
      onClick={onClose}
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
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: 520,
          animation: 'popIn 200ms ease',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600 }}>Add application</div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', display: 'flex' }}>
            <IconX size={18} />
          </button>
        </div>
        <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <ModalField
              label="Company"
              value={form.company}
              onChange={set('company')}
              placeholder="e.g. Reaktor"
            />
            <ModalField
              label="Role"
              value={form.role}
              onChange={set('role')}
              placeholder="e.g. Junior Frontend"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <ModalField
              label="Location"
              value={form.location}
              onChange={set('location')}
              placeholder="Helsinki, Hybrid"
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
                Status
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 4,
                  padding: 3,
                  background: 'var(--surface-2)',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  flexWrap: 'wrap',
                }}
              >
                {STATUS_ORDER.map((s) => (
                  <button
                    key={s}
                    onClick={() => setForm((f) => ({ ...f, status: s }))}
                    style={{
                      flex: 1,
                      padding: '5px 4px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 500,
                      background: form.status === s ? 'var(--surface)' : 'transparent',
                      color: form.status === s ? 'var(--text)' : 'var(--text-muted)',
                      boxShadow: form.status === s ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <ModalField
            label="Applied on"
            type="date"
            value={form.appliedOn}
            onChange={set('appliedOn')}
            placeholder=""
          />
          <ModalField
            label="Job posting URL"
            value={form.url}
            onChange={set('url')}
            placeholder="https://…"
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
            onClick={() => {
              if (!form.company || !form.role) return
              onAdd(form)
            }}
            disabled={!form.company || !form.role}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              fontWeight: 500,
              background: 'var(--accent)',
              color: 'white',
              border: '1px solid var(--accent)',
              opacity: !form.company || !form.role ? 0.5 : 1,
              cursor: !form.company || !form.role ? 'not-allowed' : 'pointer',
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  type?: string
}) {
  const [focus, setFocus] = useState(false)
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
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
