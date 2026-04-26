import { NextRequest, NextResponse } from 'next/server'
import { createCVDocx, createCoverLetterDocx } from '@/lib/createDocx'

export async function POST(req: NextRequest) {
  const { text, type, name } = await req.json()

  if (!text || !type || !name) {
    return NextResponse.json({ error: 'Missing required fields: text, type, name' }, { status: 400 })
  }

  if (type !== 'cv' && type !== 'cover') {
    return NextResponse.json({ error: 'type must be "cv" or "cover"' }, { status: 400 })
  }

  const buffer =
    type === 'cv' ? await createCVDocx(text, name) : await createCoverLetterDocx(text, name)

  const fileName =
    type === 'cv'
      ? `CV_${name.replace(/\s+/g, '_')}.docx`
      : `CoverLetter_${name.replace(/\s+/g, '_')}.docx`

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}
