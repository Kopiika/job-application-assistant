'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import TabGenerate from '@/components/TabGenerate'
import TabProfile from '@/components/TabProfile'
import TabTracker from '@/components/TabTracker'
import { IconChevronRight } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Application } from '@/types'
import type { GenState } from '@/components/TabGenerate'

type Tab = 'generate' | 'tracker' | 'profile'

const DEFAULT_PROFILE: Profile = {
  name: '',
  email: '',
  linkedin: '',
  github: '',
  photo: undefined,
  role: '',
  skills: '',
  experience: [],
  projects: [],
  education: [],
  languages: [],
  location: '',
  about: '',
}

function migrateProfile(raw: unknown): Profile {
  const p = (raw ?? {}) as Record<string, unknown>
  return {
    name: (p.name as string) ?? '',
    email: (p.email as string) ?? '',
    linkedin: (p.linkedin as string) ?? '',
    github: (p.github as string) ?? '',
    photo: p.photo as string | undefined,
    role: (p.role as string) ?? '',
    skills: (p.skills as string) ?? '',
    experience: Array.isArray(p.experience) ? p.experience : [],
    projects: Array.isArray(p.projects) ? p.projects : [],
    education: Array.isArray(p.education) ? p.education : [],
    languages: Array.isArray(p.languages) ? p.languages : [],
    location: (p.location as string) ?? '',
    about: (p.about as string) ?? '',
  }
}

function rowToApplication(row: Record<string, unknown>): Application {
  return {
    id: row.id as string,
    company: (row.company as string) ?? '',
    role: (row.role as string) ?? '',
    location: (row.location as string) ?? '',
    status: (row.status as Application['status']) ?? 'draft',
    appliedOn: (row.applied_on as string) ?? '',
    updatedOn: (row.updated_on as string) ?? '',
    notes: (row.notes as string) ?? '',
    url: (row.url as string) ?? '',
    cvSummary: (row.cv_summary as string) ?? '',
    coverLetter: (row.cover_letter as string) ?? '',
    starred: (row.starred as boolean) ?? false,
  }
}

const HEADERS: Record<Tab, { title: string; sub: string }> = {
  generate: {
    title: 'Generate documents',
    sub: 'Paste a job description and get a tailored CV and cover letter.',
  },
  tracker: { title: 'Applications', sub: "Every role you've applied to, in one place." },
  profile: { title: 'My profile', sub: 'The source material your documents are built from.' },
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('generate')
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE)
  const [applications, setApplications] = useState<Application[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [genState, setGenState] = useState<GenState>({ status: 'idle' })

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profileRow }, { data: appRows }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('applications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])

      if (profileRow) setProfile(migrateProfile(profileRow))
      if (appRows) setApplications(appRows.map(rowToApplication))

      setHydrated(true)
    }
    load()
  }, [])

  async function saveProfile(p: Profile) {
    setProfile(p)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').upsert({
      id: user.id,
      ...p,
      updated_at: new Date().toISOString(),
    })
  }

  async function addApplication(app: Application) {
    const next = [app, ...applications]
    setApplications(next)
    setTab('tracker')
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('applications').insert({
      id: app.id,
      user_id: user.id,
      company: app.company,
      role: app.role,
      location: app.location,
      status: app.status,
      applied_on: app.appliedOn,
      updated_on: app.updatedOn,
      notes: app.notes,
      url: app.url,
      cv_summary: app.cvSummary,
      cover_letter: app.coverLetter,
      starred: app.starred,
    })
  }

  async function updateApplications(apps: Application[]) {
    setApplications(apps)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    await Promise.all(
      apps.map((app) =>
        supabase
          .from('applications')
          .update({
            company: app.company,
            role: app.role,
            location: app.location,
            status: app.status,
            applied_on: app.appliedOn,
            updated_on: app.updatedOn,
            notes: app.notes,
            url: app.url,
            cv_summary: app.cvSummary,
            cover_letter: app.coverLetter,
            starred: app.starred,
          })
          .eq('id', app.id)
          .eq('user_id', user.id)
      )
    )
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  if (!hydrated) return null

  const header = HEADERS[tab]

  return (
    <div style={{ minHeight: '100vh' }}>
      <Sidebar tab={tab} setTab={setTab} appCount={applications.length} onSignOut={handleSignOut} />

      <main style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 40px 60px', width: '100%' }}>
        <header style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-subtle)',
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>Apply</span>
            <IconChevronRight size={11} />
            <span>{header.title}</span>
          </div>
          <h1
            className="font-serif"
            style={{
              fontSize: 30,
              fontWeight: 500,
              margin: 0,
              marginBottom: 6,
              letterSpacing: '-0.01em',
              color: 'var(--text)',
            }}
          >
            {header.title}
          </h1>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{header.sub}</div>
        </header>

        {tab === 'generate' && (
          <TabGenerate
            profile={profile}
            onSaveApplication={addApplication}
            genState={genState}
            onGenStateChange={setGenState}
          />
        )}
        {tab === 'tracker' && (
          <TabTracker applications={applications} setApplications={updateApplications} />
        )}
        {tab === 'profile' && <TabProfile profile={profile} onSave={saveProfile} />}
      </main>
    </div>
  )
}
