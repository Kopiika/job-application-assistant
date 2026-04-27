'use client'

import { IconBriefcase, IconSparkles, IconLayers, IconUser } from '@/components/icons'

type Tab = 'generate' | 'tracker' | 'profile'

interface TopNavProps {
  tab: Tab
  setTab: (tab: Tab) => void
  appCount: number
}

const items: { key: Tab; label: string; icon: React.ReactNode; getHint: (count: number) => string }[] = [
  { key: 'generate',  label: 'Generate',     icon: <IconSparkles size={15} />, getHint: () => '' },
  { key: 'tracker',   label: 'Applications', icon: <IconLayers size={15} />,   getHint: (n) => n > 0 ? String(n) : '' },
  { key: 'profile',   label: 'My profile',   icon: <IconUser size={15} />,     getHint: () => '' },
]

export default function Sidebar({ tab, setTab, appCount }: TopNavProps) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 20,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      height: 56,
      gap: 32,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0, marginRight: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white',
        }}>
          <IconBriefcase size={15} />
        </div>
        <span className="font-serif" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1 }}>
          Apply
        </span>
      </div>

      {/* Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        {items.map((item) => {
          const active = tab === item.key
          const hint = item.getHint(appCount)
          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '0 12px',
                height: 56,
                fontSize: 13.5,
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--text)' : 'var(--text-muted)',
                borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                borderTop: '2px solid transparent',
                transition: 'color 120ms, border-color 120ms',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <span style={{ color: active ? 'var(--accent)' : 'inherit', display: 'flex' }}>
                {item.icon}
              </span>
              {item.label}
              {hint && (
                <span style={{
                  fontSize: 11, fontWeight: 500,
                  background: active ? 'var(--accent-soft)' : 'var(--surface-2)',
                  color: active ? 'var(--accent-hover)' : 'var(--text-subtle)',
                  padding: '1px 6px', borderRadius: 999,
                }}>
                  {hint}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </header>
  )
}
