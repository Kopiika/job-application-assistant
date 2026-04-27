'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import TabGenerate from '@/components/TabGenerate'
import TabProfile from '@/components/TabProfile'
import TabTracker from '@/components/TabTracker'
import { IconChevronRight } from '@/components/icons'
import type { Profile, Application } from '@/types'

type Tab = 'generate' | 'tracker' | 'profile'

const PROFILE_KEY = 'job-assistant-profile'
const APPS_KEY = 'job-assistant-apps'

const DEFAULT_PROFILE: Profile = {
  name: '', email: '', role: '',
  skills: '', experience: '', projects: '',
  education: '', languages: '', location: '', about: '',
}

const HEADERS: Record<Tab, { title: string; sub: string }> = {
  generate: { title: 'Generate documents', sub: 'Paste a job description and get a tailored CV and cover letter.' },
  tracker:  { title: 'Applications', sub: "Every role you've applied to, in one place." },
  profile:  { title: 'My profile', sub: 'The source material your documents are built from.' },
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('generate')
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE)
  const [applications, setApplications] = useState<Application[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const p = localStorage.getItem(PROFILE_KEY)
      if (p) setProfile(JSON.parse(p))
      const a = localStorage.getItem(APPS_KEY)
      if (a) setApplications(JSON.parse(a))
    } catch {}
    setHydrated(true)
  }, [])

  function saveProfile(p: Profile) {
    setProfile(p)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
  }

  function addApplication(app: Application) {
    const next = [app, ...applications]
    setApplications(next)
    localStorage.setItem(APPS_KEY, JSON.stringify(next))
    setTab('tracker')
  }

  function updateApplications(apps: Application[]) {
    setApplications(apps)
    localStorage.setItem(APPS_KEY, JSON.stringify(apps))
  }

  if (!hydrated) return null

  const header = HEADERS[tab]

  return (
    <div style={{ minHeight: '100vh' }}>
      <Sidebar tab={tab} setTab={setTab} appCount={applications.length} />

      <main style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 40px 60px', width: '100%' }}>
        {/* Breadcrumb + header */}
        <header style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Apply</span>
            <IconChevronRight size={11} />
            <span>{header.title}</span>
          </div>
          <h1 className="font-serif" style={{ fontSize: 30, fontWeight: 500, margin: 0, marginBottom: 6, letterSpacing: '-0.01em', color: 'var(--text)' }}>
            {header.title}
          </h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{header.sub}</div>
        </header>

        {tab === 'generate' && (
          <TabGenerate profile={profile} onSaveApplication={addApplication} />
        )}
        {tab === 'tracker' && (
          <TabTracker applications={applications} setApplications={updateApplications} />
        )}
        {tab === 'profile' && (
          <TabProfile profile={profile} onSave={saveProfile} />
        )}
      </main>
    </div>
  )
}
