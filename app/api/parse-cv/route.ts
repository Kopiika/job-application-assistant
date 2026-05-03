import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const isPdf = (file: File) =>
  file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'

const isDocx = (file: File) =>
  file.name.toLowerCase().endsWith('.docx') ||
  file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const PARSE_PROMPT = `Extract structured profile data from this CV.
Return ONLY a valid JSON object with this exact structure (omit fields you cannot find):
{
  "name": "string",
  "email": "string",
  "linkedin": "string (URL or empty)",
  "github": "string (URL or empty)",
  "role": "string (current role or most recent title)",
  "location": "string",
  "about": "string (summary/objective section, 1-2 sentences)",
  "skills": "string (comma-separated tech skills)",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "from": "string (e.g. Jan 2023)",
      "to": "string (e.g. Present)",
      "description": "string (brief context)",
      "bullets": "string (achievements one per line, no leading bullet char)",
      "tech": "string (tech used, dot-separated)"
    }
  ],
  "projects": [
    {
      "name": "string",
      "from": "string",
      "to": "string",
      "description": "string",
      "bullets": "string (one per line)",
      "tech": "string",
      "githubLink": "string",
      "demoLink": "string"
    }
  ],
  "education": [
    {
      "degree": "string",
      "school": "string",
      "from": "string",
      "to": "string",
      "description": "string"
    }
  ],
  "languages": [
    {
      "language": "string",
      "level": "string (e.g. Native, Fluent, Working proficiency)"
    }
  ]
}
Output nothing but the JSON object.`

async function parseWithClaude(content: Anthropic.MessageParam['content']): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content }],
  })
  return message.content[0].type === 'text' ? message.content[0].text : ''
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const maxBytes = 5 * 1024 * 1024
  if (file.size > maxBytes) {
    return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 413 })
  }

  if (!isPdf(file) && !isDocx(file)) {
    return NextResponse.json({ error: 'Unsupported file type. Use PDF or DOCX.' }, { status: 400 })
  }

  let raw: string
  try {
    if (isPdf(file)) {
      // Send PDF directly to Claude — no text extraction needed
      const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')
      raw = await parseWithClaude([
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: base64 },
        },
        { type: 'text', text: PARSE_PROMPT },
      ])
    } else {
      // DOCX → extract plain text → send to Claude
      const mammoth = await import('mammoth')
      const buffer = Buffer.from(await file.arrayBuffer())
      const { value: text } = await mammoth.extractRawText({ buffer })
      if (!text.trim()) {
        return NextResponse.json({ error: 'Could not extract text from DOCX' }, { status: 422 })
      }
      raw = await parseWithClaude([{ type: 'text', text: `${PARSE_PROMPT}\n\n${text.slice(0, 12000)}` }])
    }
  } catch (err) {
    console.error('[parse-cv] error:', err)
    return NextResponse.json({ error: 'Failed to process file', detail: String(err) }, { status: 500 })
  }

  let profile: Record<string, unknown>
  try {
    profile = JSON.parse(raw)
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) {
      return NextResponse.json({ error: 'Failed to parse CV data' }, { status: 500 })
    }
    profile = JSON.parse(match[0])
  }

  return NextResponse.json({ profile })
}