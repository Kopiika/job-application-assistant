import type { Profile, TailoredFields } from '@/types'

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

  if (profile.experience) {
    lines.push('\nEXPERIENCE')
    lines.push(profile.experience)
  }

  if (profile.projects) {
    lines.push('\nPROJECTS')
    lines.push(reorderProjects(profile.projects, tailored.projectsOrder))
  }

  if (profile.education) {
    lines.push('\nEDUCATION')
    lines.push(profile.education)
  }

  if (profile.languages) {
    lines.push('\nLANGUAGES')
    lines.push(profile.languages)
  }

  return lines.join('\n')
}

function reorderProjects(projectsText: string, order: string[]): string {
  if (!order.length) return projectsText

  const blocks = projectsText.split(/\n\n+/).filter((b) => b.trim())
  const result: string[] = []
  const used = new Set<number>()

  for (const name of order) {
    const idx = blocks.findIndex(
      (b, i) => !used.has(i) && b.toLowerCase().includes(name.toLowerCase()),
    )
    if (idx !== -1) {
      result.push(blocks[idx])
      used.add(idx)
    }
  }

  blocks.forEach((b, i) => {
    if (!used.has(i)) result.push(b)
  })

  return result.join('\n\n')
}
