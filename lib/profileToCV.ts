import type { Profile } from '@/types'

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
  if (p.experience) {
    lines.push('\nEXPERIENCE')
    lines.push(p.experience)
  }
  if (p.projects) {
    lines.push('\nPROJECTS')
    lines.push(p.projects)
  }
  if (p.education) {
    lines.push('\nEDUCATION')
    lines.push(p.education)
  }
  if (p.languages) {
    lines.push('\nLANGUAGES')
    lines.push(p.languages)
  }

  return lines.join('\n')
}
