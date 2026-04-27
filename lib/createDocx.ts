import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  Packer,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  ImageRun,
  LevelFormat,
} from 'docx'

const ACCENT = '1A56A0'
const GRAY = '555555'
const LIGHT = '999999'
const DIVIDER_COLOR = '999999'

const CONTENT_W = 9026 // A4 content width

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

const SECTION_NAMES = [
  'SUMMARY',
  'SKILLS',
  'EXPERIENCE',
  'PROJECTS',
  'EDUCATION',
  'LANGUAGES',
] as const
type SectionName = (typeof SECTION_NAMES)[number]

interface CVSections {
  name: string
  position: string
  email: string
  location: string
  linkedin: string
  github: string
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

  // contactLine = "email · location · linkedin · github"
  const contactLine = headerLines[2] ?? ''
  const contactParts = contactLine.split(' · ').map((s) => s.trim())

  return {
    name: headerLines[0] ?? '',
    position: headerLines[1] ?? '',
    email: contactParts[0] ?? '',
    location: contactParts[1] ?? '',
    linkedin: contactParts[2] ?? '',
    github: contactParts[3] ?? '',
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
  return (
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)[\s\d–\-]/i.test(
      t
    ) || /^(Present|\d{4}[\s–\-])/i.test(t)
  )
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
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 6,
        color: DIVIDER_COLOR,
        space: 1,
      },
    },
    spacing: { after: 120 },
    children: [],
  })
}

function cell(
  children: Paragraph[],
  widthDxa: number,
  vAlign?: string,
  leftMargin?: number
): TableCell {
  return new TableCell({
    width: { size: widthDxa, type: WidthType.DXA },
    borders: CELL_NO_BORDER,
    verticalAlign: (vAlign ?? VerticalAlign.TOP) as 'top' | 'center' | 'bottom',
    margins: leftMargin ? { left: leftMargin, top: 0, bottom: 0, right: 0 } : undefined,
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

  const leftW = Math.floor(CONTENT_W * 0.75)
  const rightW = CONTENT_W - leftW

  const leftCell = new TableCell({
    width: { size: leftW, type: WidthType.DXA },
    borders: CELL_NO_BORDER,
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        spacing: { before: 180, after: subtitle ? 30 : 50 },
        children: [new TextRun({ text: title, bold: true, size: 22 })],
      }),
      ...(subtitle
        ? [
            new Paragraph({
              spacing: { after: 50 },
              children: [new TextRun({ text: subtitle, size: 20, color: ACCENT })],
            }),
          ]
        : []),
    ],
  })

  const rightCell = new TableCell({
    width: { size: rightW, type: WidthType.DXA },
    borders: CELL_NO_BORDER,
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 180 },
        children: [new TextRun({ text: date, size: 19, italics: true, color: GRAY })],
      }),
    ],
  })

  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [leftW, rightW],
    borders: TABLE_NO_BORDER,
    rows: [new TableRow({ children: [leftCell, rightCell] })],
  })
}

function renderSectionBlock(text: string): (Paragraph | Table)[] {
  if (!text) return []
  return text
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0)
    .map((line) => {
      const trimmed = line.trim()
      const isBullet = /^[•\-\*–]\s/.test(trimmed)
      const hasDot = trimmed.includes(' · ')

      if (isBullet) {
        return new Paragraph({
          numbering: { reference: 'bullets', level: 0 },
          spacing: { after: 60 },
          children: [new TextRun({ text: trimmed.replace(/^[•\-\*–]\s*/, ''), size: 20 })],
        })
      }

      if (hasDot) {
        const parts = trimmed.split(' · ')
        const isEntry = parts.length >= 2 && isDateLike(parts[parts.length - 1])
        if (isEntry) return renderEntryHeader(trimmed)

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
  const labelW = 2200
  const valueW = CONTENT_W - labelW

  const rows = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const colon = line.indexOf(':')
      if (colon === -1) {
        return new TableRow({
          children: [
            new TableCell({
              width: { size: labelW, type: WidthType.DXA },
              borders: CELL_NO_BORDER,
              children: [new Paragraph({ children: [] })],
            }),
            new TableCell({
              width: { size: valueW, type: WidthType.DXA },
              borders: CELL_NO_BORDER,
              children: [
                new Paragraph({
                  spacing: { after: 80 },
                  children: [new TextRun({ text: line, size: 20 })],
                }),
              ],
            }),
          ],
        })
      }
      const label = line.slice(0, colon).trim()
      const value = line.slice(colon + 1).trim()
      return new TableRow({
        children: [
          new TableCell({
            width: { size: labelW, type: WidthType.DXA },
            borders: CELL_NO_BORDER,
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [new TextRun({ text: label, bold: true, size: 20 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: valueW, type: WidthType.DXA },
            borders: CELL_NO_BORDER,
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [new TextRun({ text: value, size: 20 })],
              }),
            ],
          }),
        ],
      })
    })

  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [labelW, CONTENT_W - labelW],
    borders: TABLE_NO_BORDER,
    rows,
  })
}

function renderLanguagesTable(text: string): Table {
  const entries = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const colW = Math.floor(CONTENT_W / 2)

  const makeCell = (entry: string) => {
    const colon = entry.indexOf(':')
    if (colon === -1) {
      return new TableCell({
        width: { size: colW, type: WidthType.DXA },
        borders: CELL_NO_BORDER,
        children: [
          new Paragraph({
            spacing: { after: 80 },
            children: [new TextRun({ text: entry, size: 20 })],
          }),
        ],
      })
    }
    const lang = entry.slice(0, colon).trim()
    const level = entry.slice(colon + 1).trim()
    return new TableCell({
      width: { size: colW, type: WidthType.DXA },
      borders: CELL_NO_BORDER,
      children: [
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: lang + ': ', bold: true, size: 20 }),
            new TextRun({ text: level, size: 20 }),
          ],
        }),
      ],
    })
  }

  const rows: TableRow[] = []
  for (let i = 0; i < entries.length; i += 2) {
    const cells = [makeCell(entries[i])]
    cells.push(
      i + 1 < entries.length
        ? makeCell(entries[i + 1])
        : new TableCell({
            width: { size: colW, type: WidthType.DXA },
            borders: CELL_NO_BORDER,
            children: [new Paragraph({ children: [] })],
          })
    )
    rows.push(new TableRow({ children: cells }))
  }

  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [colW, colW],
    borders: TABLE_NO_BORDER,
    rows,
  })
}

function buildHeader(
  s: CVSections,
  displayName: string,
  photoBuffer?: Buffer
): (Paragraph | Table)[] {
  const contactItems = [s.email, s.location, s.linkedin, s.github].filter(Boolean)

  const contactParagraphs: Paragraph[] = contactItems.map(
    (item) =>
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: item, size: 19, color: GRAY })],
      })
  )

  if (photoBuffer) {
    const imgType = detectImageType(photoBuffer)
    const PHOTO_W = 1440 // 1 inch
    const GAP = 280
    const TEXT_W = CONTENT_W - PHOTO_W - GAP

    const photoCell = new TableCell({
      width: { size: PHOTO_W, type: WidthType.DXA },
      borders: CELL_NO_BORDER,
      verticalAlign: VerticalAlign.TOP,
      children: [
        new Paragraph({
          spacing: { after: 0 },
          children: [
            new ImageRun({
              type: imgType,
              data: photoBuffer,
              transformation: { width: 95, height: 95 },
            }),
          ],
        }),
      ],
    })

    const spacerCell = new TableCell({
      width: { size: GAP, type: WidthType.DXA },
      borders: CELL_NO_BORDER,
      children: [new Paragraph({ children: [] })],
    })

    const infoCell = new TableCell({
      width: { size: TEXT_W, type: WidthType.DXA },
      borders: CELL_NO_BORDER,
      verticalAlign: VerticalAlign.TOP,
      children: [
        new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: displayName, bold: true, size: 52 })],
        }),
        ...(s.position
          ? [
              new Paragraph({
                spacing: { after: 100 },
                children: [new TextRun({ text: s.position, size: 26, color: GRAY })],
              }),
            ]
          : []),
        ...contactParagraphs,
      ],
    })

    return [
      new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        columnWidths: [PHOTO_W, GAP, TEXT_W],
        borders: TABLE_NO_BORDER,
        rows: [new TableRow({ children: [photoCell, spacerCell, infoCell] })],
      }),
      new Paragraph({ spacing: { after: 200 }, children: [] }),
    ]
  }

  // without photo — center layout
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: displayName, bold: true, size: 52 })],
    }),
    ...(s.position
      ? [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [new TextRun({ text: s.position, size: 26, color: GRAY })],
          }),
        ]
      : []),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: contactItems.flatMap((item, i) => [
        new TextRun({ text: item, size: 20 }),
        ...(i < contactItems.length - 1
          ? [new TextRun({ text: '  ·  ', size: 20, color: LIGHT })]
          : []),
      ]),
    }),
  ]
}

export async function createCVDocx(
  cvText: string,
  name: string,
  photoBuffer?: Buffer
): Promise<Buffer> {
  const s = parseCVSections(cvText)
  const displayName = s.name || name

  const children: (Paragraph | Table)[] = [
    ...buildHeader(s, displayName, photoBuffer),

    ...(s.summary
      ? [
          sectionHeading('Summary'),
          sectionDivider(),
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ text: s.summary, size: 20 })],
          }),
        ]
      : []),

    ...(s.skills ? [sectionHeading('Skills'), sectionDivider(), renderSkillsTable(s.skills)] : []),

    ...(s.experience
      ? [sectionHeading('Experience'), sectionDivider(), ...renderSectionBlock(s.experience)]
      : []),
    ...(s.projects
      ? [sectionHeading('Projects'), sectionDivider(), ...renderSectionBlock(s.projects)]
      : []),
    ...(s.education
      ? [sectionHeading('Education'), sectionDivider(), ...renderSectionBlock(s.education)]
      : []),
    ...(s.languages
      ? [sectionHeading('Languages'), sectionDivider(), renderLanguagesTable(s.languages)]
      : []),
  ]

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 360, hanging: 180 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4
            margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }, // ~1.9cm margins
          },
        },
        children,
      },
    ],
  })

  return Packer.toBuffer(doc)
}

export async function createCoverLetterDocx(coverText: string, name: string): Promise<Buffer> {
  const paragraphs = coverText.split('\n').filter(Boolean)

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
          },
        },
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
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: DIVIDER_COLOR } },
            spacing: { after: 300 },
            children: [],
          }),
          ...paragraphs.map(
            (para) =>
              new Paragraph({
                spacing: { after: 200 },
                children: [new TextRun({ text: para, size: 22 })],
              })
          ),
        ],
      },
    ],
  })

  return Packer.toBuffer(doc)
}
