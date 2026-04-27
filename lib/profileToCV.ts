import type { Profile, ExperienceEntry, ProjectEntry, EducationEntry, LanguageEntry } from '@/types'

function normalizeBullets(text: string): string {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (/^[•\-\*–]/.test(l) ? l : `• ${l}`))
    .join('\n')
}

export function serializeExperience(e: ExperienceEntry): string {
  const header = [e.title, e.company, e.location, [e.from, e.to].filter(Boolean).join(' – ')]
    .filter(Boolean)
    .join(' · ')
  return [
    header,
    e.description.trim(),
    e.bullets.trim() ? normalizeBullets(e.bullets) : '',
    e.tech.trim(),
  ]
    .filter(Boolean)
    .join('\n\n')
}

export function serializeProject(p: ProjectEntry): string {
  const links = [p.githubLink, p.demoLink].filter(Boolean)
  const header = [p.name, ...links, [p.from, p.to].filter(Boolean).join(' – ')]
    .filter(Boolean)
    .join(' · ')
  return [
    header,
    p.description.trim(),
    p.bullets.trim() ? normalizeBullets(p.bullets) : '',
    p.tech.trim(),
  ]
    .filter(Boolean)
    .join('\n\n')
}

export function serializeEducation(e: EducationEntry): string {
  const header = [e.degree, e.school, [e.from, e.to].filter(Boolean).join(' – ')]
    .filter(Boolean)
    .join(' · ')
  return [header, e.description.trim()].filter(Boolean).join('\n\n')
}

export function serializeLanguages(entries: LanguageEntry[]): string {
  return entries.map((l) => `${l.language}: ${l.level}`).join('\n')
}

export function profileToCV(p: Profile): string {
  const lines: string[] = []

  if (p.name) lines.push(p.name)
  if (p.role) lines.push(p.role)

  const contactParts = [p.email, p.location, p.linkedin, p.github].filter(Boolean)
  if (contactParts.length) lines.push(contactParts.join(' · '))

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
  if (p.languages.length) {
    lines.push('\nLANGUAGES')
    lines.push(serializeLanguages(p.languages))
  }

  return lines.join('\n')
}
