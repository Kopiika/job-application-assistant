import type { Profile, TailoredFields, ProjectEntry } from '@/types'
import { serializeExperience, serializeProject, serializeEducation } from '@/lib/profileToCV'

export function mergeCVWithTailored(profile: Profile, tailored: TailoredFields): string {
  const lines: string[] = []

  if (profile.name) lines.push(profile.name)
  lines.push(tailored.position || profile.role)
  if (profile.email || profile.location) {
    lines.push([profile.email, profile.location].filter(Boolean).join(' · '))
  }

  lines.push('\nSUMMARY')
  lines.push(tailored.summary)

  lines.push('\nSKILLS')
  lines.push(tailored.skills)

  if (profile.experience.length) {
    lines.push('\nEXPERIENCE')
    lines.push(profile.experience.map(serializeExperience).join('\n\n'))
  }

  if (profile.projects.length) {
    lines.push('\nPROJECTS')
    const ordered = reorderProjects(profile.projects, tailored.projectsOrder)
    lines.push(ordered.map(serializeProject).join('\n\n'))
  }

  if (profile.education.length) {
    lines.push('\nEDUCATION')
    lines.push(profile.education.map(serializeEducation).join('\n\n'))
  }

  if (profile.languages) {
    lines.push('\nLANGUAGES')
    lines.push(profile.languages)
  }

  return lines.join('\n')
}

function reorderProjects(projects: ProjectEntry[], order: string[]): ProjectEntry[] {
  if (!order.length) return projects
  const result: ProjectEntry[] = []
  const used = new Set<number>()

  for (const name of order) {
    const idx = projects.findIndex(
      (p, i) => !used.has(i) && p.name.toLowerCase().includes(name.toLowerCase()),
    )
    if (idx !== -1) {
      result.push(projects[idx])
      used.add(idx)
    }
  }
  projects.forEach((p, i) => { if (!used.has(i)) result.push(p) })
  return result
}
