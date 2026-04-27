import {
  Document, Paragraph, TextRun, AlignmentType, Packer, BorderStyle,
  Table, TableRow, TableCell, WidthType, VerticalAlign, ImageRun,
} from 'docx'

const ACCENT = '2B5CE6'
const GRAY = '555555'
const LIGHT = '999999'

// US Letter, 1-inch margins each side → 6.5 inches = 9360 twips
const CONTENT_W = 9360

const TABLE_NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
}

const CELL_NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
}

const SECTION_NAMES = ['SUMMARY', 'SKILLS', 'EXPERIENCE', 'PROJECTS', 'EDUCATION', 'LANGUAGES'] as const
type SectionName = typeof SECTION_NAMES[number]

interface CVSections {
  name: string
  position: string
  contact: string
  summary: string
  skills: string
  experience: string
  projects: string
  education: string
  languages: string
}

function parseCVSections(text: string): CVSections {
  const lines = text.split('\n')
  const sectionContent: Partial<Record<SectionName, string[]>> = {}
  const headerLines: string[] = []
  let current: SectionName | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (SECTION_NAMES.includes(trimmed as SectionName)) {
      current = trimmed as SectionName
      sectionContent[current] = []
    } else if (current) {
      sectionContent[current]!.push(line)
    } else if (trimmed) {
      headerLines.push(trimmed)
    }
  }

  const getText = (key: SectionName) => (sectionContent[key] ?? []).join('\n').trim()

  return {
    name: headerLines[0] ?? '',
    position: headerLines[1] ?? '',
    contact: headerLines[2] ?? '',
    summary: getText('SUMMARY'),
    skills: getText('SKILLS'),
    experience: getText('EXPERIENCE'),
    projects: getText('PROJECTS'),
    education: getText('EDUCATION'),
    languages: getText('LANGUAGES'),
  }
}

function isDateLike(s: string): boolean {
  const t = s.trim()
  return /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)[\s\d–\-]/i.test(t)
    || /^(Present|\d{4}[\s–\-])/i.test(t)
}

function detectImageType(buf: Buffer): 'jpg' | 'png' {
  if (buf[0] === 0x89 && buf[1] === 0x50) return 'png'
  return 'jpg'
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 320, after: 80 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: ACCENT })],
  })
}

function sectionDivider(): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT } },
    spacing: { after: 120 },
    children: [],
  })
}

function cell(children: Paragraph[], widthDxa: number, vAlign?: string): TableCell {
  return new TableCell({
    width: { size: widthDxa, type: WidthType.DXA },
    borders: CELL_NO_BORDER,
    verticalAlign: (vAlign ?? VerticalAlign.TOP) as 'top' | 'center' | 'bottom',
    children,
  })
}

function renderEntryHeader(line: string): Table {
  const parts = line.split(' · ')
  const lastPart = parts[parts.length - 1]

  let title: string
  let subtitle: string
  let date: string

  if (isDateLike(lastPart) && parts.length >= 2) {
    date = lastPart.trim()
    title = parts[0].trim()
    subtitle = parts.slice(1, -1).join(' · ').trim()
  } else {
    date = ''
    title = parts[0].trim()
    subtitle = parts.slice(1).join(' · ').trim()
  }

  const leftCell = cell([
    new Paragraph({
      spacing: { before: 180, after: subtitle ? 30 : 50 },
      children: [new TextRun({ text: title, bold: true, size: 22 })],
    }),
    ...(subtitle ? [new Paragraph({
      spacing: { after: 50 },
      children: [new TextRun({ text: subtitle, size: 20, color: ACCENT })],
    })] : []),
  ], 7000, VerticalAlign.CENTER)

  const rightCell = cell([
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 180 },
      children: [new TextRun({ text: date, size: 19, italics: true, color: GRAY })],
    }),
  ], 2360, VerticalAlign.CENTER)

  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    borders: TABLE_NO_BORDER,
    rows: [new TableRow({ children: [leftCell, rightCell] })],
  })
}

function renderSectionBlock(text: string): (Paragraph | Table)[] {
  if (!text) return []
  return text.split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0)
    .map((line) => {
      const trimmed = line.trim()
      const isBullet = /^[•\-\*–]\s/.test(trimmed)
      const hasDot = trimmed.includes(' · ')

      if (isBullet) {
        return new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60 },
          children: [new TextRun({ text: trimmed.replace(/^[•\-\*–]\s*/, ''), size: 20 })],
        })
      }

      if (hasDot) {
        const parts = trimmed.split(' · ')
        const isEntry = parts.length >= 2 && isDateLike(parts[parts.length - 1])
        if (isEntry) return renderEntryHeader(trimmed)

        // tech stack line
        return new Paragraph({
          spacing: { before: 80, after: 100 },
          children: parts.flatMap((p, i) => [
            new TextRun({ text: p.trim(), size: 18, color: GRAY }),
            ...(i < parts.length - 1 ? [new TextRun({ text: ' · ', size: 18, color: LIGHT })] : []),
          ]),
        })
      }

      return new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: trimmed, size: 20 })],
      })
    })
}

function renderSkillsTable(text: string): Table {
  const rows = text.split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const colon = line.indexOf(':')
      if (colon === -1) {
        return new TableRow({
          children: [
            cell([new Paragraph({ children: [new TextRun({ text: '', size: 20 })] })], 2160),
            cell([new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: line, size: 20 })] })], 7200),
          ],
        })
      }
      const label = line.slice(0, colon).trim()
      const value = line.slice(colon + 1).trim()
      return new TableRow({
        children: [
          cell([new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: label, bold: true, size: 20 })] })], 2160),
          cell([new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: value, size: 20 })] })], 7200),
        ],
      })
    })

  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, borders: TABLE_NO_BORDER, rows })
}

function renderLanguagesTable(text: string): Table {
  const entries = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const colW = Math.floor(CONTENT_W / 2)

  const makeCell = (entry: string) => {
    const colon = entry.indexOf(':')
    if (colon === -1) {
      return cell([new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: entry, size: 20 })] })], colW)
    }
    const lang = entry.slice(0, colon).trim()
    const level = entry.slice(colon + 1).trim()
    return cell([
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: lang + ': ', bold: true, size: 20 }),
          new TextRun({ text: level, size: 20 }),
        ],
      }),
    ], colW)
  }

  const rows: TableRow[] = []
  for (let i = 0; i < entries.length; i += 2) {
    const cells = [makeCell(entries[i])]
    cells.push(i + 1 < entries.length
      ? makeCell(entries[i + 1])
      : cell([new Paragraph({ children: [] })], colW))
    rows.push(new TableRow({ children: cells }))
  }

  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, borders: TABLE_NO_BORDER, rows })
}

function buildHeader(s: CVSections, displayName: string, photoBuffer?: Buffer): (Paragraph | Table)[] {
  const contactParts = s.contact
    ? s.contact.split(' · ').flatMap((part, i, arr) => [
      new TextRun({ text: part, size: 20 }),
      ...(i < arr.length - 1 ? [new TextRun({ text: '  ·  ', size: 20, color: LIGHT })] : []),
    ])
    : []

  if (photoBuffer) {
    const imgType = detectImageType(photoBuffer)

    const photoCell = new TableCell({
      width: { size: 1500, type: WidthType.DXA },
      borders: CELL_NO_BORDER,
      verticalAlign: VerticalAlign.CENTER as 'center',
      children: [
        new Paragraph({
          spacing: { after: 0 },
          children: [
            new ImageRun({
              type: imgType,
              data: photoBuffer,
              transformation: { width: 105, height: 125 },
            }),
          ],
        }),
      ],
    })

    const infoChildren: Paragraph[] = [
      new Paragraph({
        spacing: { after: 50 },
        children: [new TextRun({ text: displayName, bold: true, size: 52 })],
      }),
      ...(s.position ? [new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({ text: s.position, size: 26, color: GRAY })],
      })] : []),
      ...(contactParts.length ? [new Paragraph({ spacing: { after: 0 }, children: contactParts })] : []),
    ]

    const infoCell = new TableCell({
      width: { size: 7860, type: WidthType.DXA },
      borders: CELL_NO_BORDER,
      verticalAlign: VerticalAlign.CENTER as 'center',
      children: infoChildren,
    })

    return [
      new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        borders: TABLE_NO_BORDER,
        rows: [new TableRow({ children: [photoCell, infoCell] })],
      }),
      new Paragraph({ spacing: { after: 200 }, children: [] }),
    ]
  }

  // No photo: centered layout
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: displayName, bold: true, size: 52 })],
    }),
    ...(s.position ? [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: s.position, size: 26, color: GRAY })],
    })] : []),
    ...(contactParts.length ? [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: contactParts,
    })] : []),
  ]
}

export async function createCVDocx(cvText: string, name: string, photoBuffer?: Buffer): Promise<Buffer> {
  const s = parseCVSections(cvText)
  const displayName = s.name || name

  const children: (Paragraph | Table)[] = [
    ...buildHeader(s, displayName, photoBuffer),

    ...(s.summary ? [
      sectionHeading('Summary'),
      sectionDivider(),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: s.summary, size: 20 })] }),
    ] : []),

    ...(s.skills ? [
      sectionHeading('Skills'),
      sectionDivider(),
      renderSkillsTable(s.skills),
    ] : []),

    ...(s.experience ? [sectionHeading('Experience'), sectionDivider(), ...renderSectionBlock(s.experience)] : []),
    ...(s.projects ? [sectionHeading('Projects'), sectionDivider(), ...renderSectionBlock(s.projects)] : []),
    ...(s.education ? [sectionHeading('Education'), sectionDivider(), ...renderSectionBlock(s.education)] : []),
    ...(s.languages ? [
      sectionHeading('Languages'),
      sectionDivider(),
      renderLanguagesTable(s.languages),
    ] : []),
  ]

  const doc = new Document({ sections: [{ children }] })
  return Packer.toBuffer(doc)
}

export async function createCoverLetterDocx(coverText: string, name: string): Promise<Buffer> {
  const paragraphs = coverText.split('\n').filter(Boolean)

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 400 },
          children: [new TextRun({ text: `${name} — ${today}`, size: 20, italics: true })],
        }),
        new Paragraph({
          spacing: { before: 0, after: 300 },
          children: [new TextRun({ text: 'Cover Letter', bold: true, size: 26, color: ACCENT })],
        }),
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT } },
          spacing: { after: 300 },
          children: [],
        }),
        ...paragraphs.map((para) =>
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ text: para, size: 22 })],
          }),
        ),
      ],
    }],
  })

  return Packer.toBuffer(doc)
}
