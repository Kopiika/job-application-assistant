import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx'

export async function createCVDocx(cvText: string, name: string): Promise<Buffer> {
  const bullets = cvText
    .split('\n')
    .map((line) => line.replace(/^[•\-\*]\s*/, '').trim())
    .filter(Boolean)

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: name, bold: true, size: 32 })],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 200 },
            children: [new TextRun({ text: 'CV Summary', bold: true, size: 24 })],
          }),
          ...bullets.map(
            (bullet) =>
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 100 },
                children: [new TextRun({ text: bullet, size: 22 })],
              }),
          ),
        ],
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
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 400 },
            children: [new TextRun({ text: `${name} — ${today}`, size: 20, italics: true })],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 0, after: 300 },
            children: [new TextRun({ text: 'Cover Letter', bold: true, size: 24 })],
          }),
          ...paragraphs.map(
            (para) =>
              new Paragraph({
                spacing: { after: 200 },
                children: [new TextRun({ text: para, size: 22 })],
              }),
          ),
        ],
      },
    ],
  })

  return Packer.toBuffer(doc)
}
