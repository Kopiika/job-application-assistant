import type { Profile, ExperienceEntry, ProjectEntry, EducationEntry } from '@/types'

function normalizeBullets(text: string): string {
  return text.split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (/^[•\-\*–]/.test(l) ? l : `• ${l}`))
    .join('\n')
}

export function serializeExperience(e: ExperienceEntry): string {
  const header = [e.title, e.company, e.location, [e.from, e.to].filter(Boolean).join(' – ')]
    .filter(Boolean).join(' · ')
  return [
    header,
    e.description.trim(),
    e.bullets.trim() ? normalizeBullets(e.bullets) : '',
    e.tech.trim(),
  ].filter(Boolean).join('\n\n')
}

export function serializeProject(p: ProjectEntry): string {
  const header = [p.name, [p.from, p.to].filter(Boolean).join(' – ')]
    .filter(Boolean).join(' · ')
  return [
    header,
    p.description.trim(),
    p.bullets.trim() ? normalizeBullets(p.bullets) : '',
    p.tech.trim(),
  ].filter(Boolean).join('\n\n')
}

export function serializeEducation(e: EducationEntry): string {
  const header = [e.degree, e.school, [e.from, e.to].filter(Boolean).join(' – ')]
    .filter(Boolean).join(' · ')
  return [header, e.description.trim()].filter(Boolean).join('\n\n')
}

export function profileToCV(p: Profile): string {
  const lines: string[] = []

  if (p.name) lines.push(p.name)
  if (p.role) lines.push(p.role)
  if (p.email || p.location) lines.push([p.email, p.location].filter(Boolean).join(' · '))

  if (p.about) {
    lines.push('\nABOUT')
    lines.push(p.about)
  }
  if (p.skills) {
    lines.push('\nSKILLS')
    lines.push(p.skills)
  }
  if (p.experience.length) {
    lines.push('\nEXPERIENCE')
    lines.push(p.experience.map(serializeExperience).join('\n\n'))
  }
  if (p.projects.length) {
    lines.push('\nPROJECTS')
    lines.push(p.projects.map(serializeProject).join('\n\n'))
  }
  if (p.education.length) {
    lines.push('\nEDUCATION')
    lines.push(p.education.map(serializeEducation).join('\n\n'))
  }
  if (p.languages) {
    lines.push('\nLANGUAGES')
    lines.push(p.languages)
  }

  return lines.join('\n')
}
